"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { useSearchParams, useRouter } from "next/navigation";
import {
  IoAlertCircleOutline,
  IoChevronBack,
  IoChevronForward,
  IoDownloadOutline,
  IoOpenOutline,
} from "react-icons/io5";
import Navbar from "@/components/nav";
import Link from "next/link";
import { configurePdfWorker } from "@/lib/pdfConfig";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

configurePdfWorker();

export default function EcopyDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const containerRef = useRef(null);

  const url = searchParams.get("url");
  const title = searchParams.get("title") || "PDF Document";
  const proxiedUrl = useMemo(
    () => (url ? `/api/pdf?url=${encodeURIComponent(url)}` : null),
    [url]
  );

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(345);
  const [error, setError] = useState(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.min(entry.contentRect.width, 820));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const goPrevious = () => setPageNumber((page) => Math.max(page - 1, 1));
  const goNext = () => setPageNumber((page) => Math.min(page + 1, numPages || page));

  if (!url) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <IoAlertCircleOutline className="h-12 w-12 text-red-700 dark:text-red-300" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-black">Missing PDF URL</h1>
          <Link
            href="/ecopy"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-red-700 px-6 text-sm font-bold text-white"
          >
            Back to e-copy
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50" ref={containerRef}>
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#090b10]/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/85 text-neutral-800 shadow-sm backdrop-blur transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-700/25 dark:border-white/10 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/15"
          >
            <IoChevronBack className="h-6 w-6" aria-hidden="true" />
          </button>
          <Link href="/ecopy" className="min-w-0 flex-1 text-center text-sm font-black text-neutral-900 dark:text-neutral-100">
            <span className="block truncate">E-copy Reader</span>
          </Link>
          <a
            href={proxiedUrl || "#"}
            download
            aria-label="Download PDF"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/85 text-neutral-800 shadow-sm backdrop-blur transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-700/25 dark:border-white/10 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/15"
          >
            <IoDownloadOutline className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 pb-28 pt-24">
        <header className="mb-5">
          <p className="text-sm font-bold uppercase text-red-700 dark:text-red-300">
            Digital edition
          </p>
          <h1 className="mt-2 text-2xl font-black leading-tight sm:text-4xl">{title}</h1>
        </header>

        <section className="rounded-lg border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-3 dark:border-white/10">
            <div className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
              {numPages ? `Page ${pageNumber} of ${numPages}` : "Loading document"}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrevious}
                disabled={pageNumber <= 1}
                className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-neutral-800 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400 dark:text-neutral-100 dark:hover:bg-white/10 dark:disabled:text-neutral-600"
              >
                <IoChevronBack className="h-5 w-5" aria-hidden="true" />
                Prev
              </button>
              <button
                onClick={goNext}
                disabled={!numPages || pageNumber >= numPages}
                className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-neutral-800 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400 dark:text-neutral-100 dark:hover:bg-white/10 dark:disabled:text-neutral-600"
              >
                Next
                <IoChevronForward className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg bg-neutral-100 p-2 dark:bg-black/30">
            <Document
              file={proxiedUrl}
              onLoadSuccess={({ numPages: pages }) => {
                setNumPages(pages);
                setPageNumber((page) => Math.min(page, pages));
                setError(null);
              }}
              onLoadError={(err) => {
                console.error("PDF load error:", err);
                setError("Error loading PDF");
              }}
              loading={
                <div className="h-[32rem] w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
              }
              error={
                <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-lg bg-red-50 p-6 text-center dark:bg-red-500/10">
                  <IoAlertCircleOutline className="h-11 w-11 text-red-700 dark:text-red-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-bold text-neutral-700 dark:text-neutral-200">
                    Error loading PDF
                  </p>
                </div>
              }
            >
              {numPages && (
                <Page
                  pageNumber={pageNumber}
                  width={containerWidth}
                  className="mx-auto overflow-hidden rounded-lg bg-white shadow-sm"
                />
              )}
            </Document>
          </div>
        </section>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300" role="alert">
            {error}
          </p>
        )}

        <a
          href={proxiedUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-bold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-100 dark:border-white/10 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/15"
        >
          <IoOpenOutline className="h-5 w-5" aria-hidden="true" />
          Open PDF in browser
        </a>
      </main>

      <Navbar />
    </div>
  );
}
