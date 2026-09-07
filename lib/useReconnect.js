'use client';

import { useEffect, useRef } from 'react';

/**
 * Reliably detects when connectivity returns and runs `onReconnect`.
 *
 * `navigator.onLine` and the `online` event are unreliable on iOS / installed
 * PWAs (the event frequently never fires after toggling airplane mode), so we
 * actively probe the network on a short interval instead of trusting them.
 * The `online` event is still used as an extra fast trigger when it does fire.
 *
 * @param {() => void} onReconnect called once the network is reachable again
 * @param {number} intervalMs probe cadence in milliseconds
 */
export function useReconnect(onReconnect, intervalMs = 3000) {
  const callbackRef = useRef(onReconnect);
  callbackRef.current = onReconnect;

  useEffect(() => {
    let stopped = false;
    let firing = false;

    const probe = async () => {
      if (stopped || firing) return;
      firing = true;
      try {
        // Cache-busting, no-store request to a tiny same-origin file. The
        // service worker does not intercept this, so it only resolves when the
        // network is genuinely reachable.
        const res = await fetch(`/manifest.json?_probe=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!stopped && res && res.ok) {
          callbackRef.current();
          return;
        }
      } catch {
        /* still offline */
      } finally {
        firing = false;
      }
    };

    const onOnline = () => probe();
    window.addEventListener('online', onOnline);
    const interval = setInterval(probe, intervalMs);
    // Probe shortly after mount in case we are already back online.
    const kick = setTimeout(probe, 1000);

    return () => {
      stopped = true;
      window.removeEventListener('online', onOnline);
      clearInterval(interval);
      clearTimeout(kick);
    };
  }, [intervalMs]);
}

export default useReconnect;
