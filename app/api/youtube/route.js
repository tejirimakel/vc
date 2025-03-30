import { parseStringPromise } from 'xml2js';

export async function GET() {
  const channelId = process.env.CHANNEL_ID;
  const youtubeUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const response = await fetch(youtubeUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    const data = await response.text(); // Get the XML data as text

    // Convert XML to JSON
    const jsonData = await parseStringPromise(data);

    // Ensure the data structure exists
    if (!jsonData.feed || !jsonData.feed.entry) {
      throw new Error("Invalid YouTube feed data");
    }

    // Extract video details
    const items = jsonData.feed.entry.map((entry) => {
      const videoUrl = entry.id[0]; // The id contains a full URL
      const videoId = videoUrl.split(":").pop(); // Extract the last part as the actual video ID

      return {
        id: videoId,
        title: entry.title[0],
        thumbnailUrl: entry["media:group"][0]["media:thumbnail"][0].$.url, // Fix structure
        published: entry.published ? entry.published[0] : "Unknown",
        description: entry.summary ? entry.summary[0] : "No description available",
      };
    });

    // Return JSON response
    return new Response(JSON.stringify({ items }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch videos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
