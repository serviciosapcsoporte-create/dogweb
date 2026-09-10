/* DogWeb - Service Worker v2
   GitHub Pages fija Cache-Control max-age=600 y no permite headers custom.
   Este SW da cache de larga duracion a assets estaticos (stale-while-revalidate),
   network-first para navegacion (html siempre fresco) y fallback offline. */
var CACHE = 'dogweb-v2';
var CORE = [
  '/',
  '/index.html',
  '/blog.html',
  '/logo.png',
  '/og-image.png',
  '/chat/cristal-loader.js',
  '/chat/cristal.css',
  '/chat/cristal.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(CORE);
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var request = e.request;
  if (request.method !== 'GET') { return; }
  var url = new URL(request.url);
  if (url.origin !== location.origin) { return; }

  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).then(function(resp) {
        if (resp && resp.status === 200) {
          var copy = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(request, copy); });
        }
        return resp;
      }).catch(function() {
        return caches.match(request).then(function(cached) {
          if (cached) { return cached; }
          return caches.match('/index.html');
        });
      })
    );
    return;
  }

  var isStatic = /\.(webp|png|jpg|jpeg|avif|css|js|woff2?|ico|svg|mp4|webm)$/.test(url.pathname);
  if (isStatic) {
    e.respondWith(
      caches.match(request).then(function(cached) {
        var network = fetch(request).then(function(resp) {
          if (resp && resp.status === 200) {
            var copy = resp.clone();
            caches.open(CACHE).then(function(c) { c.put(request, copy); });
          }
          return resp;
        }).catch(function() { return cached; });
        return cached || network;
      }).catch(function() {
        return fetch(request);
      })
    );
  }
});