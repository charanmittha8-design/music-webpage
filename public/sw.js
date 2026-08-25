const CACHE_NAME = 'charan-music-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through audio streams & downloads
  if (
    event.request.url.includes('/api/download') ||
    event.request.url.includes('.mp4') ||
    event.request.url.includes('.mp3')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Fetch background refresh
        fetch(event.request)
          .then((networkRes) => {
            if (networkRes.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkRes);
              });
            }
          })
          .catch(() => {});
        return cached;
      }

      return fetch(event.request)
        .then((networkRes) => {
          if (networkRes.ok && event.request.method === 'GET') {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkRes;
        })
        .catch(() => {
          // If offline and navigating to page, serve root
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
    })
  );
});
