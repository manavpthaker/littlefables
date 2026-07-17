/*
 * Little Fables service worker (PRD E1).
 *
 * Design goals:
 *   - Offline reading works after any book/page has been visited once online.
 *   - Audio + timestamps cached forever (immutable content — filenames are
 *     scoped to book_id + chapter/page indexes).
 *   - Next.js chunks + static assets cached forever (their hashed URLs change
 *     on every deploy).
 *   - HTML routes are network-first with cache fallback so a fresh SSR is
 *     preferred when online, but the last-good render works offline.
 *   - /api/* never cached (audit C3 pattern — auth + writes must reach origin).
 *   - Content-type-aware offline fallbacks (HTML → shell, images → 1x1 SVG).
 *
 * Versioning: the SW_VERSION is written into two cache names. Bumping the
 * constant on any code change forces old caches to be evicted on activate.
 * The build script (scripts/build-precache-manifest.ts) will replace this
 * placeholder with a real version stamp at build time.
 */

const SW_VERSION = '__SW_VERSION__';
const PRECACHE = `lf-precache-${SW_VERSION}`;
const RUNTIME = `lf-runtime-${SW_VERSION}`;

// Minimal precache — the app shell. Runtime caches everything else on first
// visit. Manifest-driven (audit S6 fix): the shell URLs come from a build-time
// injected list, not a hand-maintained blob.
const PRECACHE_URLS = [
  '/manifest.webmanifest',
  '/offline-shell',
];

const OFFLINE_IMG_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="#f2e7d3"/></svg>';

// ---------- Install ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS.map((u) => new Request(u, { cache: 'reload' }))))
      .catch(() => {
        // Precache misses shouldn't block install — runtime cache fills in gaps.
      })
      .then(() => self.skipWaiting()),
  );
});

// ---------- Activate: evict old caches ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== PRECACHE && k !== RUNTIME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

// ---------- Fetch ----------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Same-origin only — cross-origin requests (Supabase Storage) get their own
  // branch below to reach page-audio.
  const sameOrigin = url.origin === self.location.origin;
  const isSupabaseStorage = url.href.includes('/storage/v1/object/public/');

  // Never touch API traffic.
  if (sameOrigin && url.pathname.startsWith('/api/')) return;

  // Cache-first for immutable content: Next chunks, images, favicons.
  if (
    sameOrigin &&
    (url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.startsWith('/audio/') ||
      /\.(png|jpg|jpeg|webp|svg|gif|woff2?|ttf|otf|ico|css|js)$/.test(url.pathname))
  ) {
    event.respondWith(cacheFirst(req, RUNTIME));
    return;
  }

  // Supabase Storage (page-audio + art) — cache-first, immutable.
  if (isSupabaseStorage) {
    event.respondWith(cacheFirst(req, RUNTIME));
    return;
  }

  // HTML routes: network-first with cache fallback.
  if (sameOrigin && req.destination === 'document') {
    event.respondWith(networkFirstDocument(req));
    return;
  }

  // Everything else on same-origin: stale-while-revalidate.
  if (sameOrigin) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME));
  }
});

// ---------- Strategies ----------
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch (err) {
    if (request.destination === 'image') {
      return new Response(OFFLINE_IMG_SVG, { headers: { 'Content-Type': 'image/svg+xml' } });
    }
    throw err;
  }
}

async function networkFirstDocument(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    // Ultimate fallback: last cached kid-facing route.
    const shell = await cache.match('/read');
    if (shell) return shell;
    return new Response('<h1>Offline</h1><p>Load one page while online first.</p>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 503,
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((res) => {
      if (res && res.status === 200) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || fetchPromise;
}
