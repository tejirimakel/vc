'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/nav';
import { useRouter } from 'next/navigation';

// Detect HLS by the URL pathname, not a substring match — signed/query
// params (…/live.m3u8?token=…) and lookalikes shouldn't fool detection.
function isHlsUrl(streamUrl) {
  try {
    return new URL(streamUrl, window.location.href).pathname.toLowerCase().endsWith('.m3u8');
  } catch {
    return streamUrl.toLowerCase().includes('.m3u8');
  }
}

export default function StreamPage() {
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 503 from /api/stream means no stream is configured: an expected state, not an error.
  const [unavailable, setUnavailable] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const videoRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    setUnavailable(false);

    fetch('/api/stream')
      .then(async (response) => {
        if (response.status === 503) {
          if (!ignore) setUnavailable(true);
          return;
        }
        const data = await response.json();
        if (ignore) return;
        if (!response.ok || data.error) setError(data.error || 'Could not load stream');
        else setStreamUrl(data.url);
      })
      .catch(() => {
        if (!ignore) setError('Could not load stream');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [attempt]);

  const showPlayer = !loading && !error && !unavailable && Boolean(streamUrl);

  // Depends on showPlayer so it re-runs whenever the <video> element is
  // (re)mounted — including after a retry that returns the same URL.
  useEffect(() => {
    const video = videoRef.current;
    if (!showPlayer || !video) return undefined;

    // Plain files, and Safari (native HLS), play straight from the URL.
    if (!isHlsUrl(streamUrl) || video.canPlayType('application/vnd.apple.mpegurl')) {
      const onNativeError = () => setError('Stream error. Please retry.');
      video.addEventListener('error', onNativeError);
      video.src = streamUrl;
      return () => video.removeEventListener('error', onNativeError);
    }

    let cancelled = false;
    let hls = null;
    let networkRecovered = false;
    let mediaRecovered = false;

    import('hls.js')
      .then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          setError('Live streaming is not supported in this browser.');
          return;
        }

        hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal) return;
          // Try each recoverable error type once before giving up.
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !networkRecovered && hls.levels?.length) {
            networkRecovered = true;
            hls.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !mediaRecovered) {
            mediaRecovered = true;
            hls.recoverMediaError();
            return;
          }
          setError('Stream error. Please retry.');
        });
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the video player.');
      });

    return () => {
      cancelled = true;
      if (hls) {
        hls.destroy();
        hls = null;
      }
    };
  }, [showPlayer, streamUrl]);

  const retry = () => setAttempt((count) => count + 1);

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

          {!loading && unavailable && (
            <div className="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-10 text-center">
              <p className="text-lg dark:text-neutral-300 font-semibold">No live broadcast right now</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                Check back later for live coverage.
              </p>
            </div>
          )}

          {!loading && error && (
            <div role="alert" className="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-10 text-center">
              <p className="text-lg dark:text-neutral-300 font-semibold">Stream Unavailable</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-6 px-6 py-2 bg-red-700 text-white rounded-full text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {showPlayer && (
            <>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mb-2">
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
