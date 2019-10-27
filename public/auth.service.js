function isLoggedIn() {
  return getToken();
}

function getToken() {
  return localStorage.getItem("token");
}

function saveToken(token) {
  localStorage.setItem("token", token);
}

function getCurrentSanta() {
  if (isLoggedIn()) {
    const token = this.getToken();
    const { email, name } = JSON.parse(atob(token.split(".")[1]));
    return { email, name };
  }
}
