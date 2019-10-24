const me = `
  <div style="width: 80%; margin: 0 auto;">
    <h2>About Me</h2>
  </div>
`;

const santas = `
  <div style="width: 80%; margin: 0 auto;">
    <h2>Santas</h2>
    <div id="renderList"></div>
  </div>
`;

const register = `
  <div style="width: 80%; margin: 0 auto;">
    <h2>Register</h2>
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

const home = `
  <div style="width: 80%; margin: 0 auto;">
    <h2>Home</h2>
  </div>
`

class App {
  renderHome() {
    document.querySelector("#app").innerHTML = home;
  }

  renderSantas() {
    function renderParticipants(element, index, arr) {
      const li = document.createElement("li");
      li.setAttribute("class", "participant");
      ul.appendChild(li);
      li.innerHTML = li.innerHTML + element;
    }

    document.querySelector("#app").innerHTML = santas;
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

  renderMe() {
    document.querySelector("#app").innerHTML = me;
  }

  renderRegister() {
    document.querySelector("#app").innerHTML = register;

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
