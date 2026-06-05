"use client";

import Navbar from "@/components/nav";
import SplashScreen from "@/components/splash";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineFeed } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import SearchOverlay from "@/components/searchOverlay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import ProtectedRoutes from "@/components/protectedRoutes";

export default function MobileHome() {
  const [newsFeed, setNewsFeed] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/news");
        if (!response.ok) throw new Error("Failed to fetch news");
        const data = await response.json();
        setNewsFeed(data.newsFeed ?? []);
        setCategories(["All", ...(data.categories ?? []).filter((c) => c !== "All")]);
        setTrendingNews(data.trendingNews ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [retryCount]);

  const generateNewsExcerpt = (p) =>
    p?.trim().split(" ").slice(0, 4).join(" ") + "...";

  const cutTitle = (t) => {
    if (!t) return "";
    const words = t.trim().split(" ");
    return words.slice(0, 14).join(" ") + (words.length > 14 ? "." : "");
  };

  const filteredNews = newsFeed
    .filter((post) => {
      const categoryMatch =
        selectedCategory === "All" || post.categories.includes(selectedCategory);
      const searchMatch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    })
    .slice(0, 10);

  const showSkeleton = loading;

  return (
    <ProtectedRoutes>
      {/* Splash overlay — self-managing, renders on top */}
      <SplashScreen />

      <div className="h-auto bg-inherit">
        {/* Data skeleton while news loads */}
        {showSkeleton && (
          <div className="container mx-auto pt-12 pb-20 animate-pulse">
            <div className="w-full h-[300px] rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-6 flex space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              ))}
            </div>
            <div className="mt-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm gap-4">
                  <div className="min-w-[120px] w-[120px] h-[120px] rounded-lg bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">
              Could not load news. Check your connection.
            </p>
            <button
              onClick={() => { setError(null); setLoading(true); setRetryCount((c) => c + 1); }}
              className="px-6 py-2 bg-red-700 text-white text-sm font-semibold rounded-full hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!showSkeleton && !error && (
          <>
            <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-50/50 dark:bg-neutral-950/50 px-2 backdrop-blur-md shadow-sm">
              <div className="flex justify-between items-center p-4">
                <Image
                  src="/VC-2023.jpg"
                  alt="Valuechain Oil & Gas"
                  width={100}
                  height={40}
                  quality={85}
                  className="h-auto"
                />
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  aria-label="Search"
                >
                  <IoMdSearch className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                </button>
              </div>
            </nav>

            <div className="container mx-auto pt-12 pb-20">
              <Swiper
                slidesPerView={1}
                spaceBetween={10}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                modules={[Autoplay]}
                speed={3800}
                draggable
              >
                {trendingNews.map((news, index) => (
                  <SwiperSlide key={news.id}>
                    <Link href={`/news/${news.id}`}>
                      <div className="relative rounded-lg overflow-hidden shadow-md">
                        <Image
                          className="w-full h-[300px] object-cover"
                          src={news.image || "/VC-2023.jpg"}
                          alt={news.title}
                          width={800}
                          height={300}
                          quality={85}
                          priority={index === 0}
                          sizes="100vw"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3">
                          <h2 className="text-xl font-semibold">{news.title}</h2>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Category filter */}
              <div className="mt-6">
                <div className="mt-3 flex overflow-x-auto space-x-3 no-scrollbar">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center text-sm px-8 py-2 rounded-full border border-gray-300 dark:border-neutral-500 whitespace-nowrap ${
                        selectedCategory === category
                          ? "bg-red-700 border-none text-white"
                          : "bg-gray-100 dark:bg-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-600"
                      }`}
                    >
                      <MdOutlineFeed className="mr-2 text-md" />
                      {category.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* News list */}
              <h2 className="text-xl dark:text-neutral-200 font-bold mt-6">Latest News</h2>
              <ul className="mt-3 space-y-4">
                {filteredNews.length > 0 ? (
                  filteredNews.map((news) => (
                    <li key={news.id} className="flex p-4 bg-white shadow-sm rounded-lg dark:bg-neutral-950">
                      <Image
                        className="min-w-[120px] w-[120px] h-[120px] object-cover rounded-lg flex-shrink-0"
                        src={news.image || "/VC-2023.jpg"}
                        alt={news.title}
                        width={120}
                        height={120}
                        sizes="120px"
                      />
                      <Link href={`/news/${news.id}`} className="ml-4 flex flex-col space-y-1 min-w-0">
                        <h3 className="dark:text-neutral-300 text-sm leading-5 font-semibold">
                          {cutTitle(news.title)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-neutral-400">
                          {generateNewsExcerpt(news.excerpt)}
                        </p>
                      </Link>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">No news available in this category.</p>
                )}
              </ul>
            </div>
          </>
        )}

        <SearchOverlay
          open={searchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClose={() => setSearchOpen(false)}
        />
        <Navbar />
      </div>
    </ProtectedRoutes>
  );
}
