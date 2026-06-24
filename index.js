const data = getSiteData();

document.title = data.site.title;

document.querySelectorAll("[data-site-name]").forEach((node) => {
  node.textContent = data.site.name;
});
document.querySelector("[data-site-title]").textContent = data.site.title;
document.querySelector("[data-site-tagline]").textContent = data.site.tagline;
document.querySelector("[data-site-description]").textContent = data.site.description;
document.querySelector("[data-site-address]").textContent = data.site.address;
document.querySelector("[data-site-phone]").textContent = data.site.phone;
document.querySelector("[data-site-phone-link]").href = `tel:${data.site.phone.replace(/[^\d+]/g, "")}`;
document.querySelector("[data-site-hours]").textContent = data.site.hours;
document.querySelector("[data-site-copyright]").textContent = data.site.copyright;

const features = document.querySelector("#features");
features.innerHTML = data.features
  .map(
    (feature) => `
      <article class="feature-card card">
        <h3>${escapeHtml(feature.title)}</h3>
        <p>${escapeHtml(feature.text)}</p>
      </article>
    `
  )
  .join("");

const promoSlider = document.querySelector("#promoSlider");
let activePromoIndex = 0;

function renderPromotions() {
  if (!promoSlider || !data.promotions?.length) return;

  promoSlider.innerHTML = data.promotions
    .map(
      (promo, index) => `
        <article class="promo-slide ${index === activePromoIndex ? "active" : ""}">
          <div class="promo-copy">
            <h3>${escapeHtml(promo.title)}</h3>
            <p>${escapeHtml(promo.text)}</p>
          </div>
          <img src="${escapeHtml(promo.image)}" alt="${escapeHtml(promo.title)}">
        </article>
      `
    )
    .join("");
}

function showPromo(nextIndex) {
  activePromoIndex = (nextIndex + data.promotions.length) % data.promotions.length;
  renderPromotions();
}

document.querySelector("[data-slider-prev]")?.addEventListener("click", () => showPromo(activePromoIndex - 1));
document.querySelector("[data-slider-next]")?.addEventListener("click", () => showPromo(activePromoIndex + 1));

if (data.promotions?.length) {
  renderPromotions();
  window.setInterval(() => showPromo(activePromoIndex + 1), 5000);
}
