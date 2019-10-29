// check token
if (!isLoggedIn()) {
  window.location.href = "/";
}

(async () => {
  let res = await fetch("/api/santas");
  let json = await res.json();
  const table = document.querySelector("table");
  json.data.map((santa, index) => {
    const row = table.insertRow();
    const cell0 = row.insertCell(0);
    const cell1 = row.insertCell(1);
    const cell2 = row.insertCell(2);
    cell0.appendChild(document.createTextNode(index + 1));
    cell1.appendChild(document.createTextNode(santa.name));
    cell2.appendChild(document.createTextNode(santa.email));
  });
  const { name, email } = getCurrentSanta();
  document.querySelector('#current-santa').innerHTML = `Hola - ${email}`;
})();
