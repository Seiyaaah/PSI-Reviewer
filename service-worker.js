const CACHE_NAME = 'voilearn-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/router.js',
  './js/lesson.js',
  './js/quiz.js',
  './js/notes.js',
  './js/progress.js',
  './js/storage.js',
  './data/subjects.json',
  './data/lessons.json',
  './data/questions.json',
  './data/notes.json',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 1. Install event: cache assets and force the waiting service worker to become active
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate event: clean up outdated caches immediately and take control of open clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event: serve from cache, fallback to network and update cache dynamically
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('./index.html');
      }
    })
  );
});
