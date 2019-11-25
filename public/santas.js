// check token
if (!isLoggedIn()) {
  window.location.href = "/";
}

(async () => {
  let res = await fetch("/api/santas");
  let json = await res.json();
  let santas = json.data;
  const wrapper = document.getElementsByClassName("santa-names-wrapper")[0];
  let leftProperty = -535;
  let duration = 8;

  santas.forEach(santa => {
    const santaParagraph = document.createElement("p");
    santaParagraph.innerHTML = santa.name;
    santaParagraph.className = "santa-name"; 
    wrapper.appendChild(santaParagraph);   

    if (santas.length >= 5) {
      santaWidth = document.getElementsByClassName("santa-name")[0].offsetWidth;
      leftProperty = leftProperty - santaWidth;
      duration = duration + 2;
    }
  });

  wrapper.style.animationDuration = `${duration}s`;
  
  document.documentElement.style.setProperty('--left-var', `${leftProperty}px`);
  
  const { name } = getCurrentSanta();
  document.querySelector('#current-santa').innerHTML = `${name}`;
})();
