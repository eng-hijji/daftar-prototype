const VERSION = 'v2'
const STATIC = `static-${VERSION}`
const PAGES = `pages-${VERSION}`

// List EVERY route that should work offline on first install.
const ROUTES = ['/' /*, '/settings', '/about' ... */]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES)
      // Use allSettled so one failing route doesn't break the install
      await Promise.allSettled(ROUTES.map((r) => cache.add(r)))
      const s = await caches.open(STATIC)
      await s.addAll(['/icons/icon-192.png', '/icons/icon-512.png'])
    })()
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((k) => k !== STATIC && k !== PAGES).map((k) => caches.delete(k))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return // never cache API calls here

  // Hashed build files + images + fonts: cache first
  if (
    url.pathname.startsWith('/_next/static/') ||
    /\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(req, STATIC))
    return
  }

  // Page loads and Next.js client navigation (RSC payloads)
  if (req.mode === 'navigate' || req.headers.get('RSC') || url.searchParams.has('_rsc')) {
    event.respondWith(networkFirst(req))
  }
})

async function cacheFirst(req, name) {
  const cached = await caches.match(req)
  if (cached) return cached
  const res = await fetch(req)
  if (res.ok) (await caches.open(name)).put(req, res.clone())
  return res
}

async function networkFirst(req) {
  try {
    const res = await fetch(req)
    if (res.ok) (await caches.open(PAGES)).put(req, res.clone())
    return res
  } catch {
    return (await caches.match(req)) || (await caches.match('/')) || Response.error()
  }
}
