'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/nav';
import { useRouter } from 'next/navigation';

export default function StreamPage() {
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const router = useRouter();

  const loadStream = useCallback(() => {
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
  }, []);

  useEffect(() => {
    loadStream();
  }, [loadStream]);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;
    // Detect HLS by the URL pathname, not a substring match — signed/query
    // params (…/live.m3u8?token=…) and lookalikes shouldn't fool detection.
    let isHls = false;
    try {
      isHls = new URL(streamUrl, window.location.href).pathname
        .toLowerCase()
        .endsWith('.m3u8');
    } catch {
      isHls = streamUrl.toLowerCase().includes('.m3u8');
    }

    if (!isHls) {
      video.src = streamUrl;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari supports HLS natively
      video.src = streamUrl;
    } else {
      import('hls.js').then(({ default: Hls }) => {
        if (!Hls.isSupported()) {
          setError('Live streaming is not supported in this browser.');
          return;
        }
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) setError('Stream error. Please retry.');
        });
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-inherit pb-20">
        <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-50/50 dark:bg-neutral-950/50 px-4 py-3 backdrop-blur-md shadow-sm flex items-center justify-between">
          <h1 className="text-lg font-bold dark:text-neutral-200">Live Stream</h1>
          <button
            onClick={() => router.back()}
            className="text-sm text-neutral-500 dark:text-neutral-400"
            aria-label="Go back"
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
                onClick={loadStream}
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
                ref={videoRef}
                controls
                autoPlay
                playsInline
                crossOrigin="anonymous"
                className="w-full rounded-lg aspect-video bg-black"
              >
                Your browser does not support video playback.
              </video>
            </>
          )}
        </div>

        <Navbar />
      </div>
    </>
  );
}
