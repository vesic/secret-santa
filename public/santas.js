// check token
if (!isLoggedIn()) {
  window.location.href = "/";
}

(async () => {
  let res = await fetch("/api/santas");
  let json = await res.json();

  json.data.forEach(addSanta);
  const { name, email } = getCurrentSanta();
  document.querySelector('#current-santa').innerHTML = `${name}`;
})();

function addSanta(santa) {
  const table = document.querySelector("table");
  const row = table.insertRow();
  const cell0 = row.insertCell(0);
  const cell1 = row.insertCell(1);
  const cell2 = row.insertCell(2);
  cell0.appendChild(document.createTextNode(table.rows.length - 1));
  cell1.appendChild(document.createTextNode(santa.name));
  cell2.appendChild(document.createTextNode(santa.email));
}

navigator.serviceWorker.addEventListener('message', event => {
  if (event.data.type === "registration") {
    // TODO: Add it to the cache, as well 
    addSanta(event.data.data);
  }

  if (event.data === "done") {
    location.href = "/well-done.html";
  }
});