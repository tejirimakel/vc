"use client";
import Navbar from "@/components/nav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Link from "next/link";
export default function PdfPage() {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pdfsPerPage = 6; // Number of PDFs per page
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/ecopy");
        if (!response.ok) {
          throw new Error("Failed to fetch PDFs");
        }
        const data = await response.json();
        setPdfs(data.pdfs || []); // Ensure pdfs is always an array
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
    <div className="pt-6 pb-12 px-3">
      <nav className="flex items-center justify-between fixed top-0 left-0 w-full z-50 bg-gray-50 dark:bg-slate-950 px-6 py-4">
        <button
          onClick={handleBack}
          className="text-gray-800 dark:text-gray-100/90 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <IoMdArrowRoundBack className="w-6 h-6" />
        </button>
        <Link href='/ecopy'>
        <h2 className="text-xl font-bold">Ecopy</h2>
        </Link>
      </nav>
      
      {loading ? (
        <p className="text-center text-xl">Loading PDFs...</p>
      ) : error ? (
        <p className="text-center text-red-500 text-xl">{error}</p>
      ) : pdfs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedPdfs.map((pdf, index) => (
              <div key={pdf.id || `pdf-${index}`} className="text-center py-4">
                <p className="mt-2 text-lg font-semibold">{pdf.title}</p>
                <embed
                  src={pdf.url}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                  className="mt-4 rounded-lg shadow-md w-full h-[60vh] sm:h-[70vh] md:h-[600px]"
                />
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pdfs.length > pdfsPerPage && (
            <div className="flex text-sm justify-center items-center mt-6 space-x-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-red-700"
                }`}
              >
                <FaArrowLeft className="mr-2" /> Previous
              </button>
              <span className="text-lg font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-red-700"
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
      <Navbar />
    </div>
  );
}
