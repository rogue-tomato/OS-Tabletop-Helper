// Cache-first service worker for the Oathsworn Helper static site.
//
// Strategy:
//   - On install: pre-cache the app shell (index + first hashed bundle
//     references resolve via fetch on activation).
//   - On fetch (GET, same-origin): cache-first for any image / font /
//     css / js / html. Network response is cloned into the cache so
//     it's there for next time. If network fails, we fall back to the
//     cached version (if any).
//
// Bump VERSION when the asset roster changes meaningfully — old caches
// get pruned in `activate`.
//
// HTML responses use a stale-while-revalidate pattern: serve the cached
// shell for instant paint, then refresh the cache from the network so
// the next visit picks up new bundle hashes.

const VERSION = 'v1';
const CACHE_NAME = `oathsworn-helper-${VERSION}`;

// Minimal precache — just the entry HTML so the very first install has
// something to fall back to offline. Everything else is cached on the
// fly as the user (or our HomePage prefetch) requests it.
const PRECACHE = ['./'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((n) => n !== CACHE_NAME)
            .map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const CACHEABLE_EXT = /\.(webp|png|jpe?g|svg|gif|css|js|woff2?|ttf|otf|json)$/i;

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Stale-while-revalidate for the HTML shell.
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        const networkPromise = fetch(req)
          .then((resp) => {
            if (resp.ok) cache.put(req, resp.clone());
            return resp;
          })
          .catch(() => cached);
        return cached || networkPromise;
      }),
    );
    return;
  }

  if (CACHEABLE_EXT.test(url.pathname)) {
    // Cache-first for images / styles / scripts / fonts.
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const resp = await fetch(req);
          if (resp.ok) cache.put(req, resp.clone());
          return resp;
        } catch (err) {
          // Offline & not cached — fall through with the failure.
          throw err;
        }
      }),
    );
  }
});
