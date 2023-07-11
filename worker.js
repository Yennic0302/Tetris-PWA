const cacheName = "v1_tetris";
const urlsToCache = [
  "./index.html",
  "./tetris.js",
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
  "./style.css",
  "./img/favicon.ico",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        return cache.addAll(urlsToCache).then(() => self.skipWaiting());
      })
      .catch((e) => console.log(e))
  );
});

self.addEventListener("activate", (e) => {
  const cacheWhiteList = [cacheName];
  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        cacheNames.map((cacheName) => {
          if (cacheWhiteList.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        });
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) {
        return res;
      }
      return fetch(e.request);
    })
  );
});
