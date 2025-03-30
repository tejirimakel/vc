"use client";

import Navbar from "@/components/nav";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { MdOutlineFeed } from "react-icons/md";
import { IoMdNotifications } from "react-icons/io";
import { useRouter } from "next/navigation";

export default function MobileHome() {
  const [isLoading, setIsLoading] = useState(false);
  const [newsFeed, setNewsFeed] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [trendingNews, setTrendingNews] = useState([]);
  const router = useRouter();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/news", {
        next: { revalidate: 86400 }, // Cache for 24 hours
      });
      const data = await response.json();
      setNewsFeed(data.newsFeed);
      setCategories(data.categories);
      setTrendingNews(data.trendingNews);
    }

    fetchData();

    // Check if splash screen has already been shown
    if (!sessionStorage.getItem("splashShown")) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem("splashShown", "true");
      }, 2500);
    }
  }, []);

  const generateNewsExcerpt = (p) => {
    return p?.trim().split(" ").slice(0, 9).join(" ") + "...";
  };

  const filteredNews =
    selectedCategory === "All"
      ? newsFeed.slice(0, 10)
      : newsFeed.filter((post) => post.categories.includes(selectedCategory)).slice(0, 10);

  return (
    <div className="h-auto bg-inherit">
      {/* Show Splash Screen Only on First Visit */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black z-50 animate-fade-out">
          <Image
            src="/vc-2023.jpg"
            alt="Valuechain Logo"
            width={150}
            height={150}
            className="w-40 h-auto animate-pulse"
          />
        </div>
      )}

      {/* Show Main Content Only After Splash Screen */}
      {!isLoading && (
        <>
          <nav className="fixed top-0 left-0 w-full z-50 bg-gray-50/90 dark:bg-slate-950 px-2">
            <div className="flex justify-between items-center p-4">
              <div>
                <Image
                  className="w-full h-auto"
                  src="/img/vc-2023.jpg"
                  alt="Valuechain Oil & Gas"
                  width={100}
                  height={100}
                  quality={100}
                />
              </div>
              <div className="flex items-center">
                <IoMdNotifications className="w-5 h-5 text-gray-800 dark:text-gray-100" />
              </div>
            </div>
          </nav>

          <div className="container mx-auto pt-12 pb-12">
            <Swiper
              slidesPerView={1}
              spaceBetween={10}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              modules={[Autoplay]}
              speed={3800}
              draggable={true}
            >
              {trendingNews.map((news) => (
                <SwiperSlide key={news.id}>
                  <Link href={`/news/${news.id}`}>
                    <div className="relative rounded-lg overflow-hidden shadow-md">
                      <Image
                        className="w-full h-[300px] object-cover"
                        src={news.image || "/img/vc-2023.jpg"}
                        alt={news.title}
                        width={800}
                        height={800}
                        quality={100}
                        priority
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3">
                        <h2 className="text-2xl font-semibold">{news.title}</h2>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Filter Tabs */}
            <div className="mt-6">
              <div className="mt-3 flex overflow-x-auto space-x-3 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      router.push(`/mobile?category=${category}`, undefined, { shallow: true });
                    }}
                    className={`flex items-center px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 ${
                      selectedCategory === category
                        ? "bg-red-700 border-none text-white"
                        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <MdOutlineFeed className="w-5 h-5 mr-2" />
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* News List */}
            <h2 className="text-xl font-bold mt-6">Latest News</h2>
            <ul className="mt-3 space-y-4">
              {filteredNews.length > 0 ? (
                filteredNews.map((news) => (
                  <li key={news.id} className="flex p-4 bg-white shadow-sm rounded-lg dark:bg-gray-900">
                    <Image
                      className="w-35 h-32 object-cover rounded-lg"
                      src={news.image || "/img/vc-2023.jpg"}
                      alt={news.title}
                      width={350}
                      height={350}
                    />
                    <div className="ml-4 space-y-1">
                      <h3 className="text-lg leading-6 font-semibold">{news.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{generateNewsExcerpt(news.excerpt)}</p>
                      <div className="flex items-center justify-between">
                      <Link href={`/news/${news.id}`} className="text-red-700 text-md font-semibold">
                        Read More
                      </Link>
                      <p className="text-xs text-gray-600">{formatDate(news.date)}</p>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No news available in this category.</p>
              )}
            </ul>
          </div>
          <Navbar />
        </>
      )}
    </div>
  );
}
