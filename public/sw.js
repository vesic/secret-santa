self.addEventListener("install", function(event) {
  console.log('[install]');
});

self.addEventListener("activate", function(event) {
    console.log('[activated]');
});
