window.addEventListener("load", event => {
  "use strict";

  let deferredInstallPrompt = null;
  const installButton = document.getElementsByClassName("btnInstall")[0];
  if (installButton) {
    installButton.addEventListener("click", installPWA);
  }

  window.addEventListener("beforeinstallprompt", saveBeforeInstallPromptEvent);

  function saveBeforeInstallPromptEvent(evt) {
    deferredInstallPrompt = evt;
    if (installButton) {
      installButton.removeAttribute("hidden");
    }
  }

  function installPWA(evt) {
    deferredInstallPrompt.prompt();
    evt.srcElement.setAttribute("hidden", true);
    deferredInstallPrompt.userChoice.then(choice => {
      if (choice.outcome === "accepted") {
        console.log("User accepted the A2HS prompt", choice);
      } else {
        console.log("User dismissed the A2HS prompt", choice);
      }
      deferredInstallPrompt = null;
    });
  }

  window.addEventListener("appinstalled", logAppInstalled);
  function logAppInstalled(evt) {
    console.log("Secret Santa App was installed.", evt);
  }
});
