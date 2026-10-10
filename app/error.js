'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RouteError({ error, reset }) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fb] px-6 text-center text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
      <h1 className="text-2xl font-black">Something went wrong</h1>
      <p role="alert" className="mt-2 max-w-sm text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        This page hit an unexpected error. You can try again or go back to the start.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center rounded-full bg-red-700 px-6 text-sm font-bold text-white transition-colors hover:bg-red-600"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-bold text-neutral-800 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-neutral-100"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
