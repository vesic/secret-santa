// check token
(async () => {
  if (!isLoggedIn()) {
    window.location.href = "/";
  }

  const wrapper = document.getElementsByClassName("santa-names-wrapper")[0];

  let res = await fetch("/api/santas");
  let json = await res.json();

  json.data.forEach(showSanta);

  const { name } = getCurrentSanta();

  if (await localforage.getItem(IS_GAME_FINISHED_KEY)) {
    showGameOverMessage();
  } else {
    const giftReceiver = await localforage.getItem(GIFT_RECEIVER_KEY);
    if (giftReceiver) {
      showGiftReceiverMsg(giftReceiver);
    }
  }
  const currentSanta = document.querySelector("#current-santa");
  if (currentSanta) {
    currentSanta.innerHTML = `${name}`;
  }

  navigator.serviceWorker.addEventListener("message", async event => {
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

    if (event.data === "finished") {
      showGameOverMessage();
    }

    if (event.data === "done") {
      location.href = "/well-done.html";
    }

    if (event.data === "not yet" && (await localforage.getItem(IS_GAME_FINISHED_KEY)) === true) {
      location.href = "/shame.html";
    }
  });

  function showGiftReceiverMsg(receiver) {
    const invitation = document.getElementById("invitation-wrapper");
    invitation.removeAttribute("hidden");

    document.querySelector("h1#header").innerHTML = `Congrats !`;
    document.querySelector("p#message").innerHTML = `You are chosen to be the Secret Santa to:`;

    const recipient = document.querySelector("p.recipient")
    recipient.innerHTML = `${receiver.name}`;
    recipient.style.cssText = "color: #fff; font-size: 30px; line-height: 40px; font-weight: 400";

    wrapper.removeAttribute("hidden");

    document.getElementById("santaThanks").setAttribute("hidden", "");
    document.getElementById("santaCongrats").removeAttribute("hidden");
  }

  function showGameOverMessage() {
    document.querySelector("p.notification").innerHTML = "The time has expired!";
  }

  async function cacheSanta(santa) {
    try {
      const { santas, cache, santasKey } = await getSantasFromCache();

      santas.push(santa);

      const newResponse = new Response(JSON.stringify(santas), {
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
      await cache.put(santasKey, newResponse);
    } catch (e) {
      console.error("ERROR IN CACHING NEW SANTA:", e);
    }
  }

  async function getSantasFromCache() {
    const cache = await caches.open(DATA_CACHE_NAME);
    const cachedRequests = await cache.keys();
    const santasKey = cachedRequests.filter(request => request.url.includes("api/santas"))[0];
    const santasResponse = await cache.match(santasKey);
    santas = await santasResponse.json();
    return { santas: [...santas.data], cache, santasKey };
  }

  function showSanta(santa, index) {
    const santaParagraph = document.createElement("li");
    santaParagraph.innerHTML = santa.name;
    santaParagraph.setAttribute("style", `--animation-order: ${index + 1};`);
    wrapper.appendChild(santaParagraph);
  }
})();
