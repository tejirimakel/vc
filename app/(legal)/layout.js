import Link from "next/link";
import { IoArrowBackOutline } from "react-icons/io5";

// Shared chrome for all legal pages (privacy, terms, cookies, editorial, etc.).
// These routes are public — they are intentionally absent from middleware.js's
// matcher so they remain reachable without the app-access cookie.
export default function LegalLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 text-neutral-900 dark:bg-[#07080c] dark:text-neutral-100">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-700/30 dark:border-white/10 dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-white/15"
        >
          <IoArrowBackOutline className="h-4 w-4" aria-hidden="true" />
          Home
        </Link>

        <article className="legal-prose mt-8 space-y-5 leading-7 text-neutral-700 dark:text-neutral-300">
          {children}
        </article>

        <footer className="mt-12 border-t border-black/10 pt-6 text-center text-xs font-medium text-neutral-500 dark:border-white/10 dark:text-neutral-400">
          <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-red-700 dark:hover:text-red-400">Privacy</Link>
            <Link href="/terms" className="hover:text-red-700 dark:hover:text-red-400">Terms</Link>
            <Link href="/cookies" className="hover:text-red-700 dark:hover:text-red-400">Cookies</Link>
            <Link href="/editorial" className="hover:text-red-700 dark:hover:text-red-400">Editorial</Link>
            <Link href="/copyright" className="hover:text-red-700 dark:hover:text-red-400">Copyright</Link>
            <Link href="/about" className="hover:text-red-700 dark:hover:text-red-400">About</Link>
          </nav>
          © {new Date().getFullYear()} TheValueChain. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
