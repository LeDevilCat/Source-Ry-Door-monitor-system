const CACHE_NAME = "door-status-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/js/door-status.js",
  "/js/door-timer.js",
  "/css/global.css",
  "/css/front-page.css",
  "/css/responsive.css",
  "/images/icon-192.png",
  "/images/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

console.log("Service Worker installed.");