const BUILD_ID = new URL(self.location.href).searchParams.get('build') || 'development'
const CACHE_PREFIX = 'daftar-'
const STATIC_CACHE = `${CACHE_PREFIX}static-${BUILD_ID}`
const PAGE_CACHE = `${CACHE_PREFIX}pages-${BUILD_ID}`
const APP_SHELL = [
  '/precache-manifest.json',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const manifestResponse = await fetch('/precache-manifest.json', { cache: 'no-store' })
    if (!manifestResponse.ok) {
      throw new Error(`Unable to load offline asset manifest: ${manifestResponse.status}`)
    }

    const { buildId, files } = await manifestResponse.json()
    if (buildId !== BUILD_ID || !Array.isArray(files) || files.length === 0) {
      throw new Error('Offline asset manifest does not match this service worker build.')
    }

    const assets = [...new Set([...APP_SHELL, ...files])]
    const staticCache = await caches.open(STATIC_CACHE)
    await staticCache.addAll(assets)

    const pageCache = await caches.open(PAGE_CACHE)
    await pageCache.add('/')
  })())

  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames
      .filter((name) => name.startsWith(CACHE_PREFIX) && name !== STATIC_CACHE && name !== PAGE_CACHE)
      .map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  if (url.pathname === '/precache-manifest.json') {
    event.respondWith(networkFirstStatic(request))
    return
  }

  if (
    url.pathname.startsWith('/_next/static/') ||
    /\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (request.mode === 'navigate' || request.headers.get('RSC') || url.searchParams.has('_rsc')) {
    event.respondWith(networkFirst(request))
  }
})

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) await cache.put(request, response.clone())
  return response
}

async function networkFirstStatic(request) {
  const cache = await caches.open(STATIC_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone())
    return response
  } catch {
    return (await cache.match(request)) || Response.error()
  }
}

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone())
    return response
  } catch {
    return (await cache.match(request)) || (await cache.match('/')) || Response.error()
  }
}
