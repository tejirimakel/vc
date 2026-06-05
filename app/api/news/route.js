export const runtime = 'nodejs'

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    const res = await fetch(process.env.WORDPRESS_API_URL, {
      next: { revalidate: 60 * 60 * 24 }, // 24h ISR
    })

    if (!res.ok) {
      throw new Error(`WP API error: ${res.status}`)
    }

    const posts = await res.json()

    // Sort newest first
    const sorted = posts.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )

    // Derive categories safely
    const categories = [
      ...new Set(
        sorted.flatMap(post =>
          Array.isArray(post.categories) && post.categories.length
            ? post.categories
            : ['Uncategorized']
        )
      ),
    ]

    // Single-article lookup by ID
    if (id) {
      const post = sorted.find(p => p.id.toString() === id);
      if (!post) {
        return new Response(JSON.stringify({ error: 'Article not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(post), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // Trending heuristic (recent + sticky / featured)
    const trending = sorted
      .filter(post => post.sticky || post.featured_media)
      .slice(0, 5)

    return new Response(
      JSON.stringify({
        newsFeed: sorted.slice(0, 10),
        trendingNews: trending.length ? trending : sorted.slice(0, 5),
        categories,
        lastUpdated: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
        },
      }
    )
  } catch (err) {
    console.error('News API error:', err)

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch news',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
