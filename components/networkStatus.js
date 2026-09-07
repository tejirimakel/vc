'use client';

import { useEffect, useRef, useState } from 'react';
import { IoCheckmarkCircleOutline, IoCloudOfflineOutline } from 'react-icons/io5';

/**
 * Global connectivity indicator. Slides a banner down from the top when the
 * browser goes offline, and briefly confirms when the connection returns, so
 * the app always communicates its network state to the user.
 */
export default function NetworkStatus() {
  const [offline, setOffline] = useState(false);
  const [reconnected, setReconnected] = useState(false);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setOffline(true);
    }

    const handleOffline = () => {
      clearTimeout(reconnectTimer.current);
      setReconnected(false);
      setOffline(true);
    };

    const handleOnline = () => {
      setOffline(false);
      setReconnected(true);
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = setTimeout(() => setReconnected(false), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      clearTimeout(reconnectTimer.current);
    };
  }, []);

  if (!offline && !reconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-slideDown fixed inset-x-0 top-0 z-[120] flex justify-center px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)]"
    >
      <div
        className={`pointer-events-none inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-lg backdrop-blur ${
          offline
            ? 'bg-neutral-900/95 text-white'
            : 'bg-emerald-600/95 text-white'
        }`}
      >
        {offline ? (
          <>
            <IoCloudOfflineOutline className="h-4 w-4" aria-hidden="true" />
            You&apos;re offline — showing saved content
          </>
        ) : (
          <>
            <IoCheckmarkCircleOutline className="h-4 w-4" aria-hidden="true" />
            Back online — refreshing
          </>
        )}
      </div>
    </div>
  );
}
