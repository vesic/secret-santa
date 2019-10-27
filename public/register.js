(async () => {
  document.querySelector("button[type='submit']").addEventListener("click", evt => {
    evt.preventDefault();
    const name = document.querySelector("#name");
    const email = document.querySelector("#email");
    // const password = document.querySelector("#pass");
    fetch("/api/santas", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: "randompass123"
      })
    })
      .then(response => {
        // handle token if ok
        // response.headers.forEach(function(value, name) {
        //   console.log(name + ": " + value);
        // });
        return response.json();
      })
      .then(data => {
        window.location.href = "/";
        // navigator.serviceWorker.register('/sw.js')
        //   .then(registration => {
        //     registration.showNotification('Participant added!', {})
        //   })
      })
      .catch(error => {
        console.log("Error ==>", error);
      });
  });
})();
