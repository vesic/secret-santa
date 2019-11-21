// check token
if (!isLoggedIn()) {
  window.location.href = "/";
}

(async () => {
  let res = await fetch("/api/santas");
  let json = await res.json();

  json.data.forEach(showSanta);
  const { name } = getCurrentSanta();
  document.querySelector('#current-santa').innerHTML = `${name}`;
})();

navigator.serviceWorker.addEventListener('message', async (event) => {
  if (event.data.type === "registration") {
    const santa = event.data.data;
    showSanta(santa);
    await cacheSanta(santa);
  }

  if (event.data === "done") {
    location.href = "/well-done.html";
  }
});

async function cacheSanta(santa) {
  try {
    const { santas, cache, santasKey } = await getSantasFromCache();

    santas.push(santa);
    
    const newResponse = new Response(JSON.stringify(santas), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    await cache.put(santasKey, newResponse);
  }
  catch (e) {
    console.error("ERROR IN CACHING NEW SANTA:", e);
  }
}

async function getSantasFromCache() {
  // TODO: put all constants into a separate file
  const cache = await caches.open('secret-santa-data-cache-v1');
  const cachedRequests = await cache.keys();
  const santasKey = cachedRequests.filter(request => request.url.includes('api/santas'))[0];
  const santasResponse = await cache.match(santasKey);
  santas = await santasResponse.json();
  return { santas: [...santas.data], cache, santasKey };
}

function showSanta(santa) {
  const table = document.querySelector("table");
  const row = table.insertRow();
  const cell0 = row.insertCell(0);
  const cell1 = row.insertCell(1);
  const cell2 = row.insertCell(2);
  cell0.appendChild(document.createTextNode(table.rows.length - 1));
  cell1.appendChild(document.createTextNode(santa.name));
  cell2.appendChild(document.createTextNode(santa.email));
}
