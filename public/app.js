const about = `
  <div style="width: 80%; margin: 0 auto;">
    <h2>About</h2>
  </div>
`;
const home = `
  <div style="width: 80%; margin: 0 auto;">
    <h2>Participants</h2>
    <div id="renderList"></div>
  </div>
`;

const login = `
  <div style="width: 80%; margin: 0 auto;">
    <h2>Login</h2>
    <form>
    <label for="fname">Name</label>
    <input type="text" id="fname" name="fname">
    <label for="email">Email</label>
    <input type="text" id="email" name="email">
    <label for="pass">Password</label>
    <input type="text" id="pass" name="pass">
    <input type="button" id="button" value="Button">
  </form>
  </div>
`;

class App {
  renderHome() {
    function renderParticipants(element, index, arr) {
      const li = document.createElement("li");
      li.setAttribute("class", "participant");
      ul.appendChild(li);
      li.innerHTML = li.innerHTML + element;
    }

    document.querySelector("#app").innerHTML = home;
    const ul = document.createElement("ul");
    ul.setAttribute("id", "participants");

    fetch("/api/users/all")
      .then(response => response.json())
      .then(data => {
        const productList = data.all.map(d => `${d.name} - ${d.email}`);
        document.getElementById("renderList").appendChild(ul);
        productList.forEach(renderParticipants);
      });
  }

  renderAbout() {
    document.querySelector("#app").innerHTML = about;
  }

  renderLogin() {
    document.querySelector("#app").innerHTML = login;

    document.querySelector("#button").addEventListener("click", () => {
      const name = document.querySelector("#fname");
      const email = document.querySelector("#email");
      const password = document.querySelector("#pass");
      fetch("/api/users", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.value,
          email: email.value,
          password: password.value
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
          window.location.href = "/home";
          navigator.serviceWorker.register('/sw.js')
            .then(registration => {
              registration.showNotification('Participant added!', {})
            })
        })
        .catch(error => {
          console.log("Error ==>", error);
        });
    });
  }
}
