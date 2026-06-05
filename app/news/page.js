'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/nav';
import NavButtons from '@/components/navButtons';
import ProtectedRoutes from '@/components/protectedRoutes';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
};

const cutTitle = (t) => {
  if (!t) return '';
  const words = t.trim().split(' ');
  return words.slice(0, 14).join(' ') + (words.length > 14 ? '.' : '');
};

function NewsSkeleton() {
  return (
    <div className="pt-14 pb-20 px-3 animate-pulse">
      <div className="h-7 bg-neutral-200 dark:bg-neutral-800 rounded w-40 mb-4" />
      <ul className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <li key={i} className="flex p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm gap-4">
            <div className="min-w-[120px] w-[120px] h-[120px] rounded-lg bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
              <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-20 mt-2" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-28" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NewsListPage() {
  const [newsFeed, setNewsFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => setNewsFeed(data.newsFeed || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Latest News', url: window.location.href }).catch(() => {});
    }
  };

  if (loading) return <NewsSkeleton />;

  return (
    <ProtectedRoutes>
      <div className="pt-14 pb-20 px-3 bg-inherit min-h-screen">
        <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-50/50 dark:bg-neutral-950/50 px-2 py-2 backdrop-blur-md shadow-sm">
          <NavButtons onBack={() => router.back()} onShare={handleShare} />
        </nav>

        <h1 className="text-xl dark:text-neutral-200 font-bold mt-2 mb-4">Latest News</h1>

        {error && (
          <p className="text-center text-red-600 py-10">Failed to load news. Please try again.</p>
        )}

        {!error && newsFeed.length === 0 && (
          <p className="text-center text-neutral-500 py-10">No articles available.</p>
        )}

        <ul className="space-y-4">
          {newsFeed.map((news) => (
            <li key={news.id} className="flex p-4 bg-white shadow-sm rounded-lg dark:bg-neutral-950">
              <Image
                className="min-w-[120px] w-[120px] h-[120px] object-cover rounded-lg flex-shrink-0"
                src={news.image || '/VC-2023.jpg'}
                alt={news.title}
                width={120}
                height={120}
              />
              <Link href={`/news/${news.id}`} className="ml-4 flex flex-col space-y-1 flex-1 min-w-0">
                <h3 className="dark:text-neutral-300 text-sm leading-5 font-semibold">
                  {cutTitle(news.title)}
                </h3>
                {news.categories?.[0] && (
                  <span className="bg-red-700 text-xs text-white rounded px-2 py-0.5 w-fit">
                    {news.categories[0]}
                  </span>
                )}
                <p className="text-xs text-gray-500 dark:text-neutral-400">{formatDate(news.date)}</p>
              </Link>
            </li>
          ))}
        </ul>

        <Navbar />
      </div>
    </ProtectedRoutes>
  );
}
