window.addEventListener('load', (event) => {

  'use strict';

  let deferredInstallPrompt = null;
  // const installButton = document.getElementsByClassName("btnInstall")[0];
  // installButton.addEventListener("click", installPWA);
  
  const installButton = document.querySelector(".button-install");
  console.log('http://localhost:3000/');
  console.log(installButton);
  installButton.addEventListener("click", installPWA);
  
  // Event listener for beforeinstallprompt event
  window.addEventListener("beforeinstallprompt", saveBeforeInstallPromptEvent);
  
  /**
   * Event handler for beforeinstallprompt event.
   *   Saves the event & shows install button.
   *
   * @param {Event} evt
   */
  function saveBeforeInstallPromptEvent(evt) {
    // Add code to save event & show the install button.
    deferredInstallPrompt = evt;
    // installButton.removeAttribute("hidden");
    // setTimeout(() => {
    //   installButton.className += " show";
    // }, 500);
    // setTimeout(() => {
    //   installButton.innerHTML = `<img src="./images/download.svg" width="20px"></img>`
    //   installButton.className += " shrink"
    // }, 10000);
  }
  
  
  /**
   * Event handler for btnInstall - Does the PWA installation.
   *
   * @param {Event} evt
   */
  function installPWA(evt) {
    // Add code show install prompt & hide the install button.
    deferredInstallPrompt.prompt();
    // evt.srcElement.setAttribute("hidden", true);
    // Log user response to prompt.
    deferredInstallPrompt.userChoice
      .then((choice) => {
        if (choice.outcome === "accepted") {
          console.log("User accepted the A2HS prompt", choice);
        } else {
          console.log("User dismissed the A2HS prompt", choice);
        }
        deferredInstallPrompt = null;
      });
  }
  
  // Add event listener for appinstalled event
  window.addEventListener("appinstalled", logAppInstalled);
  /**
   * Event handler for appinstalled event.
   *   Log the installation to analytics or save the event somehow.
   *
   * @param {Event} evt
   */
  function logAppInstalled(evt) {
    // Add code to log the event
    console.log("Secret Santa App was installed.", evt);
  
  }
  
});
