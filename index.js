const data = getSiteData();
const heroVideo = document.querySelector(".hero-video");
const soundButton = document.querySelector("[data-video-sound]");
let heroVideoLoaded = false;

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

function loadHeroVideo() {
  if (!heroVideo) return;

  const source = heroVideo.dataset.src;
  if (!source || heroVideo.src) return;

  heroVideo.src = source;
  heroVideo.load();
  heroVideoLoaded = true;
  heroVideo.play().catch(() => {});
  updateSoundButton();
}

function updateSoundButton() {
  if (!heroVideo || !soundButton) return;

  if (!heroVideoLoaded && shouldDeferHeroVideo()) {
    soundButton.textContent = "Включить видео";
    soundButton.setAttribute("aria-label", "Включить видео");
    return;
  }

  soundButton.textContent = heroVideo.muted ? "Звук выкл." : "Звук вкл.";
  soundButton.setAttribute("aria-label", heroVideo.muted ? "Включить звук" : "Выключить звук");
}

function shouldDeferHeroVideo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSmallScreen = window.matchMedia("(max-width: 760px)").matches;
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isSlowConnection = ["slow-2g", "2g", "3g"].includes(connection?.effectiveType);

  return Boolean(connection?.saveData || isSlowConnection || isSmallScreen || isAndroid);
}

if (heroVideo && soundButton) {
  soundButton.addEventListener("click", () => {
    if (!heroVideoLoaded) {
      loadHeroVideo();
      return;
    }

    heroVideo.muted = !heroVideo.muted;
    heroVideo.play().catch(() => {});
    updateSoundButton();
  });

  heroVideo.addEventListener("pause", () => {
    if (!document.hidden) {
      heroVideo.play().catch(() => {});
    }
  });

  updateSoundButton();
  window.addEventListener("load", () => {
    if (shouldDeferHeroVideo()) return;

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadHeroVideo, { timeout: 1800 });
      return;
    }

    window.setTimeout(loadHeroVideo, 600);
  });
}

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
          <img src="${escapeHtml(promo.image)}" alt="${escapeHtml(promo.title)}" loading="lazy" decoding="async">
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
