import { registerRoute, setCatchHandler } from "workbox-routing";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

const OFFLINE_URL = "/offline";

/* -------------------------------------
   🧭 Pages (Navigation)
------------------------------------- */
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
    ],
  })
);

setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match(OFFLINE_URL);
  }
  return Response.error();
});


/* -------------------------------------
   📰 WordPress API (News)
------------------------------------- */
registerRoute(
  ({ url }) =>
    url.origin === "https://thevaluechainng.com" &&
    url.pathname.startsWith("/wp-json/"),
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 8,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

/* -------------------------------------
   🖼 Images
------------------------------------- */
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  })
);

/* -------------------------------------
   📄 PDFs (Proxy)
------------------------------------- */
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/pdf"),
  new CacheFirst({
    cacheName: "pdf-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  })
);

/* -------------------------------------
   🎥 YouTube / Media
------------------------------------- */
registerRoute(
  ({ url }) =>
    url.origin.includes("youtube.com") ||
    url.origin.includes("googlevideo.com"),
  new StaleWhileRevalidate({
    cacheName: "video-cache",
  })
);

/* -------------------------------------
   🚑 Offline fallback (IMPORTANT)
------------------------------------- */
setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    return caches.match(OFFLINE_URL);
  }
  return Response.error();
});

/* -------------------------------------
   📦 Precache Offline Page
------------------------------------- */
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open("offline-cache").then((cache) => {
      return cache.addAll([OFFLINE_URL, '/mobile']);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
