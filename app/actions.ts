export async function revalidatePWA(urls: string[]) {
  const baseUrl = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/pwa/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      urls,
      secret: process.env.REVALIDATION_SECRET,
    }),
  });
  return res.json();
}
