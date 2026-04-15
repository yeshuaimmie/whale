const CACHE_NAME = 'whale-investors-v1';

const APP_SHELL = [
  '/',
  '/login',
  '/register',
  '/css/style.css',
  '/js/main.js',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((networkResponse) => {
          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          return networkResponse;
        })
        .catch(async () => {
          if (event.request.mode === 'navigate') {
            const offlineFallback = await caches.match('/offline.html');
            if (offlineFallback) return offlineFallback;
          }
          return new Response('Offline', {
            status: 503,
            statusText: 'Offline'
          });
        });
    })
  );
});
