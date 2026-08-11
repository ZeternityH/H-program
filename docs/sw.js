// Service Worker v3 - self-unregister, clear ALL caches
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))),
      self.registration.unregister()
    ])
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass-through, no caching
});
