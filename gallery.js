const data = getSiteData();
const grid = document.querySelector("#galleryGrid");
const modal = document.querySelector("#mediaModal");
const modalBody = document.querySelector("#modalBody");
const closeButton = document.querySelector(".modal-close");

document.querySelector("[data-site-name]").textContent = data.site.name;
document.querySelector("[data-site-copyright]").textContent = data.site.copyright;

grid.innerHTML = data.gallery
  .map((item, index) => {
    if (item.type === "video") {
      return `
        <button class="gallery-item gallery-item-video" type="button" data-index="${index}">
          <video muted playsinline preload="metadata" poster="${escapeHtml(item.poster || "")}">
            <source src="${escapeHtml(item.src)}" type="video/mp4">
          </video>
          <span class="gallery-kind">Видео</span>
          <span class="gallery-label">${escapeHtml(item.title)}<span class="play-mark">▶</span></span>
        </button>
      `;
    }

    return `
      <button class="gallery-item" type="button" data-index="${index}">
        <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" loading="lazy">
        <span class="gallery-kind">Фото</span>
        <span class="gallery-label">${escapeHtml(item.title)}</span>
      </button>
    `;
  })
  .join("");

function openMedia(item) {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (item.type === "video") {
    modalBody.innerHTML = `
      <video controls autoplay>
        <source src="${escapeHtml(item.src)}" type="video/mp4">
        Ваш браузер не поддерживает видео.
      </video>
    `;
  } else {
    modalBody.innerHTML = `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}">`;
  }
}

function closeMedia() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modalBody.innerHTML = "";
  document.body.style.overflow = "";
}

grid.addEventListener("click", (event) => {
  const itemButton = event.target.closest(".gallery-item");
  if (!itemButton) return;
  openMedia(data.gallery[Number(itemButton.dataset.index)]);
});

closeButton.addEventListener("click", closeMedia);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeMedia();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMedia();
});
