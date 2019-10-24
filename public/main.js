const app = new App();
const router = new Router();

router.get('/', req => {
  app.renderHome();
});

router.get("/santas", req => {
  console.log(req.path);
  app.renderSantas();
});

router.get("/me", req => {
  console.log(req.path);
  app.renderMe();
});

router.get("/register", req => {
  console.log(req.path);
  app.renderRegister();
});

router.init();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}


if (!('PushManager' in window)) {
  throw new Error('No Push API Support!')
} else {
  console.log('support!')
  window.Notification.requestPermission()
    .then(persission => {
      if (persission !== 'granted') {
        throw new Error('Permission not granted!');
      } 
    })
}