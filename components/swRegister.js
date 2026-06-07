'use client';
import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [updateReady, setUpdateReady] = useState(false);
  const [waitingSW, setWaitingSW] = useState(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // New SW waiting — a new version is installed but waiting for activation
      if (registration.waiting) {
        setWaitingSW(registration.waiting);
        setUpdateReady(true);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingSW(newWorker);
            setUpdateReady(true);
          }
        });
      });
    }).catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  }, []);

  const handleUpdate = () => {
    if (!waitingSW) return;
    waitingSW.postMessage('SKIP_WAITING');
    setUpdateReady(false);
    window.location.reload();
  };

  if (!updateReady) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-neutral-900 text-white text-sm px-4 py-3 rounded-full shadow-lg">
      <span>New version available</span>
      <button
        onClick={handleUpdate}
        className="bg-red-700 px-3 py-1 rounded-full font-semibold hover:bg-red-600 transition-colors"
      >
        Update
      </button>
    </div>
  );
}
