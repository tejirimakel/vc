"use client";
import Navbar from "@/components/nav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import ProtectedRoute from '@/components/protectedRoutes';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 6;
  const router = useRouter();

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/youtube");
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        setVideos(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const totalPages = Math.ceil(videos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const displayedVideos = videos.slice(startIndex, startIndex + videosPerPage);

  return (
    <ProtectedRoute>
      <div className="px-2 pt-14 pb-20">
        <nav className="flex items-center justify-between fixed top-0 left-0 w-full z-50 bg-gray-50/50 dark:bg-neutral-950/50 px-6 py-4 backdrop-blur-md shadow-sm">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="text-gray-800 dark:text-neutral-100"
          >
            <FaArrowLeft className="w-6 h-6" aria-hidden="true" />
          </button>
          <Link href="/video">
            <h2 className="text-xl dark:text-neutral-100 font-bold">Videos</h2>
          </Link>
        </nav>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg shadow-md bg-white dark:bg-neutral-900">
                <div className="w-full aspect-video bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                <div className="mt-2 h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex justify-center items-center h-screen">
            <p className="text-red-500 text-xl">Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {videos.length === 0 && (
              <p className="text-center text-gray-500 mt-10">No videos found.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedVideos.map((video, index) => (
                <div
                  key={video.id || `video-${index}`}
                  className="p-4 rounded-lg shadow-md bg-white dark:bg-neutral-900 hover:scale-[1.02] transition-transform"
                >
                  <iframe
                    width="100%"
                    height="180"
                    src={`https://www.youtube.com/embed/${video.id}?rel=0`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms"
                    allowFullScreen
                    className="rounded-lg"
                    loading="lazy"
                  />
                  <p className="mt-2 font-semibold dark:text-neutral-300 text-sm">{video.title}</p>
                </div>
              ))}
            </div>

            {videos.length > videosPerPage && (
              <div className="flex text-sm justify-center items-center mt-6 space-x-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={`flex items-center font-semibold px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? "text-neutral-400 dark:text-neutral-700 cursor-not-allowed"
                      : "dark:text-neutral-500 hover:text-red-700"
                  }`}
                >
                  <FaArrowLeft className="mr-2" aria-hidden="true" /> Previous
                </button>

                <span className="text-sm dark:text-neutral-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={`flex items-center font-semibold px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? "text-neutral-400 dark:text-neutral-700 cursor-not-allowed"
                      : "dark:text-neutral-500 hover:text-red-700"
                  }`}
                >
                  Next <FaArrowRight className="ml-2" aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}

        <Navbar />
      </div>
    </ProtectedRoute>
  );
}
