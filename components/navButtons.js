'use client';

import { IoMdArrowRoundBack } from "react-icons/io";
import { IoShareSocial } from "react-icons/io5";

export default function NavButtons({ onBack, onShare, title = "" }) {
  return (
    <div className="mx-auto flex max-w-3xl items-center justify-between px-3 py-2">
      <button
        onClick={onBack}
        aria-label="Go back"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/85 text-neutral-800 shadow-sm backdrop-blur transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-700/25 dark:border-white/10 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/15"
      >
        <IoMdArrowRoundBack className="h-6 w-6" aria-hidden="true" />
      </button>

      {title && (
        <p className="max-w-[56%] truncate text-sm font-bold text-neutral-800 dark:text-neutral-100">
          {title}
        </p>
      )}

      {onShare ? (
        <button
          onClick={onShare}
          aria-label="Share article"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/85 text-neutral-800 shadow-sm backdrop-blur transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-700/25 dark:border-white/10 dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white/15"
        >
          <IoShareSocial className="h-6 w-6" aria-hidden="true" />
        </button>
      ) : (
        <div className="h-11 w-11" aria-hidden="true" />
      )}
    </div>
  );
}
