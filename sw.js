// Keeps the app itself available offline. Live times always come straight from TfL.
const CACHE = 'board-v2';
const SHELL = [
  './', 'manifest.webmanifest', 'favicon.svg', 'favicon.ico',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // newest from the network when online, so updates (including the manifest) arrive straight away;
  // the stored copy is only for when there's no connection
  const key = req.mode === 'navigate' ? './' : req;
  e.respondWith(fetch(req)
    .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); } return res; })
    .catch(() => caches.match(key)));
});
