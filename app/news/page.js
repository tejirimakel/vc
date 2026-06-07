'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { decode } from 'he';
import {
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoChevronForward,
  IoNewspaperOutline,
  IoReloadOutline,
  IoSearchOutline,
} from 'react-icons/io5';
import Navbar from '@/components/nav';
import NavButtons from '@/components/navButtons';
import ProtectedRoutes from '@/components/protectedRoutes';

const cleanText = (value = '') =>
  decode(String(value))
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const cutTitle = (value, limit = 16) => {
  const words = cleanText(value).split(' ');
  return words.slice(0, limit).join(' ') + (words.length > limit ? '...' : '');
};

const makeExcerpt = (value) => {
  const words = cleanText(value).split(' ').filter(Boolean);
  if (!words.length) return 'Read the full update from TheValueChain.';
  return words.slice(0, 20).join(' ') + (words.length > 20 ? '...' : '');
};

const formatDate = (dateString) => {
  if (!dateString) return 'Latest';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Latest';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

function NewsSkeleton() {
  return (
    <ProtectedRoutes>
      <div className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
        <div className="fixed left-0 top-0 z-50 h-16 w-full border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#090b10]/90" />
        <main className="mx-auto max-w-3xl px-4 pb-28 pt-24 animate-pulse">
          <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-3 h-9 w-56 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-5 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-6 h-52 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-5 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-black/5 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <div className="h-28 w-28 shrink-0 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-4 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <Navbar />
      </div>
    </ProtectedRoutes>
  );
}

export default function NewsListPage() {
  const [newsFeed, setNewsFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('/api/news')
      .then((response) => {
        if (!response.ok) throw new Error(`Server error ${response.status}`);
        return response.json();
      })
      .then((data) => setNewsFeed(data.newsFeed || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [retryCount]);

  const categories = useMemo(() => {
    const labels = newsFeed.flatMap((item) =>
      Array.isArray(item.categories) && item.categories.length ? item.categories : []
    );
    return ['All', ...new Set(labels)].slice(0, 8);
  }, [newsFeed]);

  const filteredNews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return newsFeed.filter((news) => {
      const categoriesForPost = Array.isArray(news.categories) ? news.categories : [];
      const categoryMatch =
        selectedCategory === 'All' || categoriesForPost.includes(selectedCategory);
      const searchable = `${cleanText(news.title)} ${cleanText(news.excerpt)}`.toLowerCase();
      return categoryMatch && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [newsFeed, query, selectedCategory]);

  const leadStory = filteredNews[0];
  const listStories = filteredNews.slice(leadStory ? 1 : 0);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Latest News', url: window.location.href }).catch(() => {});
    }
  };

  if (loading) return <NewsSkeleton />;

  return (
    <ProtectedRoutes>
      <div className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
        <nav className="fixed left-0 top-0 z-50 w-full border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#090b10]/90">
          <NavButtons onBack={() => router.back()} onShare={handleShare} title="Latest News" />
        </nav>

        <main className="mx-auto max-w-3xl px-4 pb-28 pt-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-red-700 dark:text-red-300">
                Newsroom
              </p>
              <h1 className="mt-1 text-3xl font-black">Latest News</h1>
            </div>
            <p className="rounded-full bg-white px-3 py-1 text-xs font-bold text-neutral-500 shadow-sm dark:bg-white/10 dark:text-neutral-300">
              {filteredNews.length} stories
            </p>
          </div>

          <label className="mt-5 flex h-12 items-center gap-3 rounded-full border border-black/10 bg-white px-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <IoSearchOutline className="h-5 w-5 text-red-700 dark:text-red-300" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search headlines"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
              aria-label="Search news"
            />
          </label>

          {categories.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar" aria-label="News categories">
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`h-10 shrink-0 rounded-full border px-4 text-sm font-bold transition-colors ${
                      active
                        ? 'border-red-700 bg-red-700 text-white shadow-sm shadow-red-700/20'
                        : 'border-black/10 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-center dark:border-red-500/20 dark:bg-red-500/10">
              <IoAlertCircleOutline className="mx-auto h-10 w-10 text-red-700 dark:text-red-300" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-black">Failed to load news</h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                The newsroom feed is unavailable right now.
              </p>
              <button
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-bold text-white transition-colors hover:bg-red-600"
              >
                <IoReloadOutline className="h-5 w-5" aria-hidden="true" />
                Retry
              </button>
            </section>
          )}

          {!error && !leadStory && (
            <section className="mt-8 rounded-lg border border-dashed border-black/15 bg-white/70 p-8 text-center dark:border-white/15 dark:bg-white/5">
              <IoNewspaperOutline className="mx-auto h-10 w-10 text-neutral-400" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                No articles match this view.
              </p>
            </section>
          )}

          {!error && leadStory && (
            <>
              <Link href={`/news/${leadStory.id}`} className="mt-6 block">
                <article className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm transition-colors hover:border-red-700/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-red-300/40">
                  <div className="relative h-56 bg-neutral-900">
                    <Image
                      src={leadStory.image || '/VC-2023.jpg'}
                      alt={cleanText(leadStory.title) || 'Lead story'}
                      fill
                      priority
                      sizes="(min-width: 768px) 768px, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-red-700 px-3 py-1 text-xs font-bold text-white">
                      Lead story
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-2xl font-black leading-tight">{cutTitle(leadStory.title, 18)}</h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                      {makeExcerpt(leadStory.excerpt)}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
                      <span className="inline-flex items-center gap-1">
                        <IoCalendarOutline className="h-4 w-4" aria-hidden="true" />
                        {formatDate(leadStory.date)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-300">
                        Read
                        <IoChevronForward className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>

              <ul className="mt-4 space-y-3">
                {listStories.map((news) => (
                  <li key={news.id ?? news.title}>
                    <Link
                      href={`/news/${news.id}`}
                      className="flex min-h-32 gap-3 rounded-lg border border-black/10 bg-white p-3 shadow-sm transition-colors hover:border-red-700/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-red-300/40"
                    >
                      <Image
                        className="h-28 w-28 shrink-0 rounded-lg object-cover"
                        src={news.image || '/VC-2023.jpg'}
                        alt={cleanText(news.title) || 'News image'}
                        width={128}
                        height={128}
                        sizes="128px"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold leading-5">{cutTitle(news.title)}</h3>
                        <p className="mt-2 text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                          {makeExcerpt(news.excerpt)}
                        </p>
                        <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                          <IoCalendarOutline className="h-4 w-4" aria-hidden="true" />
                          {formatDate(news.date)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </main>

        <Navbar />
      </div>
    </ProtectedRoutes>
  );
}
