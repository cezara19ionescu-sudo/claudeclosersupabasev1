// Minimal service worker for PWA installation support
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through
  event.respondWith(fetch(event.request).catch(() => {
    // Offline fallback if needed
  }));
});
