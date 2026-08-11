// Service Worker for PWA offline support
// v2: network-first strategy to prevent stale cache issues on iOS
const CACHE_NAME = 'expense-tracker-v2';

// Core assets to pre-cache on install
const CORE_ASSETS = [
  '/H-program/',
  '/H-program/index.html',
  '/H-program/manifest.webmanifest',
];

// Install: pre-cache core assets only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: clear ALL old caches, claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => {
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for everything (prevents stale cache on iOS PWA)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Only handle same-origin requests
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for offline fallback
        if (response.ok || response.type === 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network failed: try cache, then fallback to index for navigations
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/H-program/');
          }
          return new Response('', { status: 504, statusText: 'Offline' });
        });
      })
  );
});

// Listen for messages from clients (for skipWaiting / refresh)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
