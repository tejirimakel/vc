"use client";

import { useEffect } from "react";
import { IoMdClose, IoMdSearch } from "react-icons/io";

export default function MobileSearchOverlay({
  open,
  searchQuery,
  setSearchQuery,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;

    document.documentElement.classList.add("no-scroll");
    document.body.classList.add("no-scroll");

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="fixed left-0 right-0 top-0 z-[100] border-b border-black/10 bg-white/95 shadow-lg backdrop-blur animate-slideDown dark:border-white/10 dark:bg-[#090b10]/95"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3 p-4">
          <IoMdSearch className="h-5 w-5 text-red-700 dark:text-red-300" aria-hidden="true" />

          <input
            autoFocus
            type="search"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search news"
            className="min-h-11 flex-1 bg-transparent text-base text-neutral-900 outline-none placeholder-neutral-400 dark:text-neutral-100"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="rounded-lg px-2 py-1 text-sm font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Clear
            </button>
          )}

          <button
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/10"
          >
            <IoMdClose className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
