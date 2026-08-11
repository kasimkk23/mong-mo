// ==========================================================================
// Mong Mo – site interactions: language switching, nav, menu tabs,
// reservation form -> Formspree
// ==========================================================================

// ---- Formspree endpoint -------------------------------------------------
// 1. Create a free account at https://formspree.io
// 2. Create a new form and connect the restaurant's Gmail as the recipient
// 3. Copy the form endpoint (looks like https://formspree.io/f/xxxxabcd)
// 4. Paste it below, replacing the placeholder.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

const LANG_STORAGE_KEY = "mongmo-lang";
let currentLang = "de";

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  initHeader();
  initNavToggle();
  initMenuCategories();
  initMenuTabs();
  initReservationForm();
  initGalleryLightbox();
  initMisc();
});

// ---- Translation helper ---------------------------------------------------
// Looks up `key` in the active language, falling back to German, then to the
// key itself so a missing translation never renders as blank text.
function t(key) {
  const dict = (window.I18N && window.I18N[currentLang]) || {};
  const fallback = (window.I18N && window.I18N.de) || {};
  return dict[key] ?? fallback[key] ?? key;
}

// ---- Language switching -----------------------------------------------------
function initLanguage() {
  const select = document.getElementById("langSwitch");
  const supported = window.SUPPORTED_LANGS || ["de"];

  // Default is always German. We only ever switch away from that if the
  // visitor explicitly picked a language before (saved in localStorage) —
  // no browser-language auto-detection, by design.
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  const initial = supported.includes(saved) ? saved : "de";

  applyLanguage(initial);

  if (select) {
    select.value = initial;
    select.addEventListener("change", () => {
      applyLanguage(select.value);
      localStorage.setItem(LANG_STORAGE_KEY, select.value);
    });
  }
}

function applyLanguage(lang) {
  if (!window.I18N || !window.I18N[lang]) lang = "de";
  currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  // Elements that need an attribute translated (e.g. aria-label, meta content)
  // via data-i18n-attr="attrName:translationKey"
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const [attr, key] = el.dataset.i18nAttr.split(":");
    el.setAttribute(attr, t(key));
  });

  const select = document.getElementById("langSwitch");
  if (select) select.value = lang;
}

// ---- Sticky header shadow on scroll --------------------------------------
function initHeader() {
  const header = document.getElementById("header");
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

// ---- Mobile nav toggle ----------------------------------------------------
function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-active", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when a link is clicked (mobile)
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-active");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ---- Top-level menu categories (Vorspeisen / Hauptspeisen / Mittagskarte / Getränke / Nachtisch) ----
function initMenuCategories() {
  const tabs = document.querySelectorAll(".menu-cat-tab");
  const panels = document.querySelectorAll(".menu-cat-panel");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.catTarget;

      tabs.forEach((tb) => {
        tb.classList.toggle("is-active", tb === tab);
        tb.setAttribute("aria-selected", String(tb === tab));
      });

      panels.forEach((panel) => {
        const isTarget = panel.id === targetId;
        panel.classList.toggle("is-active", isTarget);
        panel.hidden = !isTarget;
      });
    });
  });
}

// ---- Menu sub-category tabs (Suppen / Häppchen / … within each top-level category) ----
// Each .menu-tabs bar is scoped to its own .menu-panels sibling, so multiple
// independent tab groups (one per top-level category) can coexist on the page.
function initMenuTabs() {
  document.querySelectorAll(".menu-tabs").forEach((tabBar) => {
    const tabs = tabBar.querySelectorAll(".menu-tab");
    const panelsContainer = tabBar.nextElementSibling;
    if (!panelsContainer) return;
    const panels = panelsContainer.querySelectorAll(".menu-panel");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetId = tab.dataset.target;

        tabs.forEach((tb) => {
          tb.classList.toggle("is-active", tb === tab);
          tb.setAttribute("aria-selected", String(tb === tab));
        });

        panels.forEach((panel) => {
          const isTarget = panel.id === targetId;
          panel.classList.toggle("is-active", isTarget);
          panel.hidden = !isTarget;
        });
      });
    });
  });
}

// ---- Reservation form: client-side validation + Formspree submit ---------
function initReservationForm() {
  const form = document.getElementById("reservationForm");
  const status = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");
  const dateInput = document.getElementById("date");
  if (!form) return;

  // Prevent picking a date in the past
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  // Mong Mo is closed Monday & Tuesday — flag it instead of silently accepting the booking
  const CLOSED_WEEKDAYS = [1, 2]; // 0 = Sunday … 6 = Saturday
  if (dateInput) {
    dateInput.addEventListener("change", () => {
      const day = new Date(dateInput.value + "T00:00:00").getDay();
      if (dateInput.value && CLOSED_WEEKDAYS.includes(day)) {
        dateInput.setCustomValidity(t("status.closedDay"));
      } else {
        dateInput.setCustomValidity("");
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("", "");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Honeypot spam check
    if (form._gotcha && form._gotcha.value) return;

    if (FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
      setStatus(t("status.notConnected"), "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t("form.submitting");

    try {
      const formData = new FormData(form);
      formData.append("language", currentLang);
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (res.ok) {
        setStatus(t("status.success"), "success");
        form.reset();
      } else {
        setStatus(t("status.error"), "error");
      }
    } catch (err) {
      setStatus(t("status.networkError"), "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t("form.submit");
    }
  });

  function setStatus(message, type) {
    status.textContent = message;
    status.className = "form-status" + (type ? " " + type : "");
  }
}

// ---- Gallery lightbox: opens photos in an in-page modal instead of a new tab ----
function initGalleryLightbox() {
  const items = [...document.querySelectorAll(".gallery-item")];
  const lightbox = document.getElementById("lightbox");
  if (!items.length || !lightbox) return;

  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  const photos = items.map((item) => {
    const img = item.querySelector("img");
    return { src: img.src, alt: img.alt };
  });

  let currentIndex = 0;
  let lastFocused = null;

  function show(index) {
    currentIndex = (index + photos.length) % photos.length;
    const photo = photos[currentIndex];
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt;
  }

  function open(index, trigger) {
    lastFocused = trigger || document.activeElement;
    show(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lightboxImg.src = "";
    if (lastFocused) lastFocused.focus();
  }

  items.forEach((item, index) => {
    item.addEventListener("click", () => open(index, item));
  });

  closeBtn.addEventListener("click", close);
  lightbox.querySelectorAll("[data-lightbox-close]").forEach((el) => {
    el.addEventListener("click", close);
  });
  prevBtn.addEventListener("click", () => show(currentIndex - 1));
  nextBtn.addEventListener("click", () => show(currentIndex + 1));

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(currentIndex - 1);
    if (e.key === "ArrowRight") show(currentIndex + 1);
  });
}

// ---- Misc: footer year ------------------------------------------------------
function initMisc() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
