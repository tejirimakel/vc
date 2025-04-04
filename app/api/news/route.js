// /app/api/news/route.js
export async function GET() {
  try {
    // Fetch data from WordPress API
    const response = await fetch(process.env.WORDPRESS_API_URL, {
      next: { revalidate: 86400 }, // Cache for 24 hours (86400 seconds)
    });

    if (!response.ok) throw new Error("Failed to fetch data");

    const data = await response.json();

    // Prepare categories (you may customize the filtering logic)
    const categories = [...new Set(data.flatMap((post) => post.categories || ["Uncategorized"]))];

    // Return the processed data with caching headers
    return new Response(
      JSON.stringify({
        newsFeed: data.slice(0, 10),  // Limit to 10 posts
        categories,
        trendingNews: data.slice(0, 5)  // Limit to 5 trending posts
      }),
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=86400', // Ensure cache headers are set correctly
        },
      }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch news" }),
      { status: 500 }
    );
  }
}
