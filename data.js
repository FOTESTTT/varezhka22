const VAREZHKA_DEFAULT_DATA = {
  site: {
    name: "Варежка",
    title: "База отдыха «Варежка»",
    tagline: "Пляж, прокат лодок и спокойный отдых у воды",
    description:
      "Семейная база отдыха в р.п. Южный: пляжная зона, водные развлечения, кафе и уютные места для отдыха.",
    address: "р.п. Южный, ул. Зоотехническая 29в",
    phone: "+7 (902) 146-04-66",
    hours: "10:00 - 20:30",
    season: "Летний сезон",
    mapCenter: [53.255068, 83.70839],
    copyright: "© 2026 Варежка. Все права защищены."
  },
  features: [
    {
      title: "Пляжная зона",
      text: "Место для отдыха у воды, прогулок и семейного дня на свежем воздухе."
    },
    {
      title: "Прокат на воде",
      text: "SUP-борды, катамараны и развлечения для активного летнего отдыха."
    },
    {
      title: "Кафе на территории",
      text: "Горячие блюда, снеки, напитки и сладости рядом с пляжем."
    }
  ],
  promotions: [
    {
      title: "Летний день у воды",
      text: "Пляжная зона, шезлонги и спокойный отдых для всей семьи.",
      image: "photo/image 3.png"
    },
    {
      title: "Прокат на воде",
      text: "Катамараны и SUP-борды для активного отдыха на свежем воздухе.",
      image: "photo/fon.png"
    },
    {
      title: "Вечерний билет",
      text: "Отдых после 18:00 по отдельной цене для всех гостей.",
      image: "photo/image 1.png"
    }
  ],
  menu: [
    {
      category: "Вход",
      items: [
        { name: "Взрослый билет на полный день", price: "800 руб." },
        { name: "Детский билет от 4 до 12 лет включительно на полный день", price: "500 руб." },
        { name: "Билет для пенсионеров", price: "600 руб." },
        { name: "Вечерний билет с 18:00 до 20:30", price: "500 руб." }
      ]
    },
    {
      category: "Горячие блюда",
      items: [
        { name: "Шашлык с соусом, луком и хлебом", price: "400 руб." },
        { name: "Манты, 4 шт. с соусом", price: "250 руб." },
        { name: "Чебуреки, 4 шт.", price: "250 руб." },
        { name: "Картофель фри, 100 г. с соусом", price: "150 руб." },
        { name: "Блины с мясом, 2 шт.", price: "150 руб." },
        { name: "Блины со сгущенкой, 2 шт.", price: "150 руб." },
        { name: "Кукуруза вареная с солью", price: "150 руб." },
        { name: "Сосиска гриль", price: "100 руб." }
      ]
    },
    {
      category: "Сладости",
      items: [
        { name: "Мороженое в ассортименте", price: "60 / 70 руб." },
        { name: "Шоколадный батончик TWIX", price: "100 / 150 руб." },
        { name: "Шоколадный батончик Mars", price: "150 руб." },
        { name: "Шоколадный батончик Snickers", price: "100 руб." },
        { name: "Жевательные конфеты Фрут-телла", price: "100 руб." },
        { name: "Ирис Meller с шоколадом", price: "100 руб." },
        { name: "Карамель Чупа-Чупс", price: "15 руб." },
        { name: "Печенье Oreo с начинкой", price: "50 руб." }
      ]
    },
    {
      category: "Снеки",
      items: [
        { name: "Чипсы Lays, 70 г. / 140 г.", price: "150 / 250 руб." },
        { name: "Чипсы Binggrae, 50 г. / 80 г.", price: "100 / 150 руб." },
        { name: "Сухарики, 60 г.", price: "80 руб." }
      ]
    }
  ],
  gallery: [
    { type: "image", src: "photo/image 3.png", title: "Пляж" },
    { type: "image", src: "photo/fon.png", title: "Катамараны" },
    { type: "image", src: "photo/image 1.png", title: "Берег" },
    { type: "image", src: "photo/image 5.png", title: "Объявление" },
    { type: "image", src: "photo/image 7.png", title: "Шезлонги" },
    { type: "image", src: "photo/lodka.jpg", title: "SUP-борды" },
    { type: "image", src: "photo/gorka.jpg", title: "Горка" },
    { type: "image", src: "photo/spasatel.jpg", title: "Спасатель" },
    { type: "video", src: "photo/video1.mp4", poster: "photo/video-preview.jpg", title: "Видео 1" },
    { type: "video", src: "photo/video2.mp4", poster: "photo/video-preview2.jpg", title: "Видео 2" },
    { type: "video", src: "photo/video3.mp4", poster: "photo/video-preview.jpg", title: "Видео 3" },
    { type: "video", src: "photo/video4.mp4", poster: "photo/video-preview2.jpg", title: "Видео 4" }
  ]
};

function cloneDefaultData() {
  return structuredClone(VAREZHKA_DEFAULT_DATA);
}

function mergeSiteData(savedData) {
  const defaults = cloneDefaultData();

  return {
    ...defaults,
    ...savedData,
    site: {
      ...defaults.site,
      ...(savedData.site || {})
    },
    features: Array.isArray(savedData.features) ? savedData.features : defaults.features,
    promotions: Array.isArray(savedData.promotions) ? savedData.promotions : defaults.promotions,
    menu: Array.isArray(savedData.menu) ? savedData.menu : defaults.menu,
    gallery: Array.isArray(savedData.gallery) ? savedData.gallery : defaults.gallery
  };
}

function getSiteData() {
  const apiData = getApiDataSync();
  if (apiData) return apiData;

  return cloneDefaultData();
}

function getApiDataSync() {
  if (window.location.protocol === "file:") return null;

  try {
    const request = new XMLHttpRequest();
    request.open("GET", "api.php?action=read", false);
    request.send();

    if (request.status < 200 || request.status >= 300) return null;

    const response = JSON.parse(request.responseText);
    return response.ok && response.data ? mergeSiteData(response.data) : null;
  } catch {
    return null;
  }
}

async function loadSiteData() {
  if (window.location.protocol === "file:") return cloneDefaultData();

  try {
    const response = await fetch("api.php?action=read", { cache: "no-store" });
    if (!response.ok) throw new Error("API read failed");

    const payload = await response.json();
    return payload.ok && payload.data ? mergeSiteData(payload.data) : getSiteData();
  } catch {
    return getSiteData();
  }
}

async function persistSiteData(data) {
  if (window.location.protocol === "file:") {
    return { ok: false, mode: "server", error: new Error("Сайт нужно запускать через XAMPP") };
  }

  try {
    const response = await fetch("api.php?action=save", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(data)
    });

    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "API save failed");
    }

    return { ok: true, mode: "server", data: mergeSiteData(payload.data) };
  } catch (error) {
    return { ok: false, mode: "server", error };
  }
}

async function resetStoredSiteData() {
  const defaults = cloneDefaultData();
  return persistSiteData(defaults);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
