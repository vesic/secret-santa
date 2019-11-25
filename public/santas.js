// check token
if (!isLoggedIn()) {
  window.location.href = "/";
}

const wrapper = document.getElementsByClassName("santa-names-wrapper")[0];
let leftProperty = -535;
let duration = 10;

(async () => {
  let res = await fetch("/api/santas");
  let json = await res.json();

  // TODO: https://stackoverflow.com/questions/43043113/how-to-force-reloading-a-page-when-using-browser-back-button
  // (when we navigate back from other page using Back button, data are not loaded properly if new registrations happened in the meantime)
  console.log("FETCHED SANTAS: ", json);

  json.data.forEach(showSanta);

  wrapper.style.animationDuration = `${duration}s`;
  
  document.documentElement.style.setProperty('--left-var', `${leftProperty}px`);

  const { name } = getCurrentSanta();
  const giftReceiver = await localforage.getItem("giftReceiver");
  if (giftReceiver) {
    showGiftReceiverMsg(giftReceiver);
  }
  document.querySelector('#current-santa').innerHTML = `${name}`;
})();

navigator.serviceWorker.addEventListener('message', async (event) => {

  if (!event.data) {
    return;
  }

  if (event.data.type === "launch") {
    showGiftReceiverMsg(event.data.data);
  }

  if (event.data.type === "registration") {
    const santa = event.data.data;
    showSanta(santa);
    await cacheSanta(santa);
  }

  if (event.data === "done") {
    location.href = "/well-done.html";
  }
});

function showGiftReceiverMsg(receiver) {
  document.querySelector("p.notification").innerHTML = `You should buy a gift to ${receiver.name} (${receiver.email})!`;
}

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

function showSanta(santa, index) {
  const santaParagraph = document.createElement("p");
    santaParagraph.innerHTML = santa.name;
    santaParagraph.className = "santa-name"; 
    wrapper.appendChild(santaParagraph);   

    if (index >= 4) {
      santaWidth = document.getElementsByClassName("santa-name")[0].offsetWidth;
      leftProperty = leftProperty - santaWidth;
      duration = duration + 2;
    }
}
