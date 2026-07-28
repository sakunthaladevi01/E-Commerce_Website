/* ==========================================================
   header-icons.js
   Wires up the two header icons that don't have behavior yet:
     - search icon  -> opens a search box, filters products
                       on the current page live as you type
     - account icon -> shows a small dropdown: Login/Signup
                       if logged out, or "Hi, <name>" + Logout
                       if logged in (login.html saves the name)
   Cart and menu icons already work via cart.js / main.js.
   Safe to include on every page: each part checks that the
   elements it needs exist before doing anything.
   ========================================================== */

(function () {
  const USER_KEY = "ecom_user";

  /* ---------------- shared styles for the new UI ---------------- */
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .search-box{
        position: absolute;
        top: 100%;
        right: 11%;
        margin-top: 10px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0,0,0,.25);
        padding: 10px;
        display: none;
        z-index: 10002;
      }
      .search-box.open{
        display: flex;
        gap: 6px;
      }
      .search-box input{
        width: 220px;
        padding: 8px 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
      .search-box button{
        padding: 8px 14px;
        border: none;
        border-radius: 5px;
        background-color: black;
        color: #fff;
        cursor: pointer;
      }
      .search-no-match{
        text-align: center;
        width: 100%;
        color: gray;
        padding: 20px;
      }

      .account-box{
        position: absolute;
        top: 100%;
        right: 6%;
        margin-top: 10px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0,0,0,.25);
        min-width: 160px;
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 10002;
      }
      .account-box.open{
        display: flex;
      }
      .account-box a, .account-box .account-greeting, .account-box button{
        padding: 10px 14px;
        text-align: left;
        border: none;
        background: none;
        cursor: pointer;
        color: black;
        font-size: 14px;
        width: 100%;
      }
      .account-box a:hover, .account-box button:hover{
        background-color: #f2f2f2;
      }
      .account-greeting{
        font-weight: 600;
        border-bottom: 1px solid #eee;
      }
    `;
    document.head.appendChild(style);
  }

  /* ---------------- search icon ---------------- */
  function initSearch() {
    const searchSvg = document.querySelector(".icons .bi-search");
    if (!searchSvg) return;

    const searchLink = searchSvg.closest("a") || searchSvg.closest("i");
    if (!searchLink) return;

    const box = document.createElement("div");
    box.className = "search-box";
    box.innerHTML = `
      <input type="text" placeholder="Search products..." id="siteSearchInput">
      <button type="button" id="siteSearchGo">Go</button>
    `;
    document.body.appendChild(box);

    const input = box.querySelector("#siteSearchInput");
    const goBtn = box.querySelector("#siteSearchGo");

    searchLink.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      box.classList.toggle("open");
      if (box.classList.contains("open")) input.focus();
    });

    box.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    document.addEventListener("click", function () {
      box.classList.remove("open");
    });

    function runSearch() {
      const query = input.value.trim().toLowerCase();
      const cards = document.querySelectorAll(".pro_01");

      // page has no product cards -> send them to the shop page with the query
      if (cards.length === 0) {
        window.location.href = "/ecom/shop.html?q=" + encodeURIComponent(query);
        return;
      }

      let matches = 0;
      cards.forEach(function (card) {
        const nameEl = card.querySelector("h3");
        const name = nameEl ? nameEl.textContent.toLowerCase() : "";
        const isMatch = query === "" || name.includes(query);
        card.style.display = isMatch ? "" : "none";
        if (isMatch) matches += 1;
      });

      let noMatchMsg = document.querySelector(".search-no-match");
      const productWrap = document.querySelector(".product");
      if (matches === 0 && productWrap) {
        if (!noMatchMsg) {
          noMatchMsg = document.createElement("p");
          noMatchMsg.className = "search-no-match";
          productWrap.appendChild(noMatchMsg);
        }
        noMatchMsg.textContent = `No products found for "${input.value.trim()}"`;
      } else if (noMatchMsg) {
        noMatchMsg.remove();
      }
    }

    goBtn.addEventListener("click", runSearch);
    input.addEventListener("keyup", function (e) {
      if (e.key === "Enter") runSearch();
      else runSearch(); // live filter as they type
    });

    // if we arrived here via ?q=... from another page, run it immediately
    const params = new URLSearchParams(window.location.search);
    if (params.has("q")) {
      input.value = params.get("q");
      runSearch();
    }
  }

  /* ---------------- account icon ---------------- */
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (e) {
      return null;
    }
  }

  function logout() {
    localStorage.removeItem(USER_KEY);
    window.location.href = "/ecom/home.html";
  }

  function initAccount() {
    const personSvg = document.querySelector(".icons .bi-person");
    if (!personSvg) return;

    const personLink = personSvg.closest("a") || personSvg.closest("i");
    if (!personLink) return;

    const box = document.createElement("div");
    box.className = "account-box";
    document.body.appendChild(box);

    function renderBox() {
      const user = getUser();
      if (user && user.name) {
        box.innerHTML = `
          <span class="account-greeting">Hi, ${user.name}</span>
          <a href="/ecom/home.html">My Orders</a>
          <button type="button" id="logoutBtn">Logout</button>
        `;
        box.querySelector("#logoutBtn").addEventListener("click", logout);
      } else {
        box.innerHTML = `
          <a href="/ecom/login.html">Login</a>
          <a href="/ecom/signup.html">Signup</a>
        `;
      }
    }

    personLink.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      renderBox();
      box.classList.toggle("open");
    });

    box.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    document.addEventListener("click", function () {
      box.classList.remove("open");
    });
  }

  /* ---------------- save the logged-in name from login.html ---------------- */
  function initLoginCapture() {
    if (!window.location.pathname.endsWith("login.html")) return;
    const form = document.querySelector("body > form");
    if (!form) return;

    const username = form.querySelector("input[type='text']");
    form.addEventListener("submit", function () {
      if (username && username.value.trim()) {
        localStorage.setItem(USER_KEY, JSON.stringify({ name: username.value.trim() }));
      }
      // the form's own action="/ecom/home.html" handles the redirect
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectStyles();
    initSearch();
    initAccount();
    initLoginCapture();
  });
})();