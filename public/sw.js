const PAGES_CACHE   = 'pages-cache-v1';
const API_CACHE     = 'api-cache-v1';
const IMAGE_CACHE   = 'image-cache-v1';
const PDF_CACHE     = 'pdf-cache-v1';
const VIDEO_CACHE   = 'video-cache-v1';
const OFFLINE_CACHE = 'offline-cache-v1';
const OFFLINE_URL   = '/offline';

const ALL_CACHES = [PAGES_CACHE, API_CACHE, IMAGE_CACHE, PDF_CACHE, VIDEO_CACHE, OFFLINE_CACHE];

// ── Install: precache offline fallback and main app shell ──────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.addAll([OFFLINE_URL, '/mobile']))
  );
});

// ── Activate: claim all clients and remove stale caches ───────────────────
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

  // Navigation requests → NetworkFirst with 5s timeout
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, PAGES_CACHE, 5));
    return;
  }

  // WordPress API → NetworkFirst with 8s timeout
  if (
    url.origin === 'https://thevaluechainng.com' &&
    url.pathname.startsWith('/wp-json/')
  ) {
    event.respondWith(networkFirst(request, API_CACHE, 8));
    return;
  }

  // PDF proxy → CacheFirst
  if (url.pathname.startsWith('/api/pdf')) {
    event.respondWith(cacheFirst(request, PDF_CACHE));
    return;
  }

  // Images → CacheFirst
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // YouTube / Google Video → StaleWhileRevalidate
  if (
    url.origin.includes('youtube.com') ||
    url.origin.includes('googlevideo.com')
  ) {
    event.respondWith(staleWhileRevalidate(request, VIDEO_CACHE));
    return;
  }
});
