var staticCacheName = 'restaurant-app-v3';
var urlToCache = [
  '/',
  '/js/idb.js',
  'restaurant.html',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/register_sw.js',
  '/js/restaurant_info.js',
  'sw.js',
  '/css/styles.css',
  '/img/1.webp',
  '/img/2.webp',
  '/img/3.webp',
  '/img/4.webp',
  '/img/5.webp',
  '/img/6.webp',
  '/img/7.webp',
  '/img/8.webp',
  '/img/9.webp',
  '/img/10.webp',
  '/img/map.webp',
  '/img/placeholder.webp'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(urlToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-app-') &&
                   cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(networkResponse => {
        if (networkResponse.status === 404) {
          return;
        }
        return caches.open(staticCacheName).then(cache => {
          cache.put(event.request.url, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(error => {
      console.log('Error:', error);
      return;
    })
  );
});
  
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('sync', function (event) {
  if (event.tag == 'firstSync') {
    const DBOpenRequest = indexedDB.open('restaurant-app-db', 1);
    DBOpenRequest.onsuccess = function (e) {
      db = DBOpenRequest.result;
      let tx = db.transaction('offline-reviews', 'readwrite');
      let store = tx.objectStore('offline-reviews');
      let request = store.getAll();
      request.onsuccess = function () {
        for (let i = 0; i < request.result.length; i++) {
          fetch('http://localhost:1337/reviews/', {
            body: JSON.stringify(request.result[i]),
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
              'content-type': 'application/json'
            },
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            referrer: 'no-referrer',
          })
            .then(response => {
              return response.json();
            })
            .then(data => {
              let tx = db.transaction('reviews-obj', 'readwrite');
              let store = tx.objectStore('reviews-obj');
              let request = store.add(data);
              request.onsuccess = function (data) {
                let tx = db.transaction('offline-reviews', 'readwrite');
                let store = tx.objectStore('offline-reviews');
                let request = store.clear();
                request.onsuccess = function () { };
                request.onerror = function (error) {
                  console.log('Problem with objectStore' , error);
                };
              };
              request.onerror = function (error) {
                console.log('Problem with objectStore and IDB', error);
              };
            })
            .catch(error => {
              console.log('Promlem with a POST fetch', error);
            });
        }
      };
    };
  }
});
  