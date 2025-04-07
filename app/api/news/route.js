export async function GET() {
  try {
    // Fetch data from WordPress API
    const response = await fetch(process.env.WORDPRESS_API_URL, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) throw new Error("Failed to fetch data");

    const data = await response.json();

    // Sort news in descending order (latest first)
    const sortedNews = data.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Prepare categories
    const categories = [...new Set(sortedNews.flatMap((post) => post.categories || ["Uncategorized"]))];

    // Return the processed data
    return new Response(
      JSON.stringify({
        newsFeed: sortedNews.slice(0, 10),  // Limit to 10 latest posts
        categories,
        trendingNews: sortedNews.slice(0, 5)  // Limit to 5 latest trending posts
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
