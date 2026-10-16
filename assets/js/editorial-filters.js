(() => {
  "use strict";

  const gallery = document.querySelector("[data-editorial-lightbox-gallery]");
  if (!gallery) return;

  const buttons = Array.from(
    gallery.querySelectorAll("[data-editorial-filter]")
  );
  const cards = Array.from(
    gallery.querySelectorAll(".editorial-card[data-editorial-categories]")
  );
  const status = gallery.querySelector("[data-editorial-filter-status]");
  let activeFilter = "all";

  function labelFor(filter) {
    return buttons.find((button) => button.dataset.editorialFilter === filter)
      ?.textContent.trim() || filter;
  }

  function applyFilters() {
    const showAll = activeFilter === "all";
    let visibleCount = 0;

    cards.forEach((card) => {
      const categories = (card.dataset.editorialCategories || "").split(" ");
      const isVisible = showAll || categories.includes(activeFilter);
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    buttons.forEach((button) => {
      const filter = button.dataset.editorialFilter;
      button.setAttribute("aria-pressed", String(filter === activeFilter));
    });

    if (status) {
      const context = showAll
        ? "All themes."
        : "Theme: " + labelFor(activeFilter) + ".";
      status.textContent = "Showing " + visibleCount + " of " + cards.length
        + " illustrations. " + context;
    }

    gallery.dispatchEvent(new Event("portfolio:masonry-reflow"));
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.editorialFilter;
      applyFilters();
    });
  });

  applyFilters();
})();
