(() => {
  "use strict";

  document.querySelectorAll("[data-about-bio-toggle]").forEach((component) => {
    const copy = component.querySelector("[data-about-bio-copy]");
    const button = component.querySelector("[data-about-bio-toggle-button]");
    const firstPerson = component.querySelector("[data-about-bio-first]");
    const thirdPerson = component.querySelector("[data-about-bio-third]");

    if (!copy || !button || !firstPerson || !thirdPerson) {
      return;
    }

    let isThirdPerson = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateButton = () => {
      const nextLabel = isThirdPerson
        ? "View in first person"
        : "View in third person";

      button.textContent = nextLabel;
      button.setAttribute("aria-label", nextLabel);
      button.setAttribute("aria-pressed", String(isThirdPerson));
    };

    const renderVersion = (showThirdPerson) => {
      const source = showThirdPerson ? thirdPerson : firstPerson;
      copy.replaceChildren(source.content.cloneNode(true));
      isThirdPerson = showThirdPerson;
      updateButton();
    };

    const switchVersion = () => {
      const showThirdPerson = !isThirdPerson;

      if (reducedMotion.matches) {
        renderVersion(showThirdPerson);
        return;
      }

      button.disabled = true;
      component.classList.add("is-switching");

      window.setTimeout(() => {
        renderVersion(showThirdPerson);
        component.classList.remove("is-switching");
        button.disabled = false;
      }, 140);
    };

    updateButton();
    component.classList.add("is-ready");
    button.addEventListener("click", switchVersion);
  });
})();
