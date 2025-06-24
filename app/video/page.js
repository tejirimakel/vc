"use client";
import Navbar from "@/components/nav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 6; // Number of videos per page
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/youtube");
        if (!res.ok) {
          throw new Error("Failed to fetch videos");
        }
        const data = await res.json();
        setVideos(data.items || []); // Assuming API returns `items`
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(videos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const displayedVideos = videos.slice(startIndex, startIndex + videosPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse">
          <div className="w-80 h-40 bg-gray-300 dark:bg-neutral-700 rounded-lg mb-2"></div>
          <div className="w-56 h-4 bg-gray-300 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="px-2 pt-14 pb-20">
      <nav className="flex items-center justify-between fixed top-0 left-0 w-full z-50 bg-gray-50/50 dark:bg-neutral-950/50 px-6 py-4">
        <button
          onClick={handleBack}
          className="text-gray-800 dark:text-neutral-100"
        >
          <IoMdArrowRoundBack className="w-6 h-6" />
        </button>
        <Link href='/video'>
        <h2 className="text-xl dark:text-neutral-100 font-bold">Videos</h2>
        </Link>
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {displayedVideos.map((video, index) => (
          <div
            key={video.id || `video-${index}`}
            className="p-4 rounded-lg shadow-md bg-white dark:bg-neutral-900 hover:scale-[1.02] transition-transform"
          >
            <iframe
              width="100%"
              height="180"
              src={`https://www.youtube.com/embed/${video.id}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
            <p className="mt-2 font-semibold dark:text-neutral-300 text-md">{video.title}</p>
          </div>
        ))}
      </div>

      {/* Pagination Controls with Icons */}
      {videos.length > videosPerPage && (
        <div className="flex text-sm justify-center items-center mt-6 space-x-6">
          <button
            aria-disabled={currentPage === 1}
            className={`flex items-center font-semibold px-4 py-2 rounded-lg ${
              currentPage === 1
                ? "text-gray-500 dark:text-neutral-800 cursor-not-allowed"
                : "dark:text-neutral-200 hover:text-red-700"
            }`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
            aria-disabled={currentPage === totalPages}
            className={`flex items-center font-semibold  px-4 py-2 rounded-lg ${
              currentPage === totalPages
                ? "text-gray-500 dark:text-neutral-800 cursor-not-allowed"
                : "dark:text-neutral-200 hover:text-red-700"
            }`}
          >
            Next <FaArrowRight className="ml-2" />
          </button>
        </div>
      )}

      <Navbar />
    </div>
  );
}
