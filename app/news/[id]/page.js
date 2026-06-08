'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/nav';
import NavButtons from '@/components/navButtons';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { decode } from 'he';
import {
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoChevronBack,
  IoNewspaperOutline,
  IoReloadOutline,
} from 'react-icons/io5';
import ProtectedRoute from '@/components/protectedRoutes';

const cleanText = (value = '') =>
  decode(String(value))
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getParagraphs = (html = '') => {
  const text = decode(String(html))
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .trim();

  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Latest';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Latest';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

function ArticleSkeleton() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
        <div className="fixed left-0 top-0 z-50 h-16 w-full border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#090b10]/90" />
        <main className="mx-auto max-w-3xl px-4 pb-28 pt-24 animate-pulse">
          <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-4 h-10 w-11/12 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-3 h-10 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-6 h-80 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-7 space-y-4">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="h-4 rounded bg-neutral-200 dark:bg-neutral-800" />
            ))}
          </div>
        </main>
        <Navbar />
      </div>
    </ProtectedRoute>
  );
}

export default function NewsArticle() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (!id) return;

    async function fetchArticle() {
      setLoading(true);
      setNotFound(false);

      try {
        const response = await fetch(`/api/news?id=${encodeURIComponent(id)}`);
        if (response.status === 404 || !response.ok) {
          setNotFound(true);
          return;
        }
        const data = await response.json();
        if (data.error) {
          setNotFound(true);
          return;
        }
        setPost(data);
      } catch (err) {
        console.error('Error fetching article:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [id, retryCount]);

  const title = cleanText(post?.title);
  const categoryLabel = Array.isArray(post?.categories)
    ? post.categories[0]
    : post?.categories;
  const paragraphs = useMemo(() => getParagraphs(post?.content), [post?.content]);

  const handleShare = async () => {
    if (!navigator.share || !post) return;
    try {
      await navigator.share({
        title,
        text: 'Read this article from TheValueChain.',
        url: window.location.href,
      });
    } catch {
      // User cancelled or share failed.
    }
  };

  if (loading) return <ArticleSkeleton />;

  if (notFound || !post) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
          <nav className="fixed left-0 top-0 z-50 w-full border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#090b10]/90">
            <NavButtons onBack={() => router.back()} title="Article" />
          </nav>
          <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 pb-24 pt-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300">
              <IoAlertCircleOutline className="h-9 w-9" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-2xl font-black">Article not found</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              This story may have moved or the feed may be unavailable.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setRetryCount((count) => count + 1)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-700 px-6 text-sm font-bold text-white transition-colors hover:bg-red-600"
              >
                <IoReloadOutline className="h-5 w-5" aria-hidden="true" />
                Retry
              </button>
              <Link
                href="/news"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 text-sm font-bold text-neutral-800 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-neutral-100"
              >
                <IoChevronBack className="h-5 w-5" aria-hidden="true" />
                News list
              </Link>
            </div>
          </main>
          <Navbar />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f7fb] text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
        <nav className="fixed left-0 top-0 z-50 w-full border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#090b10]/90">
          <NavButtons onBack={() => router.back()} onShare={handleShare} title="Article" />
        </nav>

        <article className="mx-auto max-w-3xl px-4 pb-28 pt-24">
          <header>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-red-700 dark:text-red-300">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 dark:bg-red-500/10">
                <IoNewspaperOutline className="h-4 w-4" aria-hidden="true" />
                {categoryLabel || 'News'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-neutral-500 shadow-sm dark:bg-white/10 dark:text-neutral-300">
                <IoCalendarOutline className="h-4 w-4" aria-hidden="true" />
                {formatDate(post.date)}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
              {title || 'Untitled article'}
            </h1>
          </header>

          <div className="relative mt-7 overflow-hidden rounded-lg border border-black/10 bg-neutral-900 shadow-sm dark:border-white/10">
            <Image
              className="h-80 w-full object-cover sm:h-[26rem]"
              src={post.image || '/VC-2023.jpg'}
              alt={title || 'Article image'}
              width={1000}
              height={620}
              quality={85}
              priority
              sizes="(min-width: 768px) 768px, 100vw"
            />
          </div>

          <div className="mt-1 p-2 shadow-sm sm:p-3">
            {paragraphs.length > 0 ? (
              <div className="space-y-5 text-base leading-8 text-neutral-800 dark:text-neutral-200">
                {paragraphs.map((paragraph, index) => (
                  <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                No article body is available for this story.
              </p>
            )}
          </div>
        </article>

        <Navbar />
      </div>
    </ProtectedRoute>
  );
}
