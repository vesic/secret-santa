(async () => {
  document.querySelector("button[type='submit']").addEventListener("click", evt => {
    evt.preventDefault();
    const name = document.querySelector("#name");
    const email = document.querySelector("#email");
    // const password = document.querySelector("#pass");
    fetch("/api/santas", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: "randompass123"
      })
    })
      .then(response => {
        // handle token if ok
        // response.headers.forEach(function(value, name) {
        //   console.log(name + ": " + value);
        // });
        return response.json();
      })
      .then(data => {
        window.location.href = "/";
        // navigator.serviceWorker.register('/sw.js')
        //   .then(registration => {
        //     registration.showNotification('Participant added!', {})
        //   })
      })
      .catch(error => {
        console.log("Error ==>", error);
      });
  });
})();


(async () => {
  if (!"serviceWorker" in navigator) {
    console.log("Service Worker not supported");
    return;
  }
  const sw = await navigator.serviceWorker.register("/service-worker.js");
  console.log(sw)
})();

// if (!("PushManager" in window)) {
//   throw new Error("No Push API Support!");
// } else {
//   console.log("support!");
//   window.Notification.requestPermission().then(persission => {
//     if (persission !== "granted") {
//       throw new Error("Permission not granted!");
//     }
//   });
// }

// test local notifications
// Notification.requestPermission().then(function(result) {
//   if(result === 'granted') {
//     new Notification("Hello", {});
//   }
// });

/// =>
// navigator.serviceWorker.register("service-worker.js");

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

navigator.serviceWorker.ready
  .then(function(registration) {
    console.log('ready');
    return registration.pushManager.getSubscription().then(async function(subscription) {
      if (subscription) {
        return subscription;
      }

      const response = await fetch("./vapidPublicKey");
      const vapidPublicKey = await response.text();

      // const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      const convertedVapidKey = urlB64ToUint8Array(vapidPublicKey);

      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    });
  })
  .then(function(subscription) {
    fetch("./register", {
      method: "post",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        subscription: subscription
      })
    });

    // document.getElementById('doIt').onclick = function() {
    //   const payload = document.getElementById('notification-payload').value;
    //   const delay = document.getElementById('notification-delay').value;
    //   const ttl = document.getElementById('notification-ttl').value;

    //   fetch('./sendNotification', {
    //     method: 'post',
    //     headers: {
    //       'Content-type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //       subscription: subscription,
    //       payload: payload,
    //       delay: delay,
    //       ttl: ttl,
    //     }),
    //   });
    // };

    // here we have sub
    setTimeout(() => {
      fetch("./sendNotification", {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          subscription: subscription,
          payload: 'Payload',
          delay: '0',
          ttl: '0'
        })
      });
    }, 0);

  });
/// =>
