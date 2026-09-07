'use client';

import { useEffect, useState } from 'react';
import {
  IoAlertCircleOutline,
  IoCloudOfflineOutline,
  IoReloadOutline,
} from 'react-icons/io5';
import { useReconnect } from '@/lib/useReconnect';

// Route-segment error boundary. Catches render/navigation failures — including
// a route that cannot be fetched while offline — and shows a recoverable
// offline-aware screen instead of crashing to a generic application error.
export default function Error({ error, reset }) {
  const [online, setOnline] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  // Auto-recover the moment the network is genuinely reachable again. A hard
  // reload reliably re-runs the failed navigation (including re-fetching any
  // chunk that could not load offline) where reset() alone can stick.
  useReconnect(() => {
    setRetrying(true);
    window.location.reload();
  });

  const handleRetry = () => {
    setRetrying(true);
    reset();
  };

  const isOffline = !online;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fb] px-6 pb-24 text-center text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-lg ${
          isOffline
            ? 'bg-neutral-900 text-white dark:bg-white/10'
            : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
        }`}
      >
        {isOffline ? (
          <IoCloudOfflineOutline className="h-9 w-9" aria-hidden="true" />
        ) : (
          <IoAlertCircleOutline className="h-9 w-9" aria-hidden="true" />
        )}
      </div>

      <h1 className="mt-5 text-2xl font-black">
        {isOffline ? "You're offline" : 'Something went wrong'}
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        {isOffline
          ? "This page isn't available offline yet. We'll keep retrying automatically and reload it as soon as you're back online."
          : 'This screen failed to load. You can try again — saved pages may still be available offline.'}
      </p>

      <button
        onClick={handleRetry}
        disabled={retrying}
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-700 px-6 text-sm font-bold text-white shadow-lg shadow-red-700/20 transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700/35 disabled:cursor-wait disabled:opacity-70"
      >
        <IoReloadOutline
          className={`h-5 w-5 ${retrying ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        {retrying ? 'Retrying…' : 'Try again'}
      </button>

      <p
        aria-live="polite"
        className="mt-5 min-h-5 text-xs font-semibold text-neutral-500 dark:text-neutral-400"
      >
        {isOffline ? 'Reconnecting automatically when the signal returns.' : ''}
      </p>
    </main>
  );
}
