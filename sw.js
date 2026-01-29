const CACHE_NAME = 'lifepar-cache-v1';
const assets = [
  './',
  './index.html',
  './admin.css',
  './img/192x192.png',
  './img/512x512.png'
  // Agregá acá tus fotos de fondo si querés que carguen offline
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
}); 