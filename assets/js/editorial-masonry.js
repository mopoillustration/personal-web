(() => {
  "use strict";

  const grid = document.querySelector("[data-editorial-grid]");
  const gallery = document.querySelector("[data-editorial-lightbox-gallery]");
  if (!grid || !gallery) return;

  const cards = Array.from(grid.querySelectorAll(".editorial-card"));
  let frame = 0;

  function scheduleLayout() {
    if (frame) {
      window.cancelAnimationFrame(frame);
    }
    frame = window.requestAnimationFrame(layout);
  }

  function layout() {
    frame = 0;

    const styles = window.getComputedStyle(grid);
    const columnCount = Math.max(
      1,
      Number.parseInt(styles.getPropertyValue("--editorial-column-count"), 10) || 1
    );
    const columnGap = Number.parseFloat(styles.columnGap) || 0;
    const rowGap = Number.parseFloat(styles.rowGap) || columnGap;
    const visibleCards = cards.filter((card) => !card.hidden);

    grid.classList.add("is-masonry-enhanced");

    if (visibleCards.length === 0 || grid.clientWidth === 0) {
      grid.style.height = "0px";
      return;
    }

    const cardWidth = (
      grid.clientWidth - (columnCount - 1) * columnGap
    ) / columnCount;
    const columnHeights = Array(columnCount).fill(0);

    visibleCards.forEach((card) => {
      let targetColumn = 0;

      for (let index = 1; index < columnHeights.length; index += 1) {
        if (columnHeights[index] < columnHeights[targetColumn]) {
          targetColumn = index;
        }
      }

      card.style.width = cardWidth + "px";
      card.style.transform = "translate(" + (
        targetColumn * (cardWidth + columnGap)
      ) + "px, " + columnHeights[targetColumn] + "px)";

      columnHeights[targetColumn] += card.getBoundingClientRect().height + rowGap;
    });

    grid.style.height = Math.max(...columnHeights) - rowGap + "px";
  }

  gallery.addEventListener("editorial:filterchange", scheduleLayout);
  gallery.addEventListener("lazyloaded", scheduleLayout);
  window.addEventListener("resize", scheduleLayout);
  window.addEventListener("load", scheduleLayout);

  if (typeof ResizeObserver === "function") {
    const resizeObserver = new ResizeObserver(scheduleLayout);
    resizeObserver.observe(grid);
    cards.forEach((card) => resizeObserver.observe(card));
  }

  scheduleLayout();
})();
