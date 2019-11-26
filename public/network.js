function handleNetworkChange() {
  
    if (navigator.onLine) {
      document.body.classList.remove("offline");
    } else {
      document.body.classList.add("offline");
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