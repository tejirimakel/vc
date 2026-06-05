'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/nav';
import ProtectedRoutes from '@/components/protectedRoutes';
import { useRouter } from 'next/navigation';

export default function StreamPage() {
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/stream')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStreamUrl(data.url);
      })
      .catch(() => setError('Could not load stream'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoutes>
      <div className="flex flex-col min-h-screen bg-inherit pb-20">
        <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-50/50 dark:bg-neutral-950/50 px-4 py-3 backdrop-blur-md shadow-sm flex items-center justify-between">
          <h1 className="text-lg font-bold dark:text-neutral-200">Live Stream</h1>
          <button
            onClick={() => router.back()}
            className="text-sm text-neutral-500 dark:text-neutral-400"
          >
            Back
          </button>
        </nav>

        <div className="w-full max-w-2xl mx-auto px-4 mt-20">
          {loading && (
            <div className="animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-lg w-full aspect-video" />
          )}

          {!loading && error && (
            <div className="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-10 text-center">
              <p className="text-lg dark:text-neutral-300 font-semibold">Stream Unavailable</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  fetch('/api/stream')
                    .then((r) => r.json())
                    .then((data) => {
                      if (data.error) setError(data.error);
                      else setStreamUrl(data.url);
                    })
                    .catch(() => setError('Could not load stream'))
                    .finally(() => setLoading(false));
                }}
                className="mt-6 px-6 py-2 bg-red-700 text-white rounded-full text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && streamUrl && (
            <>
              <p className="text-xs text-neutral-400 text-center mb-2">
                Rotate device for best experience
              </p>
              <video
                key={streamUrl}
                controls
                autoPlay
                playsInline
                className="w-full rounded-lg aspect-video bg-black"
              >
                <source src={streamUrl} type="application/x-mpegURL" />
                <source src={streamUrl} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </>
          )}
        </div>

        <Navbar />
      </div>
    </ProtectedRoutes>
  );
}
