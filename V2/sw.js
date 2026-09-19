const CACHE_PREFIX = 'mv-v2-preview-'
const CACHE = CACHE_PREFIX + 'agenda-20260919-a'
const BASE = new URL('./', self.location.href)
const CORE = ['./', 'mon-agenda.html', 'manifest.webmanifest', 'agenda.webmanifest', 'mv-icon-192.png', 'mv-icon-512.png'].map((path) => new URL(path, BASE).href)
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)))
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.headers.has('range') || /\.(mp4|webm)$/i.test(url.pathname)) return
  if (event.request.method !== 'GET' || url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return
  event.respondWith(fetch(event.request).then((response) => {
    if (response.status === 200 && !response.redirected) {
      const copy = response.clone()
      event.waitUntil(caches.open(CACHE).then((cache) => cache.put(event.request, copy)))
    }
    return response
  }).catch(async () => (await caches.match(event.request)) || Response.error()))
})
