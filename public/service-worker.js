 import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, setCatchHandler } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// 🧹 Cleanup old caches
cleanupOutdatedCaches()

// 📦 Precache Next.js build assets
precacheAndRoute(self.__WB_MANIFEST || [])

/* -------------------------------------
   📰 API Caching (News, Articles)
------------------------------------- */
registerRoute(
  ({ url }) =>
    url.origin === 'https://thevaluechainng.com' &&
    url.pathname.startsWith('/wp-json/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 8,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
)

/* -------------------------------------
   🖼 Images (Cache First)
------------------------------------- */
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 // 1 day
      }),
    ],
  })
)

/* -------------------------------------
   📄 PDFs via API Proxy (Cache First)
------------------------------------- */
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/pdf'),
  new CacheFirst({
    cacheName: 'pdf-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
)


/* -------------------------------------
   🎥 YouTube & External Media
------------------------------------- */
registerRoute(
  ({ url }) =>
    url.origin.includes('youtube.com') ||
    url.origin.includes('googlevideo.com'),
  new StaleWhileRevalidate({
    cacheName: 'video-cache',
  })
)

/* -------------------------------------
   🎥 YouTube API (Internal)
------------------------------------- */
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/youtube'),
  new StaleWhileRevalidate({
    cacheName: 'youtube-api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  })
)


/* -------------------------------------
   🧭 Navigation (Pages)
------------------------------------- */
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    networkTimeoutSeconds: 5,
  })
)

/* -------------------------------------
   🚑 Global Offline Fallback
------------------------------------- */
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline')
  }

  return Response.error()
})

// =====================================================
// 🔔 PUSH NOTIFICATIONS
// =====================================================

self.addEventListener("push", (event) => {
  if (!event.data) return

  let data = {}

  try {
    data = event.data.json()
  } catch {
    data = { title: "TheValueChain", body: event.data.text() }
  }

  const title = data.title || "TheValueChain"
  const options = {
    body: data.body || "Breaking news update",
    icon: "/web-app-manifest-192x192.png",
    badge: "/badge.png",
    data: {
      url: data.url || "/",
    },
    vibrate: [100, 50, 100],
    requireInteraction: true, // stays until user interacts
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// --------------------
// Notification click
// --------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

// --------------------
// Install / Activate
// --------------------
self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

/* -------------------------------------
   📰 Internal API (Next.js)
------------------------------------- */
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/news'),
  new NetworkFirst({
    cacheName: 'news-api',
    networkTimeoutSeconds: 6,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  })
)
