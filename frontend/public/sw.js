const CACHE = 'kaamkaaj-v1';

// Static assets to pre-cache
const PRECACHE = ['/', '/jobs', '/companies', '/offline'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests for same-origin navigation
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  // Skip API routes — always network-first
  if (e.request.url.includes('/api/')) return;
  // Skip Next.js internal assets — they carry content-hash URLs in production and are
  // already controlled by HTTP immutable cache headers. Caching them in the SW causes
  // stale CSS/JS to be served during development (where assets have no hash) and is
  // redundant in production.
  if (e.request.url.includes('/_next/')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fresh = fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached || caches.match('/offline'));
      // Return cached immediately, update in background
      return cached || fresh;
    })
  );
});
