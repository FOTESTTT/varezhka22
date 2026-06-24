const data = getSiteData();

document.querySelector("[data-site-name]").textContent = data.site.name;
document.querySelector("[data-site-season]").textContent = data.site.season;
document.querySelector("[data-site-hours]").textContent = data.site.hours;
document.querySelector("[data-site-phone]").textContent = data.site.phone;
document.querySelector("[data-site-address]").textContent = data.site.address;
document.querySelector("[data-site-copyright]").textContent = data.site.copyright;

const menuList = document.querySelector("#menuList");
menuList.innerHTML = data.menu
  .map(
    (category) => `
      <article class="menu-category card">
        <h2>${escapeHtml(category.category)}</h2>
        <div class="menu-items">
          ${category.items
            .map(
              (item) => `
                <div class="menu-item">
                  <span class="item-name">${escapeHtml(item.name)}</span>
                  <span class="item-price">${escapeHtml(item.price)}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </article>
    `
  )
  .join("");
