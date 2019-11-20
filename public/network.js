function handleNetworkChange() {
  
    const isSantasPageActive = location.href.includes('santas.html');
    const isRegistrationPageActive = !isSantasPageActive;

    if (navigator.onLine) {
      document.body.classList.remove("offline");
      if (isSantasPageActive) {
        fetchSantas();
      }
    } else {
      document.body.classList.add("offline");
    }

    if (isRegistrationPageActive) {
        document.querySelector("button[type='submit']").disabled = !navigator.onLine;
    }
  }
  
  window.addEventListener("load", () => {
    handleNetworkChange();
  
    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);
  });