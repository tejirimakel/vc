export async function GET() {
  const url = process.env.STREAM_URL;
  if (!url) {
    return Response.json({ error: 'Stream not configured' }, { status: 503 });
  }
  return Response.json({ url }, { headers: { 'Cache-Control': 'no-store' } });
}
