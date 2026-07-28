(function () {
  const STORAGE_KEY = "ecom_country";

  const COUNTRIES = {
    IN: { name: "India",          lang: "en", symbol: "₹",   code: "INR", rate: 1 },
    US: { name: "United States",  lang: "en", symbol: "$",   code: "USD", rate: 0.012 },
    GB: { name: "United Kingdom", lang: "en", symbol: "£",   code: "GBP", rate: 0.0095 },
    AE: { name: "UAE",            lang: "ar", symbol: "AED", code: "AED", rate: 0.044 },
    FR: { name: "France",         lang: "fr", symbol: "€",   code: "EUR", rate: 0.011 },
    DE: { name: "Germany",        lang: "de", symbol: "€",   code: "EUR", rate: 0.011 },
    JP: { name: "Japan",          lang: "ja", symbol: "¥",   code: "JPY", rate: 1.83 },
  };

  const STRINGS = {
    en: { home: "Home", about: "About", shop: "Shop", blog: "Blog", contact: "Contact",
          addToCart: "Add to cart", clearCart: "Clear cart", proceedPayment: "Proceed to Payment",
          yourCart: "Your Cart", emptyCart: "Your cart is empty" },
    fr: { home: "Accueil", about: "À propos", shop: "Boutique", blog: "Blog", contact: "Contact",
          addToCart: "Ajouter au panier", clearCart: "Vider le panier", proceedPayment: "Procéder au paiement",
          yourCart: "Votre panier", emptyCart: "Votre panier est vide" },
    de: { home: "Startseite", about: "Über uns", shop: "Shop", blog: "Blog", contact: "Kontakt",
          addToCart: "In den Warenkorb", clearCart: "Warenkorb leeren", proceedPayment: "Zur Zahlung",
          yourCart: "Ihr Warenkorb", emptyCart: "Ihr Warenkorb ist leer" },
    ar: { home: "الرئيسية", about: "من نحن", shop: "المتجر", blog: "المدونة", contact: "اتصل بنا",
          addToCart: "أضف إلى السلة", clearCart: "إفراغ السلة", proceedPayment: "الذهاب للدفع",
          yourCart: "سلتك", emptyCart: "سلتك فارغة" },
    ja: { home: "ホーム", about: "会社概要", shop: "ショップ", blog: "ブログ", contact: "お問い合わせ",
          addToCart: "カートに追加", clearCart: "カートを空にする", proceedPayment: "支払いに進む",
          yourCart: "あなたのカート", emptyCart: "カートは空です" },
  };

  function getCountry() {
    return localStorage.getItem(STORAGE_KEY) || "IN";
  }

  function setCountry(code) {
    localStorage.setItem(STORAGE_KEY, code);
  }

  function currentCountry() {
    return COUNTRIES[getCountry()] || COUNTRIES.IN;
  }

  function t(key) {
    const dict = STRINGS[currentCountry().lang] || STRINGS.en;
    return dict[key] || STRINGS.en[key] || key;
  }

  function injectSelector() {
    const iconsBox = document.querySelector(".icons");
    if (!iconsBox || document.getElementById("countrySelect")) return;

    const select = document.createElement("select");
    select.id = "countrySelect";
    select.style.marginLeft = "8px";
    select.style.borderRadius = "5px";
    select.style.padding = "4px";
    select.style.cursor = "pointer";

    Object.keys(COUNTRIES).forEach(function (code) {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = COUNTRIES[code].name;
      select.appendChild(opt);
    });

    select.value = getCountry();
    select.addEventListener("change", function () {
      setCountry(select.value);
      applyCountry();
    });

    iconsBox.appendChild(select);
  }

  function convertPrices() {
    const country = currentCountry();
    const decimals = country.code === "JPY" ? 0 : 2;

    document.querySelectorAll(".pro_01 p").forEach(function (p) {
      if (!p.dataset.inr) {
        p.dataset.inr = p.textContent.replace(/[^0-9.]/g, "") || "0";
      }
      const inrValue = parseFloat(p.dataset.inr);
      p.textContent = country.symbol + (inrValue * country.rate).toFixed(decimals);
    });

    const totalEl = document.querySelector(".cart-panel-total-amount");
    if (totalEl) {
      if (!totalEl.dataset.inr) {
        totalEl.dataset.inr = totalEl.textContent.replace(/[^0-9.]/g, "") || "0";
      }
      const inrTotal = parseFloat(totalEl.dataset.inr);
      totalEl.textContent = country.symbol + (inrTotal * country.rate).toFixed(decimals);
    }

    document.querySelectorAll(".cart-panel-item-price").forEach(function (span) {
      if (!span.dataset.inr) {
        span.dataset.inr = span.textContent.replace(/[^0-9.]/g, "") || "0";
      }
      const parts = span.textContent.split("x");
      const qty = parts.length > 1 ? parts[1].trim() : "1";
      const inrValue = parseFloat(span.dataset.inr);
      span.textContent = country.symbol + (inrValue * country.rate).toFixed(decimals) + " x " + qty;
    });
  }

  function translateUI() {
    const navMap = {
      'a[href$="home.html"]': "home",
      'a[href$="about.html"]': "about",
      'a[href$="shop.html"]': "shop",
      'a[href$="blog.html"]': "blog",
      'a[href$="contact.html"]': "contact",
    };

    Object.keys(navMap).forEach(function (selector) {
      document.querySelectorAll(".navbar " + selector).forEach(function (el) {
        el.textContent = t(navMap[selector]);
      });
    });

    document.querySelectorAll(".btn01").forEach(function (btn) {
      if (!btn.disabled) btn.textContent = t("addToCart");
    });

    const clearBtn = document.querySelector(".cart-panel-clear");
    if (clearBtn) clearBtn.textContent = t("clearCart");

    const checkoutBtn = document.querySelector(".cart-panel-checkout");
    if (checkoutBtn) checkoutBtn.textContent = t("proceedPayment");

    const cartTitle = document.querySelector(".cart-panel-header h4");
    if (cartTitle) cartTitle.textContent = t("yourCart");

    const emptyMsg = document.querySelector(".cart-panel-empty");
    if (emptyMsg) emptyMsg.textContent = t("emptyCart");

    document.documentElement.setAttribute("dir", currentCountry().lang === "ar" ? "rtl" : "ltr");
  }

  function applyCountry() {
    convertPrices();
    translateUI();
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectSelector();
    applyCountry();
  });

  document.addEventListener("click", function () {
    setTimeout(applyCountry, 50);
  });
})();