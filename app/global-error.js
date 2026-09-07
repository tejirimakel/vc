'use client';

import { useEffect, useState } from 'react';

// Root error boundary. Replaces the entire document when an error escapes every
// other boundary (including a failed root layout or a client-side exception
// thrown while navigating to an uncached route offline). It renders its own
// <html>/<body> with inline styles so it never depends on app CSS or JS chunks
// that may themselves be unavailable offline.
export default function GlobalError({ error, reset }) {
  const [online, setOnline] = useState(true);

  const recover = () => {
    if (typeof reset === 'function') reset();
    else window.location.reload();
  };

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  // Auto-recover when the network is genuinely reachable again. navigator.onLine
  // and the online event are unreliable on iOS PWAs, so actively probe the
  // network and hard-reload on success. Kept inline (no imports) so this root
  // boundary stays self-contained.
  useEffect(() => {
    let stopped = false;
    let firing = false;
    const probe = async () => {
      if (stopped || firing) return;
      firing = true;
      try {
        const res = await fetch(`/manifest.json?_probe=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!stopped && res && res.ok) {
          window.location.reload();
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
    const id = setInterval(probe, 3000);
    const kick = setTimeout(probe, 1000);
    return () => {
      stopped = true;
      window.removeEventListener('online', onOnline);
      clearInterval(id);
      clearTimeout(kick);
    };
  }, []);

  const isOffline = !online;

  const wrap = {
    margin: 0,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    background: '#07080c',
    color: '#f8f8f8',
    textAlign: 'center',
    padding: '24px',
  };

  return (
    <html lang="en">
      <body style={wrap}>
        <main style={{ maxWidth: '32rem' }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 20px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isOffline ? 'rgba(255,255,255,0.08)' : 'rgba(185,28,28,0.16)',
              fontSize: 30,
            }}
            aria-hidden="true"
          >
            {isOffline ? '📡' : '⚠️'}
          </div>
          <h1 style={{ fontSize: '1.6rem', margin: '0 0 .5rem', fontWeight: 800 }}>
            {isOffline ? "You're offline" : 'Something went wrong'}
          </h1>
          <p style={{ color: '#a3a3a3', lineHeight: 1.6, margin: 0 }}>
            {isOffline
              ? "This page isn't available offline yet. It will reload automatically as soon as your connection returns."
              : 'The app hit an unexpected error. You can try reloading — saved pages may still be available offline.'}
          </p>
          <button
            onClick={recover}
            style={{
              marginTop: 24,
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 700,
              border: 0,
              borderRadius: 999,
              background: '#b91c1c',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
