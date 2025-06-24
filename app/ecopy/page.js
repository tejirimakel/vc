"use client";
import Navbar from "@/components/nav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import PdfViewerComponent from "@/components/PdfViewerComponent";

export default function PdfPage() {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pdfsPerPage = 6;
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/ecopy");
        if (!response.ok) {
          throw new Error("Failed to fetch PDFs");
        }
        const data = await response.json();
        setPdfs(data.pdfs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate pagination range
  const totalPages = Math.ceil(pdfs.length / pdfsPerPage);
  const startIndex = (currentPage - 1) * pdfsPerPage;
  const displayedPdfs = pdfs.slice(startIndex, startIndex + pdfsPerPage);

  return (
    <div className="pt-12 pb-20 px-3">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between fixed top-0 left-0 w-full z-50 bg-gray-50/90 dark:bg-neutral-950/50 px-6 py-4">
        <button
          onClick={() => router.back()}
          className="text-gray-800 dark:text-neutral-100"
        >
          <IoMdArrowRoundBack className="w-6 h-6" />
        </button>
        <Link href="/ecopy">
          <h2 className="text-xl dark:text-neutral-100 font-bold">Ecopy</h2>
        </Link>
      </nav>

      {/* Loading or Error Handling */}
      {loading ? (
        <p className="text-center text-xl">Loading PDFs...</p>
      ) : error ? (
        <p className="text-center text-red-500 text-xl">{error}</p>
      ) : pdfs.length > 0 ? (
        <>
          {/* PDF Viewer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {displayedPdfs.map((pdf) => (
              <Link
                key={pdf.id}
                href={{
                  pathname: `/ecopy/${pdf.id}`,
                  query: { url: pdf.url, title: pdf.title },
                }}
                className="hover:scale-[1.02] transition-transform"
              >
                <PdfViewerComponent
                  
                  pdfUrl={pdf.url}
                />
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {pdfs.length > pdfsPerPage && (
            <div className="flex text-sm justify-center items-center mt-6 space-x-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center ${
                  currentPage === 1
                    ? "text-gray-500 cursor-not-allowed"
                    : "hover:text-red-700"
                }`}
              >
                <FaArrowLeft className="mr-2" /> Previous
              </button>
              <span className="text-sm dark:text-neutral-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center ${
                  currentPage === totalPages
                    ? "text-gray-500 cursor-not-allowed"
                    : "hover:text-red-700"
                }`}
              >
                Next <FaArrowRight className="ml-2" />
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-xl">No PDFs available.</p>
      )}

      {/* Bottom Navbar */}
      <Navbar />
    </div>
  );
}
