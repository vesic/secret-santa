importScripts("/lib/localforage.js");
importScripts("/js/constants.js");

self.addEventListener("install", event => {
  console.log("[ServiceWorker] Install");

  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // console.log("[ServiceWorker] Opened cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", async (event) => {
  // console.log('[ServiceWorker] Activate');

  // Removes previous cached data from disk.
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            // console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  await localforage.setItem(IS_PRESENT_BOUGHT_KEY, false);

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  // console.log('[ServiceWorker] Fetch', event.request.url);

  // Network falling back to cache strategy
  // https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#network-falling-back-to-cache

  // TODO: Maybe would be better to use "cache then network"?

  if (event.request.url.includes("/api/")) {
    // console.log('[Service Worker] Caching DATA', event.request.url);
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        // console.log('[Service Worker] Caching DATA => cache opened', cache);
        return fetch(event.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              // console.log('[Service Worker] Caching DATA => RESPONSE', response);
              cache.put(event.request.url, response.clone());
            } else {
              // console.log('[Service Worker] Caching DATA => BAD RESPONSE', response);
            }
            return response;
          })
          .catch(() => {
            // Network request failed, try to get it from the cache.
            // console.log('[Service Worker] Caching DATA => FAILED');
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      // console.log(`[Service Worker] STATIC page request:`, event.request)
      return cache.match(event.request).then(response => {
        // console.log('RESPONSE', response);
        if (response) {
          // console.log(`[Service Worker] STATIC page *** Returned response from cache for ${event.request.url} ***`);
        } else {
          // console.log(`[Service Worker] STATIC page fetching ${event.request.url}`);
        }
        return response || fetch(event.request);
      });
    })
  );
});

self.addEventListener("message", async (event) => {
  if ((event.data || {}).minutesLeft) {
    await buildReminderNotification(event.data.minutesLeft);
  }
});

self.addEventListener("push", async (event) => {
  const payload = event.data ? JSON.parse(event.data.text()) : "No payload";
  const isPayloadString = typeof payload === "string" || payload instanceof String;

  // if receive string show it
  // if receive complex data type generate string

  if (payload.type === "registration") {
    postMessageToClients(payload);
  }

  if (payload.type === "launch") {
    postMessageToClients(payload);
    await localforage.setItem(GIFT_RECEIVER_KEY, payload.data);
  }

  const isGameFinished = (payload === "Terminate");
  await localforage.setItem(IS_GAME_FINISHED_KEY, isGameFinished);

  if (isGameFinished) {
    await buildReminderNotification(0);
    postMessageToClients("finished");
  } else {
    const body = isPayloadString ? payload : buildMessage(payload);
    self.registration.showNotification("Secret Santa", { body })
  }
});

self.addEventListener(
  "notificationclick",
  function (event) {
    event.notification.close();

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage(event.action);
      });
    });

    localforage.setItem(IS_PRESENT_BOUGHT_KEY, event.action === "done");
  },
  false
);

async function buildReminderNotification(minutesLeft) {
  const isPresentBought = await localforage.getItem(IS_PRESENT_BOUGHT_KEY);
  const giftReceiver = await localforage.getItem(GIFT_RECEIVER_KEY);

  if (giftReceiver && !isPresentBought) {

    let body = minutesLeft ? `${minutesLeft} minutes left` : `The time has expired.`;
    body += `Have you bought the present?`;
    const actions = [{ action: "done", title: "Yes" }, { action: "not yet", title: "No" }];
    self.registration.showNotification("Secret Santa", { body, actions });
  }
}

function postMessageToClients(payload) {
  // console.log('[Service Worker] postMessage', payload);
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
