const data = getSiteData();
const coords = data.site.mapCenter;

document.querySelector("[data-site-name]").textContent = data.site.name;
document.querySelector("[data-site-title]").textContent = data.site.title;
document.querySelector("[data-site-address]").textContent = data.site.address;
document.querySelector("[data-site-phone]").textContent = data.site.phone;
document.querySelector("[data-site-phone-link]").href = `tel:${data.site.phone.replace(/[^\d+]/g, "")}`;
document.querySelector("[data-site-hours]").textContent = data.site.hours;
document.querySelector("[data-site-copyright]").textContent = data.site.copyright;
document.querySelector("#routeLink").href = `https://yandex.ru/maps/?rtext=~${coords[0]},${coords[1]}&rtt=auto`;

function showMapFallback() {
  document.querySelector("#map").innerHTML = `
    <div class="map-fallback">
      <p>Карта не загрузилась. Проверьте подключение к интернету.</p>
    </div>
  `;
}

if (window.ymaps) {
  ymaps.ready(() => {
    const map = new ymaps.Map("map", {
      center: coords,
      zoom: 16,
      controls: ["zoomControl", "fullscreenControl"]
    });

    const marker = new ymaps.Placemark(coords, {
      hintContent: data.site.title,
      balloonContent: `${data.site.title}<br>${data.site.address}<br>${data.site.hours}`
    });

    map.geoObjects.add(marker);
    marker.balloon.open();
  });
} else {
  showMapFallback();
}
