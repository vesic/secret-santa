const CACHE_NAME = "secret-santa-cache-v2";
const DATA_CACHE_NAME = 'secret-santa-data-cache-v1';

const FILES_TO_CACHE = [
  // PAGES
  '/',
  'index.html',
  'santas.html',

  // STYLES
  'styles.css',
  
  // SCRIPTS
  'auth.service.js',
  'install.js',
  'register.js',
  'santas.js',

  // IMAGES
  'images/congrats.svg',
  'images/happy.svg',
  'images/santa_address.svg',
  'images/santa_stamp.svg',
  'images/santa.svg',
  'images/secret_santa_bg.png',
  'images/secret_santa_icon.svg',
  'images/shame.svg',
  'images/thank_you.svg',
  'images/wondering.svg',
];

self.addEventListener("install", event => {

  console.log("[ServiceWorker] Install");
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("[ServiceWorker] Opened cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {

  console.log('[ServiceWorker] Activate');

  // Removes previous cached data from disk.
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  console.log('[ServiceWorker] Fetch', event.request.url);

  // Network falling back to cache strategy
  // https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#network-falling-back-to-cache  

  if (event.request.url.includes('/api/')) {
    console.log('[Service Worker] Caching DATA', event.request.url);
    event.respondWith(
        caches.open(DATA_CACHE_NAME).then((cache) => {
          console.log('[Service Worker] Caching DATA => cache opened', cache);
          return fetch(event.request)
              .then((response) => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  console.log('[Service Worker] Caching DATA => RESPONSE', response);
                  cache.put(event.request.url, response.clone());
                } else {
                  console.log('[Service Worker] Caching DATA => BAD RESPONSE', response);
                }
                return response;
              }).catch(() => {
                // Network request failed, try to get it from the cache.
                console.log('[Service Worker] Caching DATA => FAILED');
                return cache.match(event.request);
              });
        }));
    return;
  }

  event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        console.log(`[Service Worker] STATIC page request:`, event.request)
        return cache.match(event.request)
            .then((response) => {
              console.log('RESPONSE', response);
              if (response) {
                console.log(`[Service Worker] STATIC page *** Returned response from cache for ${event.request.url} ***`);
              } else {
                console.log(`[Service Worker] STATIC page fetching ${event.request.url}`);
              }
              return response || fetch(event.request);
            });
      })
  );
});

self.addEventListener("push", function(event) {
  const payload = event.data ? JSON.parse(event.data.text()) : "No payload";
  // if receive string show it
  // if receive complex data type generate string
  console.log(payload);
  let body =
    typeof payload === "string" || payload instanceof String ? payload : "build string here";
  event.waitUntil(self.registration.showNotification("Secret Santa", { body }));
});
