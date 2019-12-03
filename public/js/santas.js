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
      const invitation = document.getElementById("invitation-wrapper");
      // invitation.removeAttribute("hidden");
      showGiftReceiverMsg(giftReceiver);
    }
  }

  startTimer();

  document.querySelector("#current-santa").innerHTML = `${name}`;

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
    document.querySelector(
      "p.recipient"
    ).innerHTML = `You are chosen to be the Secret Santa to: ${receiver.name}`;
    document.querySelector("p.recipient").innerHTML = `Buy gift for ${receiver.name}!`;
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

  function startTimer() {

    // NOTE: Change this time if needed, make sure that it's greater than the current time
    const endTime = moment('13:00', "HH:mm");

    const intervalId = window.setInterval(() => {

      let currentTime = moment();
      const timeInfo = getReminderTimeInfo();

      console.log("TimeInfo: ", timeInfo);

      if (timeInfo.minutesLeft === 0) {
        window.clearInterval(intervalId);
        return;
      }

      if ((timeInfo.minutesLeft % timeInfo.reminderShowingIntervalInMinutes) === 0) {
        navigator.serviceWorker.controller.postMessage({ minutesLeft: timeInfo.minutesLeft });
      }

      function getReminderTimeInfo() {

        let minutesLeft = Math.trunc(moment.duration(endTime.diff(currentTime)).asMinutes());

        // NOTE: This code decreases interval for showing reminder from 30 to 15 mins, in dependence on how much time has left to the end of the event.
        // For the demo purposes, we can change that interval to be always 1 min.

        // const reminderShowingIntervalInMinutes = 1;
        const reminderShowingIntervalInMinutes = (minutesLeft > 60) ? 30 : ((minutesLeft > 15) ? 15 : 5);

        return {
          reminderShowingIntervalInMinutes,
          minutesLeft,
        };
      }

    }, 60000)
  }
})();
