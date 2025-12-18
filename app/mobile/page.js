"use client";

import Navbar from "@/components/nav";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineFeed } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import { useRouter } from "next/navigation";
import SearchOverlay from "@/components/searchOverlay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import ProtectedRoutes from "@/components/protectedRoutes";


export default function MobileHome() {
  const [isLoading, setIsLoading] = useState(false);
  const [newsFeed, setNewsFeed] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [trendingNews, setTrendingNews] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();


  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/news", {
        next: { revalidate: 86400 }, // Cache for 24 hours
      });
      const data = await response.json();
      setNewsFeed(data.newsFeed);
      setCategories(["All", ...data.categories.filter(c => c !== "All")]);
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
    return p?.trim().split(" ").slice(0, 4).join(" ") + "...";
  };

  const cutTitle = (t) => {
    return (
      t?.trim().split(" ").slice(0, 14).join(" ") +
      (t.split(" ").length > 14 ? "." : "")
    );
  };

  const filteredNews = newsFeed
    .filter((post) => {
      const categoryMatch =
        selectedCategory === "All" ||
        post.categories.includes(selectedCategory);

      const searchMatch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && searchMatch;
    })
    .slice(0, 12);

  return (
<ProtectedRoutes>
    <div className="h-auto bg-inherit">
      {!isLoading && (
        <>
          <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-50/50 dark:bg-neutral-950/50 px-2 backdrop-blur-md shadow-sm">
            <div className="flex justify-between items-center p-4">
              <div>
                <Image
                  className="w-full h-auto"
                  src="/VC-2023.jpg"
                  alt="Valuechain Oil & Gas"
                  width={100}
                  height={100}
                  quality={100}
                />
              </div>
              <div className="flex items-center">
              <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <IoMdSearch className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                  </button>
              </div>
            </div>
          </nav>

          <div className="container mx-auto pt-12 pb-20">
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
                        src={news.image || "/VC-2023.jpg"}
                        alt={news.title}
                        width={800}
                        height={800}
                        quality={100}
                        priority
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3">
                        <h2 className="text-xl font-semibold">{news.title}</h2>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Filter Tabs */}
            <div className="mt-6">
              <div className="mt-3 flex overflow-x-auto space-x-3 no-scrollbar">
                {categories.map((category) => {
                  const singleWordCategory = category.split(" ")[0]; // Extract first word only

                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        router.push(`/mobile?category=${category}`, undefined, {
                          shallow: true,
                        });
                      }}
                      className={`flex items-center justify-between text-sm px-8 py-2 rounded-full border border-gray-300 dark:border-neutral-500 ${
                        selectedCategory === category
                          ? "bg-red-700 border-none text-white dark:text-neutral-200"
                          : "bg-gray-100 dark:bg-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-600 dark:hover:text-neutral-400"
                      }`}
                    >
                      <MdOutlineFeed className="mr-2 text-md" />
                      {singleWordCategory}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* News List */}
            <h2 className="text-xl dark:text-neutral-200 font-bold mt-6">
              Latest News
            </h2>
            <ul className="mt-3 space-y-4">
              {filteredNews.length > 0 ? (
                filteredNews.map((news) => (
                  <li
                    key={news.id}
                    className="flex p-4 bg-white shadow-sm rounded-lg dark:bg-neutral-950"
                  >
                    <Image
                      className="min-w-30 w-30 h-30 object-cover rounded-lg"
                      src={news.image || "/VC-2023.jpg"}
                      alt={news.title}
                      width={350}
                      height={350}
                    />
                    <Link href={`/news/${news.id}`}>
                      <div className="ml-4 space-y-1 flex-col">
                        <h3 className="dark:text-neutral-300 text-md leading-5 font-semibold">
                          {cutTitle(news.title)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-neutral-400">
                          {generateNewsExcerpt(news.excerpt)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">
                  No news available in this category.
                </p>
              )}
            </ul>
          </div>
        </>
      )}
      <Navbar />
      <SearchOverlay
        open={searchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onClose={() => setSearchOpen(false)}
      />
    </div>
</ProtectedRoutes>
  );
}
