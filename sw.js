// Riza Chef Service Worker - offline caching for the recipe app
// Cache version - bump this when you deploy a new index.html to force update
const CACHE_VERSION = 'riza-chef-v1';

// Files to cache on install
const PRECACHE_URLS = [
  './',
  './index.html'
];

// Install: cache the app shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn('Precache failed (non-fatal):', err);
      });
    })
  );
});

// Activate: clean old caches, take control of all clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate strategy
// - Return cached version immediately if available (fast)
// - Fetch fresh version in background and update cache (always up to date)
// - Only cache same-origin, YouTube thumbnails, and Google Fonts
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Decide if this request is cacheable
  const isCacheable = (
    url.origin === self.location.origin ||
    url.host === 'img.youtube.com' ||
    url.host === 'i.ytimg.com' ||
    url.host === 'fonts.googleapis.com' ||
    url.host === 'fonts.gstatic.com'
  );

  if (!isCacheable) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Fire off a fetch in the background to update the cache
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_VERSION).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed - if we have a cached version, that's already returned below
        // For navigation requests with no cache, fall back to the app shell
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });

      // Return cached immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
