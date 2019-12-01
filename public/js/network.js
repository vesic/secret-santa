// task
function handleNetworkChange() {
  if (navigator.onLine) {
    document.querySelector(".icon-offline").classList.add("hidden");
  } else {
    document.querySelector(".icon-offline").classList.remove("hidden");
  }

  const registerButton = document.querySelector("button[type='submit']");
  if (registerButton) {
    registerButton.disabled = !navigator.onLine;
  }
}

window.addEventListener("load", () => {
  handleNetworkChange();
  window.addEventListener("online", handleNetworkChange);
  window.addEventListener("offline", handleNetworkChange);
});
//end
