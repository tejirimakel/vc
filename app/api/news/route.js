export const runtime = 'nodejs'

const WP_BASE = process.env.WORDPRESS_API_URL?.replace(/\/+$/, '');
const NEWS_REVALIDATE_SECONDS = 60 * 60 * 24;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(status === 200 ? { 'Cache-Control': 'public, max-age=86400' } : {}),
    },
  });
}

async function fetchNewsFeed() {
  const res = await fetch(WP_BASE, {
    next: { revalidate: NEWS_REVALIDATE_SECONDS },
  });

  if (!res.ok) throw new Error(`WP API error: ${res.status}`);

  const posts = await res.json();
  if (!Array.isArray(posts)) throw new Error('WP API returned non-array news feed');

  return posts;
}

async function fetchDirectArticle(id) {
  const res = await fetch(`${WP_BASE}/${encodeURIComponent(id)}`, {
    next: { revalidate: NEWS_REVALIDATE_SECONDS },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`WP single-article error: ${res.status}`);

  const post = await res.json();
  return post && !Array.isArray(post) ? post : null;
}

function findPostById(posts, id) {
  return posts.find((post) => String(post?.id) === String(id));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!WP_BASE) {
    return new Response(JSON.stringify({ error: 'API not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (id) {
    try {
      let post = await fetchDirectArticle(id).catch((error) => {
        console.warn('Direct news article lookup failed; falling back to feed:', error);
        return null;
      });

      if (!post) {
        const posts = await fetchNewsFeed();
        post = findPostById(posts, id);
      }

      if (!post) return jsonResponse({ error: 'Article not found' }, 404);

      return jsonResponse(post);
    } catch (err) {
      console.error('News single-article error:', err);
      return jsonResponse({ error: 'Failed to fetch article' }, 500);
    }
  }

  // Feed: fetch all posts, sort, derive categories
  try {
    const posts = await fetchNewsFeed();
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
      200
    );
  } catch (err) {
    console.error('News API error:', err);
    return jsonResponse({ error: 'Failed to fetch news' }, 500);
  }
}
