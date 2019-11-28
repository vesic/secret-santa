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

// check token
if (isLoggedIn()) {
  window.location.href = "/santas.html";
}

(async () => {
  document.querySelector("button[type='submit']").addEventListener("click", evt => {
    evt.preventDefault();
    const name = document.querySelector("#name");
    const email = document.querySelector("#email");
    const registration = localStorage.getItem("keys:auth");
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
        password: "randompass123",
        registration: registration ? registration : ""
      })
    })
      .then(response => {
        if (response.status === 400) {
          return response.json().then(res => {
            throw res;
          });
        }
        response.headers.forEach((value, name) => {
          if (name === "x-auth-token") {
            saveToken(value);
          }
        });
        return response.json();
      })
      .then(res => {
        window.location.href = "/santas.html";
      })
      .catch(e => {
        window.alert(e.error);
      });
  });
})();

(async () => {
  if (!"serviceWorker" in navigator) {
    console.log("Service Worker not supported");
    return;
  }
  if (!("PushManager" in window)) {
    throw new Error("No Push API Support");
  }
  const sw = await navigator.serviceWorker.register("/service-worker.js");
  // console.log(sw)
  navigator.serviceWorker.ready
    .then(function(registration) {
      return registration.pushManager.getSubscription().then(async function(subscription) {
        if (subscription) return subscription;
        const response = await fetch("/vapidPublicKey");
        const vapidPublicKey = await response.text();
        const convertedVapidKey = urlB64ToUint8Array(vapidPublicKey);
        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      });
    })
    .then(function(subscription) {
      fetch("/register", {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          subscription: subscription
        })
      })
        .then(res => res.json())
        .then(res => {
          localStorage.setItem("keys:auth", res["subscription.keys.auth"]);
        });
    });
})();
