const PAGES_CACHE   = 'pages-cache-v4';
const API_CACHE      = 'api-cache-v4';
const IMAGE_CACHE    = 'image-cache-v4';
const PDF_CACHE       = 'pdf-cache-v4';
const STATIC_CACHE   = 'static-cache-v4';
const OFFLINE_CACHE  = 'offline-cache-v4';
const OFFLINE_URL    = '/offline';

const ALL_CACHES = [PAGES_CACHE, API_CACHE, IMAGE_CACHE, PDF_CACHE, STATIC_CACHE, OFFLINE_CACHE];
// Hand-mirrored from lib/protectedRoutes.js — the SW runs in a separate bundle
// and cannot import. Keep this list in sync.
const PROTECTED_PAGE_PREFIXES = ['/mobile', '/news', '/ecopy', '/video', '/stream'];

function pathStartsWith(pathname, prefixes) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

// Public shell routes precached at install, plus the /_next/static assets they
// reference, so the app can render its own chrome offline on a first-ever
// visit — most importantly /pwa-launch, the installed PWA's start_url.
const PRECACHE_PAGES = ['/pwa-launch', '/', OFFLINE_URL];

// ── Install: precache offline fallback + public app shell ─────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const pagesCache = await caches.open(PAGES_CACHE);
      const staticCache = await caches.open(STATIC_CACHE);

      await Promise.all(
        PRECACHE_PAGES.map(async (route) => {
          try {
            const res = await fetch(route, { cache: 'no-store' });
            if (!res.ok || res.redirected) return;
            await pagesCache.put(route, res.clone());

            // Warm the static assets referenced by the shell so the page can
            // boot (styled + hydrated) on a first-ever offline launch.
            const html = await res.text();
            const assets = new Set();
            const re = /(?:src|href)="(\/_next\/static\/[^"]+)"/g;
            let match;
            while ((match = re.exec(html))) assets.add(match[1]);
            await Promise.all(
              [...assets].map(async (assetUrl) => {
                try {
                  const asset = await fetch(assetUrl);
                  if (asset.ok) await staticCache.put(assetUrl, asset);
                } catch {
                  /* ignore individual asset failures */
                }
              })
            );
          } catch {
            /* offline or route unavailable at install — non-fatal */
          }
        })
      );
    })()
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
    // Skip redirected responses: a page that redirects to "/" when
    // unauthenticated must not be cached under the protected URL.
    if (networkResponse.ok && !networkResponse.redirected) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    clearTimeout(timer);
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') return offlineFallback();
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

// Returns a fully self-contained offline page: inline styles, inline button
// handlers, and an inline reconnect probe. This deliberately does NOT rely on
// the cached Next.js /offline route's CSS/JS chunks — when those are missing
// (e.g. a first-ever offline visit before everything is cached) the React
// route would render unstyled with dead onClick buttons. This version needs
// no chunks, so it is always styled, interactive, and self-reloading the
// moment the network returns.
function offlineFallback() {
  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<meta name="theme-color" content="#07080c"><title>You're offline</title><style>` +
    `*{box-sizing:border-box}` +
    `body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;` +
    `font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#07080c;color:#f8f8f8;` +
    `text-align:center;padding:24px}` +
    `.wrap{max-width:30rem;width:100%}` +
    `.badge{display:inline-flex;align-items:center;gap:8px;font-size:.7rem;font-weight:700;` +
    `letter-spacing:.12em;text-transform:uppercase;color:#fca5a5;border:1px solid rgba(248,113,113,.25);` +
    `background:rgba(248,113,113,.08);padding:6px 12px;border-radius:999px;margin-bottom:24px}` +
    `.dot{width:8px;height:8px;border-radius:50%;background:#f87171;display:inline-block}` +
    `h1{font-size:2rem;font-weight:800;margin:0 0 12px}` +
    `p{color:#a3a3a3;line-height:1.6;margin:0 auto;max-width:26rem}` +
    `.btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:28px}` +
    `button{padding:12px 22px;border:0;border-radius:999px;font-weight:700;font-size:.95rem;cursor:pointer}` +
    `.primary{background:#b91c1c;color:#fff}` +
    `.ghost{background:rgba(255,255,255,.08);color:#f8f8f8;border:1px solid rgba(255,255,255,.14)}` +
    `.status{margin-top:20px;font-size:.85rem;font-weight:600;color:#737373}</style></head>` +
    `<body><div class="wrap">` +
    `<span class="badge"><span class="dot"></span>Offline mode</span>` +
    `<h1>You're offline</h1>` +
    `<p>TheValueChain cannot reach the network right now. This screen reloads itself ` +
    `automatically the moment your connection returns.</p>` +
    `<div class="btns">` +
    `<button class="primary" id="vcRetry">Try again</button>` +
    `<button class="ghost" id="vcBack">Go back</button>` +
    `</div>` +
    `<div class="status" id="vcStatus">Reconnecting automatically when the signal returns…</div>` +
    `</div><script>` +
    `var busy=false;` +
    `function probe(){if(busy)return;busy=true;` +
    `fetch('/manifest.json?_p='+Date.now(),{cache:'no-store'}).then(function(r){` +
    `if(r&&r.ok){location.reload()}else{busy=false}}).catch(function(){busy=false})}` +
    `document.getElementById('vcRetry').addEventListener('click',function(){` +
    `document.getElementById('vcStatus').textContent='Checking for a connection…';probe()});` +
    `document.getElementById('vcBack').addEventListener('click',function(){` +
    `if(history.length>1){history.back()}else{location.href='/'}});` +
    `addEventListener('online',probe);setInterval(probe,3000);setTimeout(probe,1000);` +
    `</script></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
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
      event.respondWith(fetch(request).catch(() => offlineFallback()));
      return;
    }
    event.respondWith(networkFirst(request, PAGES_CACHE, 5));
    return;
  }

  // Next.js client-side navigations fetch RSC payloads (header `RSC: 1` or a
  // `_rsc` query param) instead of doing a full navigation. These are not
  // `mode: navigate`, so without this branch an offline click on an uncached
  // route would fail the fetch and crash the router with a client-side
  // exception. Serving the offline page on failure makes the router fall back
  // to a full navigation, which then resolves to the offline experience.
  // Protected routes are never cached here either, for the same reason their
  // navigations are network-only above.
  const isRscRequest =
    request.headers.get('RSC') === '1' || url.searchParams.has('_rsc');
  if (isRscRequest && url.origin === self.location.origin) {
    if (isProtectedPage) {
      event.respondWith(fetch(request).catch(() => offlineFallback()));
      return;
    }
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          if (res.ok && !res.redirected) {
            const cache = await caches.open(PAGES_CACHE);
            cache.put(request, res.clone());
          }
          return res;
        } catch {
          return (await caches.match(request)) || offlineFallback();
        }
      })()
    );
    return;
  }

  // Next.js build assets (hashed + immutable) and other same-origin scripts,
  // styles and fonts → CacheFirst. This is what lets the client-rendered app
  // shell boot and stay functional on a slow or offline network after the
  // first successful visit.
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'font')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
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
