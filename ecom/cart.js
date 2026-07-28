/* ==========================================================
   cart.js
   Shared "Add to cart" logic for every product page
   (Electronics.html, dress.html, cosmetic.html, kids.html,
   footerware.htm ...). All of them reuse the same markup:
     <div class="pro_01">
        <img ...>
        <h3>Product Name</h3>
        <p>$Price</p>
        <button class="btn01">Add to cart</button>
     </div>
   So one script can run on all of them without touching
   the existing HTML/CSS design.
   ========================================================== */

(function () {
  const CART_KEY = "ecom_cart";

  /* ---------- storage helpers ---------- */

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function getCartCount(cart) {
    return Object.values(cart).reduce((total, item) => total + item.qty, 0);
  }

  /* ---------- add to cart (same product -> qty + 1) ---------- */

  function addToCart(name, price) {
    const cart = getCart();

    if (cart[name]) {
      // product already in cart -> just increase the quantity
      cart[name].qty += 1;
    } else {
      // new product -> add it with quantity 1
      cart[name] = { name: name, price: price, qty: 1 };
    }

    saveCart(cart);
    updateCartBadge();
    renderCartPanel();
    return cart[name].qty;
  }

  /* ---------- cart icon badge (shows total items) ---------- */

  function updateCartBadge() {
    const cart = getCart();
    const count = getCartCount(cart);

    // the cart icon in the header: .icons -> <a> -> <i> -> <svg class="bi-cart">
    const cartSvg = document.querySelector(".icons .bi-cart");
    if (!cartSvg) return;

    const cartIconWrap = cartSvg.closest("i");
    if (!cartIconWrap) return;

    let badge = cartIconWrap.querySelector(".cart-count");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-count";
      cartIconWrap.appendChild(badge);
    }

    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  /* ---------- remove / change quantity from the panel ---------- */

  function removeFromCart(name) {
    const cart = getCart();
    delete cart[name];
    saveCart(cart);
    updateCartBadge();
    renderCartPanel();
  }

  function changeQty(name, delta) {
    const cart = getCart();
    if (!cart[name]) return;

    cart[name].qty += delta;
    if (cart[name].qty <= 0) {
      delete cart[name];
    }

    saveCart(cart);
    updateCartBadge();
    renderCartPanel();
  }

  /* ---------- the cart dropdown panel (shows added items) ---------- */

  let cartPanel = null;

  function buildCartPanel() {
    if (cartPanel) return cartPanel;

    cartPanel = document.createElement("div");
    cartPanel.className = "cart-panel";
    cartPanel.innerHTML = `
      <div class="cart-panel-header">
        <h4>Your Cart</h4>
        <button type="button" class="cart-panel-close">&times;</button>
      </div>
      <ul class="cart-panel-items"></ul>
      <div class="cart-panel-footer">
        <div class="cart-panel-total">
          <span>Total</span>
          <span class="cart-panel-total-amount">₹0</span>
        </div>
        <div class="cart-panel-actions">
          <button type="button" class="cart-panel-clear">Clear cart</button>
          <button type="button" class="cart-panel-pay">Proceed to Payment</button>
        </div>
      </div>
    `;
    document.body.appendChild(cartPanel);

    cartPanel.querySelector(".cart-panel-close").addEventListener("click", () => {
      cartPanel.classList.remove("open");
    });

    cartPanel.querySelector(".cart-panel-clear").addEventListener("click", () => {
      saveCart({});
      updateCartBadge();
      renderCartPanel();
    });

    cartPanel.querySelector(".cart-panel-pay").addEventListener("click", () => {
    const cart = getCart();
    const items = Object.values(cart);

    if (items.length === 0) return;

    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    localStorage.setItem("ecom_last_order", JSON.stringify({ items: items, total: total }));

    window.location.href = "/ecom/payment.html";
  });

    // clicks inside the panel shouldn't bubble up and close it immediately
    cartPanel.addEventListener("click", (e) => e.stopPropagation());

    return cartPanel;
  }

  function renderCartPanel() {
    const panel = buildCartPanel();
    const list = panel.querySelector(".cart-panel-items");
    const totalAmountEl = panel.querySelector(".cart-panel-total-amount");

    const cart = getCart();
    const items = Object.values(cart);

    list.innerHTML = "";

    if (items.length === 0) {
      list.innerHTML = `<li class="cart-panel-empty">Your cart is empty</li>`;
    } else {
      items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "cart-panel-item";
        li.innerHTML = `
          <div class="cart-panel-item-info">
            <span class="cart-panel-item-name">${item.name}</span>
            <span class="cart-panel-item-price">₹${item.price} x ${item.qty}</span>
          </div>
          <div class="cart-panel-item-actions">
            <button type="button" class="cart-qty-btn cart-qty-minus">-</button>
            <span class="cart-qty-value">${item.qty}</span>
            <button type="button" class="cart-qty-btn cart-qty-plus">+</button>
            <button type="button" class="cart-remove-btn">Remove</button>
          </div>
        `;

        li.querySelector(".cart-qty-minus").addEventListener("click", () => changeQty(item.name, -1));
        li.querySelector(".cart-qty-plus").addEventListener("click", () => changeQty(item.name, 1));
        li.querySelector(".cart-remove-btn").addEventListener("click", () => removeFromCart(item.name));

        list.appendChild(li);
      });
    }

    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    totalAmountEl.textContent = `₹${total}`;
  }

  function toggleCartPanel() {
    const panel = buildCartPanel();
    renderCartPanel();
    panel.classList.toggle("open");
  }

  function initCartIconClick() {
    const cartSvg = document.querySelector(".icons .bi-cart");
    if (!cartSvg) return;

    // the clickable wrapper is the <a> tag around the <i>
    const cartLink = cartSvg.closest("a") || cartSvg.closest("i");
    if (!cartLink) return;

    cartLink.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleCartPanel();
    });

    // clicking anywhere else on the page closes the panel
    document.addEventListener("click", () => {
      if (cartPanel) cartPanel.classList.remove("open");
    });
  }

  /* ---------- little visual feedback on the button ---------- */

  function flashButton(button, qty) {
    const originalText = button.getAttribute("data-original-text") || button.textContent;
    button.setAttribute("data-original-text", originalText);

    button.textContent = qty > 1 ? `Added (${qty})` : "Added ✓";
    button.disabled = true;

    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 900);
  }

  /* ---------- wire up every "Add to cart" button on the page ---------- */

  function initCartButtons() {
    const buttons = document.querySelectorAll(".btn01");

    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const card = button.closest(".pro_01");
        if (!card) return;

        const nameEl = card.querySelector("h3");
        const priceEl = card.querySelector("p");

        const name = nameEl ? nameEl.textContent.trim() : "Unknown product";
        const priceText = priceEl ? priceEl.textContent.replace(/[^0-9.]/g, "") : "0";
        const price = parseFloat(priceText) || 0;

        const qty = addToCart(name, price);
        flashButton(button, qty);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCartButtons();
    initCartIconClick();
    buildCartPanel();
    updateCartBadge();
  });
})();