import { parseStringPromise } from 'xml2js'

export const runtime = 'nodejs'

export async function GET() {
  const channelId = process.env.CHANNEL_ID

  if (!channelId) {
    return new Response(
      JSON.stringify({ error: 'Missing CHANNEL_ID' }),
      { status: 500 }
    )
  }

  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`

  try {
    const res = await fetch(feedUrl, {
      next: { revalidate: 60 * 60 * 24 }, // 24h
    })

    if (!res.ok) {
      throw new Error(`YouTube feed error: ${res.status}`)
    }

    const xml = await res.text()
    const parsed = await parseStringPromise(xml)

    const entries = parsed?.feed?.entry || []

    const items = entries.slice(0, 10).map((entry) => {
      const rawId = entry.id?.[0] || ''
      const videoId = rawId.split(':').pop()

      const media = entry['media:group']?.[0]
      const thumbnail =
        media?.['media:thumbnail']?.[0]?.$?.url ||
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

      return {
        id: videoId,
        title: entry.title?.[0] || 'Untitled',
        description: media?.['media:description']?.[0] || '',
        thumbnailUrl: thumbnail,
        published: entry.published?.[0] || null,
        link: `https://www.youtube.com/watch?v=${videoId}`,
      }
    })

    return new Response(
      JSON.stringify({
        items,
        lastUpdated: new Date().toISOString(),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
        },
      }
    )
  } catch (err) {
    console.error('YouTube API error:', err)

    return new Response(
      JSON.stringify({ error: 'Failed to fetch videos' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
