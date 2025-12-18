"use client";
import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useSearchParams, useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import Navbar from "@/components/nav";
import Link from "next/link";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

export default function EcopyDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const containerRef = useRef(null);

  const url = searchParams.get("url");
  const title = searchParams.get("title") || "PDF Document";

  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(345);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current)
        setContainerWidth(containerRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleBack = () => router.back();

  if (!url) return <div className="p-4 text-red-600">Missing PDF URL</div>;

  return (
    <div className="pt-12 pb-20 px-3" ref={containerRef}>
      <nav className="flex items-center justify-between fixed top-0 left-0 w-full z-50 bg-gray-50/60 dark:bg-neutral-950/50 px-6 py-4 backdrop-blur-md shadow-sm">
        <button
          onClick={handleBack}
          className="text-gray-800 dark:text-neutral-100"
        >
          <IoMdArrowRoundBack className="w-6 h-6" />
        </button>
        <Link href="/ecopy">
          <h2 className="text-xl dark:text-neutral-100 font-bold">Ecopy</h2>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-semibold mb-6 dark:text-neutral-100">
          {title}
        </h1>

        <Document
          file={`/api/pdf?url=${encodeURIComponent(url)}`}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(err) => {
            console.error("PDF load error:", err);
            setError("Error loading PDF");
          }}
          loading={<p>Loading document…</p>}
        >
          {numPages &&
            Array.from({ length: numPages }, (_, i) => (
              <Page
                key={`page_${i + 1}`}
                pageNumber={i + 1}
                width={containerWidth}
                className="mb-4 mx-auto"
              />
            ))}
        </Document>

        {numPages && (
          <p className="text-sm mt-4 text-center dark:text-neutral-300">
            Total Pages: {numPages}
          </p>
        )}

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      <Navbar />
    </div>
  );
}
