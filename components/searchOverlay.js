"use client";

import { IoMdClose, IoMdSearch } from "react-icons/io";

export default function MobileSearchOverlay({
  open,
  searchQuery,
  setSearchQuery,
  onClose,
}) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40"
      />

      {/* Slide-down panel */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-950 shadow-md animate-slideDown">
        <div className="flex items-center gap-3 p-4 border-b dark:border-neutral-800">
          <IoMdSearch className="w-5 h-5 text-neutral-500" />

          <input
            autoFocus
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-neutral-900 dark:text-neutral-200 placeholder-neutral-400"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-neutral-500"
            >
              Clear
            </button>
          )}

          <button onClick={onClose}>
            <IoMdClose className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
          </button>
        </div>
      </div>
    </>
  );
}
