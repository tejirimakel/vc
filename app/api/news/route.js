export const runtime = 'nodejs'

const WP_BASE = process.env.WORDPRESS_API_URL?.replace(/\/+$/, '');

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!WP_BASE) {
    return new Response(JSON.stringify({ error: 'API not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Direct single-article lookup — avoids fetching all posts for one ID
  if (id) {
    try {
      const res = await fetch(`${WP_BASE}/${id}`, {
        next: { revalidate: 60 * 60 * 24 },
      });
      if (res.status === 404) {
        return new Response(JSON.stringify({ error: 'Article not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (!res.ok) throw new Error(`WP API error: ${res.status}`);
      const post = await res.json();
      return new Response(JSON.stringify(post), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch (err) {
      console.error('News single-article error:', err);
      return new Response(JSON.stringify({ error: 'Failed to fetch article' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Feed: fetch all posts, sort, derive categories
  try {
    const res = await fetch(WP_BASE, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!res.ok) throw new Error(`WP API error: ${res.status}`);

    const posts = await res.json();

    const sorted = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const categories = [
      ...new Set(
        sorted.flatMap((post) =>
          Array.isArray(post.categories) && post.categories.length
            ? post.categories
            : ['Uncategorized']
        )
      ),
    ];

    const trending = sorted
      .filter((post) => post.sticky || post.featured_media)
      .slice(0, 5);

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
    );
  } catch (err) {
    console.error('News API error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch news' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
