let data = cloneDefaultData();

const loginPanel = document.querySelector("#loginPanel");
const adminShell = document.querySelector("#adminShell");
const loginForm = document.querySelector("#loginForm");
const loginButton = document.querySelector("#loginButton");
const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const loginError = document.querySelector("#loginError");
const logoutButton = document.querySelector("#logoutButton");
const adminUser = document.querySelector("#adminUser");
const adminUsernameInput = document.querySelector("#adminUsernameInput");
const adminPasswordInput = document.querySelector("#adminPasswordInput");
const adminPasswordRepeatInput = document.querySelector("#adminPasswordRepeatInput");
const saveCredentialsButton = document.querySelector("#saveCredentialsButton");
const credentialsStatus = document.querySelector("#credentialsStatus");
const form = document.querySelector("#adminForm");
const menuEditor = document.querySelector("#menuEditor");
const featuresEditor = document.querySelector("#featuresEditor");
const promotionsEditor = document.querySelector("#promotionsEditor");
const galleryEditor = document.querySelector("#galleryEditor");
const statusMessage = document.querySelector("#statusMessage");
const tabButtons = document.querySelectorAll("[data-tab-target]");
const tabs = document.querySelectorAll("[data-tab]");

function refreshChrome() {
  document.querySelectorAll("[data-site-name]").forEach((node) => {
    node.textContent = data.site.name;
  });
  document.querySelectorAll("[data-site-copyright]").forEach((node) => {
    node.textContent = data.site.copyright;
  });
}

function setStatus(message) {
  statusMessage.textContent = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    statusMessage.textContent = "";
  }, 3000);
}

function setLoginError(message) {
  loginError.textContent = message;
}

function setCredentialsStatus(message) {
  credentialsStatus.textContent = message;
  window.clearTimeout(setCredentialsStatus.timer);
  setCredentialsStatus.timer = window.setTimeout(() => {
    credentialsStatus.textContent = "";
  }, 3000);
}

function updateMetrics() {
  document.querySelector("#menuCount").textContent = data.menu.length;
  document.querySelector("#promoCount").textContent = data.promotions.length;
  document.querySelector("#galleryCount").textContent = data.gallery.length;
  document.querySelector("#featureCount").textContent = data.features.length;
}

function fillForm() {
  Object.entries(data.site).forEach(([key, value]) => {
    if (form.elements[key] && !Array.isArray(value)) {
      form.elements[key].value = value;
    }
  });
  form.elements.mapLat.value = data.site.mapCenter?.[0] ?? "";
  form.elements.mapLng.value = data.site.mapCenter?.[1] ?? "";
  renderMenuEditor();
  renderFeaturesEditor();
  renderPromotionsEditor();
  renderGalleryEditor();
  updateMetrics();
  refreshChrome();
}

function renderMenuEditor() {
  menuEditor.innerHTML = data.menu
    .map(
      (category, categoryIndex) => `
        <div class="category-editor" data-category="${categoryIndex}">
          <div class="category-head">
            <input value="${escapeHtml(category.category)}" aria-label="Название раздела">
            <button class="icon-button" type="button" data-action="remove-category" title="Удалить раздел" aria-label="Удалить раздел">×</button>
          </div>
          <div class="items-editor">
            ${category.items
              .map(
                (item, itemIndex) => `
                  <div class="item-row" data-item="${itemIndex}">
                    <input value="${escapeHtml(item.name)}" aria-label="Название позиции">
                    <input value="${escapeHtml(item.price)}" aria-label="Цена">
                    <button class="icon-button" type="button" data-action="remove-item" title="Удалить позицию" aria-label="Удалить позицию">×</button>
                  </div>
                `
              )
              .join("")}
          </div>
          <button class="button secondary compact" type="button" data-action="add-item">Добавить позицию</button>
        </div>
      `
    )
    .join("");
}

function renderFeaturesEditor() {
  featuresEditor.innerHTML = data.features
    .map(
      (feature, index) => `
        <div class="editor-row stacked" data-index="${index}">
          <label>Заголовок<input value="${escapeHtml(feature.title)}" data-field="title"></label>
          <label>Текст<textarea rows="3" data-field="text">${escapeHtml(feature.text)}</textarea></label>
          <button class="icon-button remove-wide" type="button" data-action="remove-feature" title="Удалить преимущество" aria-label="Удалить преимущество">×</button>
        </div>
      `
    )
    .join("");
}

function renderPromotionsEditor() {
  promotionsEditor.innerHTML = data.promotions
    .map(
      (promotion, index) => `
        <div class="editor-row stacked" data-index="${index}">
          <label>Заголовок<input value="${escapeHtml(promotion.title)}" data-field="title"></label>
          <label>Текст<textarea rows="3" data-field="text">${escapeHtml(promotion.text)}</textarea></label>
          <label>Путь к изображению<input value="${escapeHtml(promotion.image)}" data-field="image" placeholder="photo/fon.png"></label>
          <button class="icon-button remove-wide" type="button" data-action="remove-promotion" title="Удалить акцию" aria-label="Удалить акцию">×</button>
        </div>
      `
    )
    .join("");
}

function renderGalleryEditor() {
  galleryEditor.innerHTML = data.gallery
    .map(
      (item, index) => `
        <div class="editor-row gallery-row" data-index="${index}">
          <label>Тип
            <select data-field="type">
              <option value="image"${item.type !== "video" ? " selected" : ""}>Фото</option>
              <option value="video"${item.type === "video" ? " selected" : ""}>Видео</option>
            </select>
          </label>
          <label>Название<input value="${escapeHtml(item.title)}" data-field="title"></label>
          <label>Файл<input value="${escapeHtml(item.src)}" data-field="src" placeholder="photo/image 3.png"></label>
          <label>Постер видео<input value="${escapeHtml(item.poster || "")}" data-field="poster" placeholder="photo/video-preview.jpg"></label>
          <button class="icon-button" type="button" data-action="remove-gallery" title="Удалить файл" aria-label="Удалить файл">×</button>
        </div>
      `
    )
    .join("");
}

function readMenuEditor() {
  return [...menuEditor.querySelectorAll(".category-editor")]
    .map((categoryNode) => {
      const categoryName = categoryNode.querySelector(".category-head input").value.trim() || "Новый раздел";
      const items = [...categoryNode.querySelectorAll(".item-row")]
        .map((itemNode) => {
          const inputs = itemNode.querySelectorAll("input");
          return {
            name: inputs[0].value.trim(),
            price: inputs[1].value.trim()
          };
        })
        .filter((item) => item.name || item.price)
        .map((item) => ({
          name: item.name || "Новая позиция",
          price: item.price || "0 руб."
        }));

      return {
        category: categoryName,
        items: items.length ? items : [{ name: "Новая позиция", price: "0 руб." }]
      };
    })
    .filter((category) => category.category || category.items.length);
}

function readListEditor(editor, fallback) {
  return [...editor.querySelectorAll(".editor-row")]
    .map((row) => {
      const item = { ...fallback };
      row.querySelectorAll("[data-field]").forEach((field) => {
        item[field.dataset.field] = field.value.trim();
      });
      return item;
    })
    .filter((item) => Object.values(item).some((value) => String(value).trim()));
}

function readFeaturesEditor() {
  return readListEditor(featuresEditor, { title: "", text: "" }).map((feature) => ({
    title: feature.title || "Новое преимущество",
    text: feature.text || "Описание преимущества"
  }));
}

function readPromotionsEditor() {
  return readListEditor(promotionsEditor, { title: "", text: "", image: "" }).map((promotion) => ({
    title: promotion.title || "Новое предложение",
    text: promotion.text || "Описание предложения",
    image: promotion.image || "photo/fon.png"
  }));
}

function readGalleryEditor() {
  return readListEditor(galleryEditor, { type: "image", title: "", src: "", poster: "" }).map((item) => {
    const galleryItem = {
      type: item.type === "video" ? "video" : "image",
      src: item.src || "photo/fon.png",
      title: item.title || "Новый файл"
    };

    if (galleryItem.type === "video" && item.poster) {
      galleryItem.poster = item.poster;
    }

    return galleryItem;
  });
}

function readSiteForm() {
  return {
    ...data.site,
    name: form.elements.name.value.trim(),
    title: form.elements.title.value.trim(),
    tagline: form.elements.tagline.value.trim(),
    description: form.elements.description.value.trim(),
    address: form.elements.address.value.trim(),
    phone: form.elements.phone.value.trim(),
    hours: form.elements.hours.value.trim(),
    season: form.elements.season.value.trim(),
    mapCenter: [
      Number.parseFloat(form.elements.mapLat.value.replace(",", ".")) || VAREZHKA_DEFAULT_DATA.site.mapCenter[0],
      Number.parseFloat(form.elements.mapLng.value.replace(",", ".")) || VAREZHKA_DEFAULT_DATA.site.mapCenter[1]
    ],
    copyright: form.elements.copyright.value.trim()
  };
}

function syncDataFromEditors() {
  data.site = readSiteForm();
  data.menu = readMenuEditor();
  data.features = readFeaturesEditor();
  data.promotions = readPromotionsEditor();
  data.gallery = readGalleryEditor();
}

function showEditor(user) {
  loginPanel.hidden = true;
  adminShell.hidden = false;
  document.body.classList.add("is-authenticated");
  adminUser.textContent = user?.username ? `Пользователь: ${user.username}` : "";
  adminUsernameInput.value = user?.username || "";
  fillForm();
}

async function initAdmin() {
  data = await loadSiteData();
  refreshChrome();

  try {
    const response = await fetch("api.php?action=status", { cache: "no-store" });
    const payload = await response.json();
    if (payload.ok && payload.authenticated) {
      showEditor(payload.user);
    }
  } catch {
    setLoginError("Не удалось проверить вход. Проверьте XAMPP и базу данных.");
  }
}

initAdmin();

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoginError("");
  loginButton.disabled = true;
  loginButton.textContent = "Проверяем...";

  try {
    const response = await fetch("api.php?action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        username: usernameInput.value.trim(),
        password: passwordInput.value
      })
    });
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Не удалось войти");
    }

    data = await loadSiteData();
    showEditor(payload.user);
    passwordInput.value = "";
  } catch (error) {
    setLoginError(error.message || "Неверный логин или пароль");
    passwordInput.value = "";
    passwordInput.focus();
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Войти";
  }
});

logoutButton.addEventListener("click", async () => {
  await fetch("api.php?action=logout", { cache: "no-store" });
  adminShell.hidden = true;
  loginPanel.hidden = false;
  document.body.classList.remove("is-authenticated");
  usernameInput.focus();
});

saveCredentialsButton.addEventListener("click", async () => {
  const username = adminUsernameInput.value.trim();
  const password = adminPasswordInput.value;
  const repeat = adminPasswordRepeatInput.value;

  if (password !== repeat) {
    setCredentialsStatus("Пароли не совпадают");
    return;
  }

  saveCredentialsButton.disabled = true;
  saveCredentialsButton.textContent = "Сохраняем...";

  try {
    const response = await fetch("api.php?action=credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ username, password })
    });
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Не удалось сохранить доступ");
    }

    adminUser.textContent = `Пользователь: ${payload.user.username}`;
    adminUsernameInput.value = payload.user.username;
    adminPasswordInput.value = "";
    adminPasswordRepeatInput.value = "";
    setCredentialsStatus("Логин и пароль обновлены");
  } catch (error) {
    setCredentialsStatus(error.message || "Не удалось сохранить доступ");
  } finally {
    saveCredentialsButton.disabled = false;
    saveCredentialsButton.textContent = "Сохранить доступ";
  }
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tabTarget;

    tabButtons.forEach((item) => item.classList.toggle("active", item === button));
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === target));
  });
});

document.querySelector("#addCategory").addEventListener("click", () => {
  syncDataFromEditors();
  data.menu.push({ category: "Новый раздел", items: [{ name: "Новая позиция", price: "0 руб." }] });
  renderMenuEditor();
  updateMetrics();
});

menuEditor.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  syncDataFromEditors();
  const categoryNode = event.target.closest(".category-editor");
  if (!categoryNode) return;

  const categoryIndex = Number(categoryNode.dataset.category);

  if (button.dataset.action === "remove-category") {
    data.menu.splice(categoryIndex, 1);
  }

  if (button.dataset.action === "add-item") {
    data.menu[categoryIndex].items.push({ name: "Новая позиция", price: "0 руб." });
  }

  if (button.dataset.action === "remove-item") {
    const itemIndex = Number(event.target.closest(".item-row").dataset.item);
    data.menu[categoryIndex].items.splice(itemIndex, 1);
  }

  renderMenuEditor();
  updateMetrics();
});

document.querySelector("#addFeature").addEventListener("click", () => {
  syncDataFromEditors();
  data.features.push({ title: "Новое преимущество", text: "Описание преимущества" });
  renderFeaturesEditor();
  updateMetrics();
});

document.querySelector("#addPromotion").addEventListener("click", () => {
  syncDataFromEditors();
  data.promotions.push({ title: "Новое предложение", text: "Описание предложения", image: "photo/fon.png" });
  renderPromotionsEditor();
  updateMetrics();
});

document.querySelector("#addGalleryItem").addEventListener("click", () => {
  syncDataFromEditors();
  data.gallery.push({ type: "image", src: "photo/fon.png", title: "Новый файл" });
  renderGalleryEditor();
  updateMetrics();
});

featuresEditor.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='remove-feature']");
  if (!button) return;

  syncDataFromEditors();
  data.features.splice(Number(button.closest(".editor-row").dataset.index), 1);
  renderFeaturesEditor();
  updateMetrics();
});

promotionsEditor.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='remove-promotion']");
  if (!button) return;

  syncDataFromEditors();
  data.promotions.splice(Number(button.closest(".editor-row").dataset.index), 1);
  renderPromotionsEditor();
  updateMetrics();
});

galleryEditor.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='remove-gallery']");
  if (!button) return;

  syncDataFromEditors();
  data.gallery.splice(Number(button.closest(".editor-row").dataset.index), 1);
  renderGalleryEditor();
  updateMetrics();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  syncDataFromEditors();

  const result = await persistSiteData(data);
  if (result.data) data = result.data;
  fillForm();
  refreshChrome();
  setStatus(result.ok ? "Сохранено в базе данных" : "База данных недоступна, изменения не сохранены");
});

document.querySelector("#resetButton").addEventListener("click", async () => {
  const result = await resetStoredSiteData();
  data = result.data || cloneDefaultData();
  fillForm();
  setStatus(result.ok ? "Данные сброшены в базе данных" : "База данных недоступна, изменения не сохранены");
});
