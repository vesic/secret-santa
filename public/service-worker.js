importScripts("/localforage.js");

const CACHE_NAME = "secret-santa-cache-v1";
const DATA_CACHE_NAME = 'secret-santa-data-cache-v1';

const isPresentAlreadyBoughtKey = 'isPresentBought';
const giftReceiverKey = 'giftReceiver';
const isGameFinishedKey = 'isGameFinished';

const FILES_TO_CACHE = [
  // PAGES
  '/',
  'index.html',
  'santas.html',
  'well-done.html',
  'shame.html',

  // STYLES
  'styles.css',
  
  // SCRIPTS
  'auth.service.js',
  'install.js',
  'register.js',
  'santas.js',
  'network.js',

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

self.addEventListener('activate', async (event) => {

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

  await localforage.setItem(isPresentAlreadyBoughtKey, false);

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  console.log('[ServiceWorker] Fetch', event.request.url);

  // Network falling back to cache strategy
  // https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#network-falling-back-to-cache  

  // TODO: Maybe would be better to use "cache then network"?

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

self.addEventListener("push", async function(event) {

  const  payload = event.data ? JSON.parse(event.data.text()) : "No payload";
  const isPayloadString = typeof payload === "string" || payload instanceof String;
  
  // if receive string show it
  // if receive complex data type generate string

  if (payload.type === "registration") {
    postMessageToClients(payload);
  }

  if (payload.type === "launch") {
    postMessageToClients(payload);
    await localforage.setItem(giftReceiverKey, payload.data);
  }

  let body = null;
  let actions = [];
  let showNotification = true;

  // TODO: Use a different notification name (e.g. Remind All)
  const isGameFinished = (payload === "Terminate");
  if ((payload === "Notify All!") || isGameFinished) {
    await buildGiftReminderNotification(isGameFinished);
    if (isGameFinished) {
      postMessageToClients("finished");
    }
  } else {
    body = isPayloadString ? payload : buildMessage(payload);
  }

  if (showNotification) {
    event.waitUntil(self.registration.showNotification("Secret Santa", { body , actions }));
  }

  async function buildGiftReminderNotification(isGameFinished = false) {

    await localforage.setItem(isGameFinishedKey, isGameFinished);
    body = isGameFinished ? "The time has expired! " : "";
    const isPresentBought = await localforage.getItem(isPresentAlreadyBoughtKey);

    if (!isPresentBought) {
      body += "Have you bought a present?";
      actions = [  
        {action: 'done', title: 'Yes'},  
        {action: 'not yet', title: 'No'}
      ];  
    }

    showNotification = isGameFinished || !isPresentBought;
  }
});

self.addEventListener('notificationclick', function(event) {  

  event.notification.close();  

  self.clients.matchAll().then(
    clients => {
      clients.forEach(client => {
        client.postMessage(event.action);
      })
    }
  );

  localforage.setItem(isPresentAlreadyBoughtKey, event.action === 'done');

}, false);

function postMessageToClients(payload) {
  console.log('[Service Worker] postMessage', payload);
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(payload);
    });
  });
}

function buildMessage(data) {
  if (data.type === "registration") {
    return `${data.data.name} has just registered.`;
  }
  if (data.type === "launch") {
    return `You should buy a gift to ${data.data.name}!`;
  }
}