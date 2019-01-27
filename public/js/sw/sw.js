
console.log("SW startup!");
const staticCacheName = 'kmgv-static-v1';
const contentImgsCache = 'kmgv-imgs';
const allCaches = [
  staticCacheName,
  contentImgsCache
];



self.addEventListener('install', function(event) {
    console.log("Installed!");
    event.waitUntil(
      caches.open(staticCacheName).then(function(cache) {
        console.log("cache created!");
        return cache.addAll([
          '/css/medium.css',
          '/css/small.css',
          '/css/style.css',
          'favicon.ico',
          '/js/jquery-3.3.1.min.js',
          'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
          'https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css'
        ]);
      }).catch(function(error){
          console.log(error);
      })
    );
});


self.addEventListener('activate', function(event) { // update sw version changed
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
        return Promise.all(
            cacheNames.filter(function(cacheName) {
                return cacheName.startsWith('kmgv-') &&
                    !allCaches.includes(cacheName);
            }).map(function(cacheName) {
                return caches.delete(cacheName);
            })
        );
        })
    );
});

self.addEventListener('fetch', function(event) {

  });

self.addEventListener('fetch', function(event) {
    var requestUrl = new URL(event.request.url);

    /*
    if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname.startsWith('/images/')) {
            event.respondWith(servePhoto(event.request));
            return;
        }
    }

    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })

    ); */
    event.respondWith(
        caches.open(staticCacheName).then(function(cache) {
          return cache.match(event.request).then(function (response) {
            return response || fetch(event.request).then(function(response) {
              cache.put(event.request, response.clone());
              return response;
            });
          });
        })
      );
});

/*

function servePhoto(request) {
    var storageUrl = request.url; //.replace(/-\d+px\.jpg$/, '');
    console.log(storageUrl);
    return caches.open(contentImgsCache).then(function(cache) {
        return cache.match(storageUrl).then(function(response) {
        if (response) return response;

        return fetch(request).then(function(networkResponse) {
            cache.put(storageUrl, networkResponse.clone());
            return networkResponse;
        });
        });
    });
}
*/