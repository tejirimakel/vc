"use client";

import Navbar from "@/components/nav";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import Link from "next/link";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

export default function EcopyDetailPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const title = searchParams.get("title") || "PDF Document";

  const [blobUrl, setBlobUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(410);

  const router = useRouter();
  const blobRef = useRef(null); // holds URL for cleanup

  const handleBack = () => router.back();


  useEffect(() => {
    setHasMounted(true);
  }, []);


  // Fetch and convert the PDF to blob URL
  useEffect(() => {
    if (!url) {
      setError("Missing PDF URL");
      return;
    }

    let active = true;

    const fetchPDF = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch PDF");
        const blob = await res.blob();
        const blobURL = URL.createObjectURL(blob);
        if (active) {
          blobRef.current = blobURL;
          setBlobUrl(blobURL);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load PDF.");
      }
    };

    fetchPDF();

    return () => {
      active = false;
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
      }
    };
  }, [url]);

  // Handle dynamic resizing
  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(Math.min(300, window.innerWidth - 40));
    };
    updateWidth();

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (!hasMounted) return null;
  if (error) return <div className="text-red-600 p-4">❌ {error}</div>;
  if (!blobUrl) return <div className="p-4">Loading PDF...</div>;

  return (
    <div className="pt-12 pb-20 px-3">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between fixed top-0 left-0 w-full z-50 bg-gray-50/90 dark:bg-neutral-950/50 px-6 py-4">
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

      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-6 dark:text-neutral-100">
          {title}
        </h1>

        <Document
          file={blobUrl}
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
      </div>

      <Navbar />
    </div>
  );
}
