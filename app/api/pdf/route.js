const ALLOWED_ORIGINS = [
  'https://thevaluechainng.com',
  'https://www.thevaluechainng.com',
];

const FETCH_TIMEOUT_MS = 10_000;
const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50 MB ceiling

// Wrap the upstream body so it aborts if it exceeds MAX_PDF_BYTES, defending
// against a malicious/oversized source streaming through the proxy unbounded.
function capStream(body) {
  const reader = body.getReader();
  let received = 0;
  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      received += value.byteLength;
      if (received > MAX_PDF_BYTES) {
        await reader.cancel();
        controller.error(new Error('PDF exceeds size limit'));
        return;
      }
      controller.enqueue(value);
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        Referer: "https://www.thevaluechainng.com/",
      },
    });

    if (!res.ok) return new Response("Failed to fetch PDF", { status: res.status });

    const declaredLength = Number(res.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_PDF_BYTES) {
      return new Response("PDF too large", { status: 413 });
    }

    const host = new URL(req.url).origin;

    return new Response(res.body ? capStream(res.body) : null, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": host,
      },
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      console.error("PDF proxy timeout:", url);
      return new Response("PDF fetch timed out", { status: 504 });
    }
    console.error("PDF proxy error:", err);
    return new Response("PDF proxy error", { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
