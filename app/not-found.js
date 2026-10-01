import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fb] px-6 text-center text-neutral-950 dark:bg-[#07080c] dark:text-neutral-50">
      <h1 className="text-2xl font-black">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-red-700 px-6 text-sm font-bold text-white transition-colors hover:bg-red-600"
      >
        Home
      </Link>
    </main>
  );
}
