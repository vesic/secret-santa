function isLoggedIn() {
  return getToken();
}

function getToken() {
  return localStorage.getItem("token");
}

function saveToken(token) {
  localStorage.setItem("token", token);
}

function logout() {
  localStorage.removeItem("token");
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      console.log(registration);
      registration.unregister();
    }
  });
  window.location.href='/'
  window.location.reload();
}

function getCurrentSanta() {
  if (isLoggedIn()) {
    const token = this.getToken();
    const { email, name } = JSON.parse(atob(token.split(".")[1]));
    return { email, name };
  }
}
