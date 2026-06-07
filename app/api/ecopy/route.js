import { NextResponse } from "next/server";

export const runtime = "edge"; 

export async function GET() {
  const API_URL = process.env.ECOPY_API_URL;

  if (!API_URL) {
    return NextResponse.json(
      { error: "ECOPY API URL not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(API_URL, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60 * 60 * 24 * 7,
        tags: ["ecopy-pdfs"],
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch PDFs from source" },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid PDF data format" },
        { status: 500 }
      );
    }

    const currentYear = new Date().getFullYear();
    const acceptedYears = [String(currentYear), String(currentYear - 1)];

    const filteredPdfs = data
      .filter(
        (pdf) =>
          typeof pdf?.title === "string" &&
          /value\s?chain/i.test(pdf.title) &&
          typeof pdf?.date === "string" &&
          acceptedYears.some((y) => pdf.date.startsWith(y)) &&
          typeof pdf?.url === "string"
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json(
      {
        count: filteredPdfs.length,
        pdfs: filteredPdfs,
        builtAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=86400",
        },
      }
    );
  } catch (error) {
    console.error("ECOPY API error:", error);

    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
