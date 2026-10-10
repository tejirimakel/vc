"use client";

import Image from "next/image";
import Navbar from "@/components/nav";
import NavButtons from "@/components/navButtons";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IoAlertCircleOutline,
  IoCalendarClearOutline,
  IoChevronBack,
  IoChevronForward,
  IoGridOutline,
  IoLogoYoutube,
  IoPlayCircle,
  IoRefreshOutline,
  IoShareSocialOutline,
  IoTimeOutline,
  IoVideocamOutline,
} from "react-icons/io5";
import { cleanText, makeExcerpt } from "@/lib/text";
import { formatDate } from "@/lib/format";
import ConsentedYouTube from "@/components/consent/ConsentedYouTube";

const VIDEOS_PER_PAGE = 6;
const DATE_OPTIONS = { month: "short", day: "numeric", year: "numeric" };
const EXCERPT_OPTIONS = { words: 22, fallback: "Watch the latest video update from TheValueChain." };

const getThumbnail = (video) =>
  video?.thumbnailUrl || (video?.id ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` : "");

function VideoSkeleton() {
  return (
    <>
      <div className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
        <div className="fixed left-0 top-0 z-50 h-16 w-full border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#090b10]/90" />
        <main className="mx-auto max-w-6xl animate-pulse px-4 pb-28 pt-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="mt-3 h-10 w-44 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div className="h-9 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
            <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="aspect-video bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-3 p-4">
                <div className="h-6 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-3/5 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
            <div className="space-y-3 rounded-lg border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex gap-3 rounded-lg p-2">
                  <div className="h-20 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-3 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="rounded-lg border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="aspect-video rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-3 h-5 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-3 h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
        </main>
        <Navbar />
      </div>
    </>
  );
}

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    async function fetchVideos() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/youtube");
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        const items = data.items || [];

        if (!ignore) {
          setVideos(items);
          setSelectedVideoId((currentId) =>
            currentId && items.some((video) => video.id === currentId) ? currentId : items[0]?.id || null
          );
          setCurrentPage(1);
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchVideos();

    return () => {
      ignore = true;
    };
  }, [retryCount]);

  const selectedVideo = useMemo(() => {
    if (!videos.length) return null;
    return videos.find((video) => video.id === selectedVideoId) || videos[0];
  }, [selectedVideoId, videos]);

  const totalPages = Math.max(1, Math.ceil(videos.length / VIDEOS_PER_PAGE));
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
  const displayedVideos = videos.slice(startIndex, startIndex + VIDEOS_PER_PAGE);
  const latestVideos = videos.slice(0, 4);

  const selectVideo = (video) => {
    setSelectedVideoId(video.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = async () => {
    const shareData = {
      title: selectedVideo?.title || "TheValueChain Videos",
      url: selectedVideo?.link || window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
      return;
    }

    await navigator.clipboard?.writeText(shareData.url).catch(() => {});
  };

  if (loading) return <VideoSkeleton />;

  return (
    <>
      <div className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
        <nav className="fixed left-0 top-0 z-50 w-full border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#090b10]/90">
          <NavButtons onBack={() => router.back()} onShare={handleShare} title="Videos" />
        </nav>

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase text-red-700 dark:text-red-300">
                <IoLogoYoutube className="h-5 w-5" aria-hidden="true" />
                TheValueChain TV
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-normal sm:text-4xl">Video Library</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-neutral-500 shadow-sm dark:bg-white/10 dark:text-neutral-300">
              <IoGridOutline className="h-4 w-4 text-red-700 dark:text-red-300" aria-hidden="true" />
              {videos.length} videos
            </div>
          </div>

          {error && (
            <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/20 dark:bg-red-500/10">
              <IoAlertCircleOutline className="mx-auto h-11 w-11 text-red-700 dark:text-red-300" aria-hidden="true" />
              <h2 className="mt-3 text-xl font-black">Videos are unavailable</h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                The video feed could not be loaded right now.
              </p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-bold text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700/30"
              >
                <IoRefreshOutline className="h-5 w-5" aria-hidden="true" />
                Retry
              </button>
            </section>
          )}

          {!error && videos.length === 0 && (
            <section className="mt-8 rounded-lg border border-dashed border-black/15 bg-white/70 p-8 text-center dark:border-white/15 dark:bg-white/5">
              <IoVideocamOutline className="mx-auto h-11 w-11 text-neutral-400" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                No videos are available yet.
              </p>
            </section>
          )}

          {!error && selectedVideo && (
            <>
              <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
                <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="relative aspect-video bg-black">
                    <ConsentedYouTube
                      key={selectedVideo.id}
                      videoId={selectedVideo.id}
                      title={selectedVideo.title}
                      poster={getThumbnail(selectedVideo)}
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">
                      <span className="inline-flex items-center gap-1">
                        <IoCalendarClearOutline className="h-4 w-4 text-red-700 dark:text-red-300" aria-hidden="true" />
                        {formatDate(selectedVideo.published, DATE_OPTIONS)}
                      </span>
                      {selectedVideo.id === videos[0]?.id && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" aria-hidden="true" />
                          <span className="inline-flex items-center gap-1">
                            <IoTimeOutline className="h-4 w-4 text-red-700 dark:text-red-300" aria-hidden="true" />
                            Latest episode
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                      {cleanText(selectedVideo.title)}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                      {makeExcerpt(selectedVideo.description, EXCERPT_OPTIONS)}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        href={selectedVideo.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-bold text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700/30"
                      >
                        <IoLogoYoutube className="h-5 w-5" aria-hidden="true" />
                        Watch on YouTube
                      </a>
                      <button
                        type="button"
                        onClick={handleShare}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-bold text-neutral-800 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-700/25 dark:border-white/10 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/15"
                      >
                        <IoShareSocialOutline className="h-5 w-5" aria-hidden="true" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>

                <aside className="rounded-lg border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between px-1 pb-2">
                    <h2 className="text-sm font-black uppercase text-neutral-500 dark:text-neutral-300">
                      Up next
                    </h2>
                    <span className="text-xs font-bold text-red-700 dark:text-red-300">
                      Latest
                    </span>
                  </div>
                  <div className="space-y-2">
                    {latestVideos.map((video) => {
                      const isActive = selectedVideo.id === video.id;
                      return (
                        <button
                          key={video.id}
                          type="button"
                          onClick={() => selectVideo(video)}
                          className={`group flex w-full gap-3 rounded-lg p-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-red-700/25 ${
                            isActive
                              ? "bg-red-50 text-red-950 dark:bg-red-500/15 dark:text-red-50"
                              : "hover:bg-neutral-100 dark:hover:bg-white/10"
                          }`}
                        >
                          <span className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                            <Image
                              src={getThumbnail(video)}
                              alt=""
                              fill
                              sizes="128px"
                              className="object-cover opacity-90 transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                              <IoPlayCircle className="h-8 w-8 text-white drop-shadow" aria-hidden="true" />
                            </span>
                          </span>
                          <span className="min-w-0 flex-1 py-1">
                            <span className="line-clamp-2 text-sm font-bold leading-snug">
                              {cleanText(video.title)}
                            </span>
                            <span className="mt-2 block text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                              {formatDate(video.published, DATE_OPTIONS)}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </aside>
              </section>

              <section className="mt-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase text-red-700 dark:text-red-300">
                      Browse
                    </p>
                    <h2 className="text-2xl font-black">All Videos</h2>
                  </div>
                  {videos.length > VIDEOS_PER_PAGE && (
                    <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                      Page {currentPage} of {totalPages}
                    </p>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedVideos.map((video, index) => {
                    const isActive = selectedVideo.id === video.id;
                    return (
                      <article
                        key={video.id || `video-${index}`}
                        className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-colors dark:bg-white/5 ${
                          isActive
                            ? "border-red-700/40 ring-2 ring-red-700/15 dark:border-red-300/40"
                            : "border-black/10 hover:border-red-700/30 dark:border-white/10 dark:hover:border-red-300/40"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => selectVideo(video)}
                          className="group block w-full text-left focus:outline-none"
                        >
                          <span className="relative block aspect-video overflow-hidden bg-neutral-900">
                            <Image
                              src={getThumbnail(video)}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                              className="object-cover opacity-90 transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-red-700 shadow-lg">
                                <IoPlayCircle className="h-8 w-8" aria-hidden="true" />
                              </span>
                            </span>
                            {isActive && (
                              <span className="absolute left-3 top-3 rounded-full bg-red-700 px-3 py-1 text-xs font-bold text-white">
                                Now playing
                              </span>
                            )}
                          </span>
                          <span className="block p-4">
                            <span className="line-clamp-2 min-h-11 text-base font-black leading-snug">
                              {cleanText(video.title)}
                            </span>
                            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                              <IoCalendarClearOutline className="h-4 w-4 text-red-700 dark:text-red-300" aria-hidden="true" />
                              {formatDate(video.published, DATE_OPTIONS)}
                            </span>
                          </span>
                        </button>
                      </article>
                    );
                  })}
                </div>

                {videos.length > VIDEOS_PER_PAGE && (
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-bold text-neutral-800 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-700/25 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/15"
                    >
                      <IoChevronBack className="h-5 w-5" aria-hidden="true" />
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-4 text-sm font-bold text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <IoChevronForward className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        <Navbar />
      </div>
    </>
  );
}
