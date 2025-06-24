export async function GET() {
  try {
    const res = await fetch(process.env.ECOPY_API_URL, {
      next: { revalidate: 60 * 60 * 24 * 365 }, // Cache for 1 year
    });

    if (!res.ok) throw new Error("Failed to fetch PDFs");

    const pdfs = await res.json();

    // Filter PDFs that contain "Value Chain" in their title (case insensitive) and have a date starting with "2025"
    const filteredPdfs = pdfs
      .filter((pdf) => /value\s?chain/i.test(pdf.title) && pdf.date?.startsWith("2025") && pdf.url)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (latest first)

    return new Response(JSON.stringify({ pdfs: filteredPdfs }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch PDFs" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
