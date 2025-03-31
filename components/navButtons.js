// components/NavButtons.js
'use client';  // This directive makes this a Client Component

import { IoMdArrowRoundBack } from "react-icons/io";
import { IoShareSocial } from "react-icons/io5";

export default function NavButtons({ onBack, onShare }) {
  return (
    <div className="flex justify-between items-center p-4">
      {/* Back Button */}
      <button onClick={onBack} className="text-gray-800 dark:text-neutral-100">
        <IoMdArrowRoundBack className="w-6 h-6" />
      </button>

      {/* Share Button */}
      <button onClick={onShare} className="text-gray-800 dark:text-neutral-100">
        <IoShareSocial className="w-6 h-6" />
      </button>
    </div>
  );
}
