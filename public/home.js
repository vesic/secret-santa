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
})();

(async () => {
  if (!"serviceWorker" in navigator) {
    console.log("Service Worker not supported");
    return;
  }
  const sw = await navigator.serviceWorker.register("/service-worker.js");
  console.log(sw)
})();

// if (!("PushManager" in window)) {
//   throw new Error("No Push API Support!");
// } else {
//   console.log("support!");
//   window.Notification.requestPermission().then(persission => {
//     if (persission !== "granted") {
//       throw new Error("Permission not granted!");
//     }
//   });
// }
