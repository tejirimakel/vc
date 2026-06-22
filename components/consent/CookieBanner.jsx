'use client';

import Link from 'next/link';
import { useConsent } from './ConsentProvider';

export default function CookieBanner() {
  const { status, ready, accept, reject } = useConsent();

  // Only show once we've read the stored choice and the visitor is undecided.
  if (!ready || status !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-black/10 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 shadow-[0_-14px_40px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-[#0b0e14]/95"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
          We use a strictly necessary cookie to run the app. With your consent we
          also load embedded video (YouTube) and analytics, which may set
          third-party cookies. See our{' '}
          <Link href="/cookies" className="font-semibold text-red-700 underline dark:text-red-400">
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="font-semibold text-red-700 underline dark:text-red-400">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={reject}
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/15 bg-white px-5 text-sm font-bold text-neutral-800 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900/15 dark:border-white/15 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/15"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={accept}
            className="inline-flex h-10 items-center justify-center rounded-full bg-red-700 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700/35"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
