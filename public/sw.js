const PAGES_CACHE   = 'pages-cache-v3';
const API_CACHE     = 'api-cache-v3';
const IMAGE_CACHE   = 'image-cache-v3';
const PDF_CACHE     = 'pdf-cache-v3';
const OFFLINE_CACHE = 'offline-cache-v3';
const OFFLINE_URL   = '/offline';

const ALL_CACHES = [PAGES_CACHE, API_CACHE, IMAGE_CACHE, PDF_CACHE, OFFLINE_CACHE];
// Hand-mirrored from lib/protectedRoutes.js — the SW runs in a separate bundle
// and cannot import. Keep this list in sync.
const PROTECTED_PAGE_PREFIXES = ['/mobile', '/news', '/ecopy', '/video', '/stream'];

function pathStartsWith(pathname, prefixes) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

// ── Install: precache offline fallback ────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.addAll([OFFLINE_URL]))
  );
  // Do NOT call skipWaiting() here — let the new SW wait for the page to reload
  // so we don't break inflight requests. swRegister.js handles the prompt.
});

// ── Activate: claim clients and remove stale caches ───────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k)))
      ),
    ])
  );
});

// ── Message: allow clients to trigger skipWaiting ────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// ── Helpers ───────────────────────────────────────────────────────────────

async function networkFirst(request, cacheName, timeoutSeconds) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutSeconds * 1000);
  try {
    const networkResponse = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    clearTimeout(timer);
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match(OFFLINE_URL);
    return Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const networkFetch = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);
  return cached || networkFetch;
}

// ── Fetch router ──────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isProtectedPage = pathStartsWith(url.pathname, PROTECTED_PAGE_PREFIXES);

  // Navigation requests → NetworkFirst with 5s timeout. Protected pages stay
  // network-only (with offline fallback) so a logged-out client is redirected
  // by middleware rather than served a stale app shell.
  if (request.mode === 'navigate') {
    if (isProtectedPage) {
      event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
      return;
    }
    event.respondWith(networkFirst(request, PAGES_CACHE, 5));
    return;
  }

  // Live stream URL must always be fresh — never cache it.
  if (url.pathname.startsWith('/api/stream')) {
    event.respondWith(fetch(request));
    return;
  }

  // PDF proxy → CacheFirst (PDFs rarely change at the same URL). The cap on
  // ok-only caching means unauthorized 401s are never stored, so the cookie
  // gate is still honoured.
  if (url.pathname.startsWith('/api/pdf')) {
    event.respondWith(cacheFirst(request, PDF_CACHE));
    return;
  }

  // Own JSON APIs (/api/news, /api/ecopy, /api/youtube) → StaleWhileRevalidate:
  // serve cached content instantly for offline reading, refresh in background.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // WordPress API direct calls → NetworkFirst with 8s timeout
  if (
    url.origin === 'https://thevaluechainng.com' &&
    url.pathname.startsWith('/wp-json/')
  ) {
    event.respondWith(networkFirst(request, API_CACHE, 8));
    return;
  }

  // Images → CacheFirst
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // YouTube thumbnails only (not video streams — those can't be cached)
  if (
    url.origin.includes('img.youtube.com') ||
    url.origin.includes('i.ytimg.com')
  ) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }
});
