"use client";

import Navbar from "@/components/nav";
import SplashScreen from "@/components/splash";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineFeed } from "react-icons/md";
import {
  IoAlertCircleOutline,
  IoChevronForward,
  IoNewspaperOutline,
  IoReloadOutline,
  IoSearchOutline,
  IoTimeOutline,
} from "react-icons/io5";
import SearchOverlay from "@/components/searchOverlay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import ProtectedRoutes from "@/components/protectedRoutes";
import { decode } from "he";

const cleanText = (value = "") =>
  decode(String(value))
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const makeExcerpt = (value) => {
  const text = cleanText(value);
  if (!text) return "Open the full story.";
  const words = text.split(" ");
  return words.slice(0, 16).join(" ") + (words.length > 16 ? "..." : "");
};

const cutTitle = (value, limit = 14) => {
  const text = cleanText(value);
  const words = text.split(" ");
  return words.slice(0, limit).join(" ") + (words.length > limit ? "..." : "");
};

const formatDate = (dateString) => {
  if (!dateString) return "Latest";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Latest";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
};

function FeedSkeleton() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-20 animate-pulse">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-2 h-7 w-44 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="h-11 w-11 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="h-[25rem] rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-6 flex gap-2 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 min-w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 rounded-lg border border-black/5 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="h-28 w-28 shrink-0 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/news");
        if (!response.ok) throw new Error("Failed to fetch news");
        const data = await response.json();
        setNewsFeed(data.newsFeed ?? []);
        setCategories(["All", ...(data.categories ?? []).filter((category) => category !== "All")]);
        setTrendingNews(data.trendingNews ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [retryCount]);

  const featuredNews = useMemo(
    () => (trendingNews.length ? trendingNews : newsFeed.slice(0, 3)),
    [newsFeed, trendingNews]
  );

  const filteredNews = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return newsFeed
      .filter((post) => {
        const postCategories = Array.isArray(post.categories) ? post.categories : [];
        const categoryMatch =
          selectedCategory === "All" || postCategories.includes(selectedCategory);
        const searchBody = `${cleanText(post.title)} ${cleanText(post.excerpt)}`.toLowerCase();
        const searchMatch = !normalizedQuery || searchBody.includes(normalizedQuery);
        return categoryMatch && searchMatch;
      })
      .slice(0, 10);
  }, [newsFeed, searchQuery, selectedCategory]);

  const handleRetry = () => setRetryCount((count) => count + 1);

  return (
    <ProtectedRoutes>
      <SplashScreen />

      <div className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
        {loading && <FeedSkeleton />}

        {!loading && error && (
          <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 pb-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300">
              <IoAlertCircleOutline className="h-9 w-9" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-2xl font-black">News did not load</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              Check your connection and try again. Saved pages may still be available offline.
            </p>
            <button
              onClick={handleRetry}
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-700 px-6 text-sm font-bold text-white shadow-lg shadow-red-700/20 transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700/35"
            >
              <IoReloadOutline className="h-5 w-5" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <nav className="fixed left-0 top-0 z-50 w-full border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#090b10]/90">
              <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Image
                    src="/VC-2023.jpg"
                    alt="Valuechain Oil & Gas"
                    width={112}
                    height={32}
                    quality={85}
                    className="h-auto max-w-[7rem] rounded bg-white object-contain p-1"
                    priority
                  />
                  <span className="hidden rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-500/10 dark:text-red-300 sm:inline-flex">
                    Live brief
                  </span>
                </div>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-800 shadow-sm transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-700/25 dark:border-white/10 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/15"
                  aria-label="Search"
                >
                  <IoSearchOutline className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </nav>

            <main className="mx-auto max-w-3xl px-4 pb-28 pt-20">
              <div className="mb-5">
                <p className="text-sm font-bold uppercase text-red-700 dark:text-red-300">
                  Today&apos;s briefing
                </p>
                <h1 className="mt-1 text-3xl font-black">Energy headlines</h1>
              </div>

              {featuredNews.length > 0 && (
                <Swiper
                  slidesPerView={1}
                  spaceBetween={12}
                  autoplay={{ delay: 4200, disableOnInteraction: false }}
                  modules={[Autoplay]}
                  speed={650}
                  grabCursor
                  className="overflow-hidden rounded-lg"
                >
                  {featuredNews.map((news, index) => (
                    <SwiperSlide key={news.id ?? news.title}>
                      <Link href={`/news/${news.id}`} className="block">
                        <article className="relative min-h-[25rem] overflow-hidden rounded-lg bg-neutral-900">
                          <Image
                            className="absolute inset-0 h-full w-full object-cover"
                            src={news.image || "/VC-2023.jpg"}
                            alt={cleanText(news.title) || "Featured news"}
                            width={900}
                            height={620}
                            quality={85}
                            priority={index === 0}
                            sizes="(min-width: 768px) 768px, 100vw"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.82)_84%)]" />
                          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                              <IoNewspaperOutline className="h-4 w-4" aria-hidden="true" />
                              Featured
                            </div>
                            <h2 className="text-2xl font-black leading-tight">
                              {cutTitle(news.title, 13)}
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-neutral-200">
                              {makeExcerpt(news.excerpt)}
                            </p>
                          </div>
                        </article>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}

              <div className="mt-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar" aria-label="News categories">
                {categories.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors ${
                        isActive
                          ? "border-red-700 bg-red-700 text-white shadow-sm shadow-red-700/20"
                          : "border-black/10 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10"
                      }`}
                    >
                      <MdOutlineFeed className="h-4 w-4" aria-hidden="true" />
                      {category.split(" ")[0]}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">Latest News</h2>
                  <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {filteredNews.length} stories available
                  </p>
                </div>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-1 text-sm font-bold text-red-700 dark:text-red-300"
                >
                  View all
                  <IoChevronForward className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <ul className="mt-3 space-y-3">
                {filteredNews.length > 0 ? (
                  filteredNews.map((news) => (
                    <li key={news.id ?? news.title}>
                      <Link
                        href={`/news/${news.id}`}
                        className="flex min-h-32 gap-3 rounded-lg border border-black/10 bg-white p-3 shadow-sm transition-colors hover:border-red-700/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-red-300/40"
                      >
                        <Image
                          className="h-28 w-28 shrink-0 rounded-lg object-cover"
                          src={news.image || "/VC-2023.jpg"}
                          alt={cleanText(news.title) || "News image"}
                          width={128}
                          height={128}
                          sizes="128px"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold leading-5 text-neutral-950 dark:text-neutral-100">
                            {cutTitle(news.title)}
                          </h3>
                          <p className="mt-2 text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                            {makeExcerpt(news.excerpt)}
                          </p>
                          <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            <IoTimeOutline className="h-4 w-4" aria-hidden="true" />
                            {formatDate(news.date)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="rounded-lg border border-dashed border-black/15 bg-white/60 px-4 py-8 text-center text-sm text-neutral-500 dark:border-white/15 dark:bg-white/5 dark:text-neutral-400">
                    No news available for this filter.
                  </li>
                )}
              </ul>
            </main>
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
