const ALLOWED_ORIGINS = [
  'https://thevaluechainng.com',
  'https://www.thevaluechainng.com',
];

function isAllowedUrl(raw) {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_ORIGINS.some((origin) => parsed.origin === origin);
  } catch {
    return false;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) return new Response("Missing PDF URL", { status: 400 });
  if (!isAllowedUrl(url)) return new Response("Forbidden URL", { status: 403 });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        Referer: "https://www.thevaluechainng.com/",
      },
    });

    if (!res.ok) return new Response("Failed to fetch PDF", { status: res.status });

    const host = new URL(req.url).origin;

    return new Response(res.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": host,
      },
    });
  } catch (err) {
    console.error("PDF proxy error:", err);
    return new Response("PDF proxy error", { status: 500 });
  }
}
