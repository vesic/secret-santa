const CACHE_NAME = "secret-santa-cache-v1";
const urls = [
  "index.html",
  "register.html"
]

self.addEventListener("install", (event) => {
  console.log('install...');
  // // Perform install steps
  // event.waitUntil(
  //   caches.open(CACHE_NAME).then(function(cache) {
  //     console.log("Opened cache");
  //     return cache.addAll(urls);
  //   })
  // );
});

self.addEventListener("fetch", (event) => {
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

// self.addEventListener('message', function(event){
//   console.log("SW Received Message: " + event);
// });

self.addEventListener("push", function(event) {
  console.log("PUSH RCV")
  const payload = event.data ? event.data.text() : "no payload";
  event.waitUntil(
    self.registration.showNotification("ServiceWorker Cookbook", {
      body: payload
    })
  );
});