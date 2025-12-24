'use client';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    if (navigator.onLine) {
      router.refresh();
    } else {
      alert('Still offline! Check your connection.');
    }
  };
  

  return (
    <main className="flex flex-col items-center justify-center h-screen p-6 text-center bg-gray-50 dark:bg-neutral-900">
      <h1 className="text-2xl font-bold dark:text-neutral-200">You’re Offline</h1>
      <p className="mt-2 text-gray-600 dark:text-neutral-400">
        Previously viewed content is still available.
      </p>
      <button
        onClick={handleRetry}
        className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600"
      >
        Retry
      </button>
    </main>
  );
}
