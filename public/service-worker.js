const CACHE_NAME = "secret-santa-cache-v1";
const urls = ["index.html", "santas.html"];

self.addEventListener("install", event => {
  console.log("install...");
  // // Perform install steps
  // event.waitUntil(
  //   caches.open(CACHE_NAME).then(function(cache) {
  //     console.log("Opened cache");
  //     return cache.addAll(urls);
  //   })
  // );
});

self.addEventListener("fetch", event => {
  // event.respondWith(
  //   caches.match(event.request).then(function(response) {
  //     // Cache hit - return response
  //     if (response) {
  //       return response;
  //     }
  //     return fetch(event.request);
  //   })
  // );
});

self.addEventListener("push", function(event) {
  const payload = event.data ? JSON.parse(event.data.text()) : "No payload";
  // if receive string show it
  // if receive complex data type generate string
  let body =
    typeof payload === "string" || payload instanceof String ? payload : "build string here";
  event.waitUntil(self.registration.showNotification("Secret Santa", { body }));
});
