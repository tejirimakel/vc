'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  IoArrowBackOutline,
  IoCloudOfflineOutline,
  IoDocumentTextOutline,
  IoReloadOutline,
  IoShieldCheckmarkOutline,
  IoWifiOutline,
} from 'react-icons/io5';
import { useReconnect } from '@/lib/useReconnect';

export default function OfflinePage() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [stillOffline, setStillOffline] = useState(false);
  const retryResetTimer = useRef(null);

  // Reliably reload the moment the network is reachable again. navigator.onLine
  // and the 'online' event are unreliable on iOS / installed PWAs, so this
  // actively probes the network instead. A hard reload (not router.refresh)
  // re-runs the navigation through the service worker so the real page is
  // restored instead of a soft RSC refresh that can stick.
  useReconnect(() => {
    setRetrying(true);
    window.location.reload();
  });

  // Reset retrying after 5s in case the reload doesn't navigate away
  useEffect(() => {
    if (retrying) {
      retryResetTimer.current = setTimeout(() => setRetrying(false), 5000);
    }
    return () => clearTimeout(retryResetTimer.current);
  }, [retrying]);

  const handleRetry = () => {
    setRetrying(true);
    // Probe first so we don't trigger a reload that just returns offline again.
    fetch(`/manifest.json?_probe=${Date.now()}`, { cache: 'no-store' })
      .then((res) => {
        if (res && res.ok) {
          window.location.reload();
        } else {
          throw new Error('offline');
        }
      })
      .catch(() => {
        setRetrying(false);
        setStillOffline(true);
        setTimeout(() => setStillOffline(false), 3000);
      });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] px-5 py-6 text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(220,38,38,0.08),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(244,247,251,0.78))] dark:bg-[linear-gradient(120deg,rgba(220,38,38,0.16),transparent_42%),linear-gradient(180deg,rgba(18,20,28,0.94),rgba(7,8,12,0.96))]" />
      <div className="absolute inset-0 opacity-[0.24] dark:opacity-[0.16] bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.18)_1px,transparent_1px)] [background-size:24px_24px]" />

      <button
        onClick={() => router.back()}
        className="relative z-10 inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-700/30 dark:border-white/10 dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-white/15"
        aria-label="Go back"
      >
        <IoArrowBackOutline className="h-4 w-4" aria-hidden="true" />
        Back
      </button>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col items-center justify-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
          <span className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400" />
          Offline mode
        </div>

        <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <Image
            src="/VC-2023.jpg"
            alt="TheValueChain"
            width={74}
            height={74}
            priority
            className="rounded-xl object-cover"
          />
          <div className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-700 text-white shadow-lg shadow-red-700/25">
            <IoCloudOfflineOutline className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>

        <h1 className="max-w-2xl text-4xl font-black tracking-normal text-neutral-950 sm:text-6xl dark:text-white">
          You&apos;re offline
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
          TheValueChain cannot reach the network right now. Saved pages can still open while the app waits for your connection to return.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex h-12 min-w-40 items-center justify-center gap-2 rounded-full bg-red-700 px-6 text-sm font-bold text-white shadow-lg shadow-red-700/20 transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700/35 disabled:cursor-wait disabled:opacity-70"
          >
            <IoReloadOutline className={`h-5 w-5 ${retrying ? 'animate-spin' : ''}`} aria-hidden="true" />
            {retrying ? 'Retrying...' : 'Try again'}
          </button>
          <button
            onClick={() => router.back()}
            className="inline-flex h-12 min-w-40 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/75 px-6 text-sm font-bold text-neutral-800 shadow-sm backdrop-blur transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/15 dark:border-white/10 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/15"
          >
            <IoArrowBackOutline className="h-5 w-5" aria-hidden="true" />
            Go back
          </button>
        </div>

        <div
          aria-live="polite"
          className={`mt-5 min-h-6 text-sm font-semibold ${
            stillOffline ? 'text-red-700 dark:text-red-300' : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          {stillOffline
            ? 'Still offline. Check your connection and try again.'
            : 'Checking for a connection — this page reloads itself the moment you reconnect.'}
        </div>

        <div className="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
          {[
            { icon: IoDocumentTextOutline, label: 'Saved articles' },
            { icon: IoShieldCheckmarkOutline, label: 'Cached securely' },
            { icon: IoWifiOutline, label: 'Auto reconnect' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/65 px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-neutral-200"
            >
              <item.icon className="h-5 w-5 text-red-700 dark:text-red-300" aria-hidden="true" />
              {item.label}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
