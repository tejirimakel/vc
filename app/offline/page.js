'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoCloudOfflineOutline, IoReloadOutline, IoArrowBackOutline } from 'react-icons/io5';

export default function OfflinePage() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [stillOffline, setStillOffline] = useState(false);
  const retryResetTimer = useRef(null);
  const onlineDebounce = useRef(null);

  // Auto-retry when connection is restored (debounced to handle flaky connections)
  useEffect(() => {
    const handleOnline = () => {
      clearTimeout(onlineDebounce.current);
      onlineDebounce.current = setTimeout(() => router.refresh(), 800);
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      clearTimeout(onlineDebounce.current);
    };
  }, [router]);

  // Reset retrying after 5s in case the refresh doesn't navigate away
  useEffect(() => {
    if (retrying) {
      retryResetTimer.current = setTimeout(() => setRetrying(false), 5000);
    }
    return () => clearTimeout(retryResetTimer.current);
  }, [retrying]);

  const handleRetry = () => {
    if (navigator.onLine) {
      setRetrying(true);
      router.refresh();
    } else {
      setStillOffline(true);
      setTimeout(() => setStillOffline(false), 3000);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gray-50 dark:bg-neutral-950">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-4 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
      >
        <IoArrowBackOutline className="w-4 h-4" />
        Back
      </button>

      {/* Icon */}
      <div className="mb-6 rounded-full bg-neutral-100 dark:bg-neutral-900 p-6">
        <IoCloudOfflineOutline className="w-14 h-14 text-neutral-400 dark:text-neutral-500" />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        You&apos;re Offline
      </h1>
      <p className="mt-3 max-w-xs text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        No internet connection detected. Previously viewed articles and PDFs are still available below.
      </p>

      {/* Inline message */}
      {stillOffline && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400 font-medium">
          Still offline — check your connection and try again.
        </p>
      )}

      {/* Retry button */}
      <button
        onClick={handleRetry}
        disabled={retrying}
        className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-red-700 text-white text-sm font-semibold rounded-full hover:bg-red-600 disabled:opacity-60 transition-colors"
      >
        <IoReloadOutline className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
        {retrying ? 'Retrying…' : 'Try Again'}
      </button>

      {/* Tip */}
      <p className="mt-8 text-xs text-neutral-400 dark:text-neutral-600">
        Reconnecting automatically when you&apos;re back online.
      </p>
    </main>
  );
}
