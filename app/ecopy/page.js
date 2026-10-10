'use client';

import Navbar from "@/components/nav";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoChevronBack,
  IoChevronForward,
  IoDocumentTextOutline,
  IoReloadOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { BsFiletypePdf } from "react-icons/bs";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { useFetch } from "@/lib/useFetch";

const DATE_OPTIONS = { year: "numeric", month: "short", day: "numeric" };
const EMPTY = [];

function PdfCard({ pdf }) {
  return (
    <article className="flex min-h-44 flex-col justify-between overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm transition-colors hover:border-red-700/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-red-300/40">
      <div className="flex items-start gap-4 p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300">
          <BsFiletypePdf className="h-9 w-9" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black leading-5 text-neutral-950 dark:text-neutral-100">
            {pdf.title}
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <IoCalendarOutline className="h-4 w-4" aria-hidden="true" />
            {formatDate(pdf.date, DATE_OPTIONS, "Latest edition")}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-black/10 px-4 py-3 text-xs font-bold text-neutral-500 dark:border-white/10 dark:text-neutral-400">
        <span>PDF edition</span>
        <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-300">
          Open
          <IoChevronForward className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function PdfSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-24 animate-pulse">
      <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-3 h-9 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-5 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-44 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        ))}
      </div>
    </div>
  );
}

export default function PdfPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const pdfsPerPage = 6;
  const router = useRouter();

  const { data, loading, error, retry } = useFetch("/api/ecopy", {
    select: (body) => body.pdfs || [],
  });
  const pdfs = data || EMPTY;

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const filteredPdfs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return pdfs;
    return pdfs.filter((pdf) =>
      `${pdf.title ?? ""} ${pdf.date ?? ""}`.toLowerCase().includes(normalizedQuery)
    );
  }, [pdfs, query]);

  const totalPages = Math.max(1, Math.ceil(filteredPdfs.length / pdfsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pdfsPerPage;
  const displayedPdfs = filteredPdfs.slice(startIndex, startIndex + pdfsPerPage);

  return (
    <>
      <div className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
        <nav className="fixed left-0 top-0 z-50 w-full border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#090b10]/90">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <button
              onClick={() => router.back()}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/85 text-neutral-800 shadow-sm backdrop-blur transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-700/25 dark:border-white/10 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/15"
              aria-label="Go back"
            >
              <IoChevronBack className="h-6 w-6" aria-hidden="true" />
            </button>
            <Link href="/ecopy" className="text-sm font-black text-neutral-900 dark:text-neutral-100">
              E-copy
            </Link>
            <div className="h-11 w-11" aria-hidden="true" />
          </div>
        </nav>

        {loading ? (
          <PdfSkeleton />
        ) : (
          <main className="mx-auto max-w-4xl px-4 pb-28 pt-24">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-red-700 dark:text-red-300">
                  Digital editions
                </p>
                <h1 className="mt-1 text-3xl font-black">E-copy Library</h1>
              </div>
              <p className="rounded-full bg-white px-3 py-1 text-xs font-bold text-neutral-500 shadow-sm dark:bg-white/10 dark:text-neutral-300">
                {filteredPdfs.length} files
              </p>
            </div>

            <label className="mt-5 flex h-12 items-center gap-3 rounded-full border border-black/10 bg-white px-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <IoSearchOutline className="h-5 w-5 text-red-700 dark:text-red-300" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search editions"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
                aria-label="Search PDF editions"
              />
            </label>

            {error ? (
              <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/20 dark:bg-red-500/10">
                <IoAlertCircleOutline className="mx-auto h-11 w-11 text-red-700 dark:text-red-300" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-black">Could not load editions</h2>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{error}</p>
                <button
                  onClick={retry}
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-bold text-white transition-colors hover:bg-red-600"
                >
                  <IoReloadOutline className="h-5 w-5" aria-hidden="true" />
                  Retry
                </button>
              </section>
            ) : displayedPdfs.length > 0 ? (
              <>
                <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="PDF editions">
                  {displayedPdfs.map((pdf) => (
                    <Link
                      key={pdf.id ?? pdf.url}
                      href={{
                        pathname: `/ecopy/${encodeURIComponent(pdf.id ?? pdf.title)}`,
                        query: { url: pdf.url, title: pdf.title },
                      }}
                    >
                      <PdfCard pdf={pdf} />
                    </Link>
                  ))}
                </section>

                {filteredPdfs.length > pdfsPerPage && (
                  <div className="mt-6 flex items-center justify-between rounded-lg border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={safeCurrentPage === 1}
                      className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-neutral-800 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400 dark:text-neutral-100 dark:hover:bg-white/10 dark:disabled:text-neutral-600"
                    >
                      <IoChevronBack className="h-5 w-5" aria-hidden="true" />
                      Prev
                    </button>
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                      Page {safeCurrentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={safeCurrentPage === totalPages}
                      className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-neutral-800 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400 dark:text-neutral-100 dark:hover:bg-white/10 dark:disabled:text-neutral-600"
                    >
                      Next
                      <IoChevronForward className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <section className="mt-8 rounded-lg border border-dashed border-black/15 bg-white/70 p-8 text-center dark:border-white/15 dark:bg-white/5">
                <IoDocumentTextOutline className="mx-auto h-11 w-11 text-neutral-400" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                  No PDF editions match this search.
                </p>
              </section>
            )}
          </main>
        )}

        <Navbar />
      </div>
    </>
  );
}
