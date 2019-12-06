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
  let santa = getCurrentSanta();
  fetch("/api/santas/log-out", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: santa._id
    })
  })
    .then(res => res.json())
    .then(res => {
      // do something w/ response
    })
    .finally(() => {
      localStorage.removeItem("token");
      window.location.href = "/";
    });
}

function getCurrentSanta() {
  if (isLoggedIn()) {
    const token = this.getToken();
    const { _id, email, name } = JSON.parse(atob(token.split(".")[1]));
    return { _id, email, name };
  }
}
