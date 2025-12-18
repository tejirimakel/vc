export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) return new Response("Missing PDF URL", { status: 400 });

  try {
    // Use fetch with headers to mimic a browser request
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        Referer: "https://www.thevaluechainng.com/", // sometimes required
      },
    });

    if (!res.ok) return new Response("Failed to fetch PDF", { status: res.status });

    return new Response(res.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*", // allows your frontend to fetch
      },
    });
  } catch (err) {
    console.error("PDF proxy error:", err);
    return new Response("PDF proxy error", { status: 500 });
  }
}
