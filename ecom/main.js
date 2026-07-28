/* =========================================================
   main.js — shared site-wide JavaScript
   Include this file on every page (after the CSS, before </body>).
   Every function below checks whether the elements it needs
   exist on the current page before doing anything, so it is
   safe to include the same file everywhere.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  injectSharedStyles();
  initMobileMenu();
  initStickyHeader();
  initBackToTop();
  initContactForm();
  initNewsletterForm();
  initLoginForm();
  initSignupForm();
});

/* ---------------------------------------------------------
   0. Shared styles for the bits of UI this file creates
      (mobile menu + back-to-top button + form messages),
      injected once so no existing CSS file needs editing.
--------------------------------------------------------- */
function injectSharedStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 900px) {
      .navbar{
        position: fixed;
        top: 0;
        right: -100%;
        height: 100vh;
        width: 260px;
        background-color: #111;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 10px;
        padding: 90px 30px;
        transition: right .4s ease;
        z-index: 9999;
      }
      .navbar.active{
        right: 0;
      }
      .navbar li{
        width: 100%;
      }
    }

    .back-to-top{
      position: fixed;
      right: 25px;
      bottom: 25px;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background-color: #111;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transform: translateY(15px);
      transition: all .3s ease;
      z-index: 9999;
      box-shadow: 0 4px 10px rgba(0,0,0,.25);
    }
    .back-to-top.show{
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .back-to-top:hover{
      background-color: #444;
    }

    header.scrolled{
      box-shadow: 0 4px 12px rgba(0,0,0,.25);
    }

    .form-message{
      display: block;
      margin-top: 10px;
      font-size: 14px;
      font-weight: 500;
    }
    .form-message.error{ color: #e74c3c; }
    .form-message.success{ color: #2ecc71; }
    .field-error{
      border: 1px solid #e74c3c !important;
    }
  `;
  document.head.appendChild(style);
}

/* ---------------------------------------------------------
   1. Mobile menu (hamburger) toggle
--------------------------------------------------------- */
function initMobileMenu() {
  const menuIcon = document.querySelector(".menu-icon");
  const navbar = document.querySelector(".navbar");
  if (!menuIcon || !navbar) return;

  menuIcon.addEventListener("click", function () {
    navbar.classList.toggle("active");
  });

  // Close the menu when a nav link is clicked
  navbar.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navbar.classList.remove("active");
    });
  });

  // Close the menu when clicking outside it
  document.addEventListener("click", function (e) {
    if (
      navbar.classList.contains("active") &&
      !navbar.contains(e.target) &&
      !menuIcon.contains(e.target)
    ) {
      navbar.classList.remove("active");
    }
  });
}

/* ---------------------------------------------------------
   2. Sticky header shadow on scroll
--------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector("header");
  if (!header) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

/* ---------------------------------------------------------
   3. Back-to-top button (created dynamically)
--------------------------------------------------------- */
function initBackToTop() {
  const btn = document.createElement("div");
  btn.className = "back-to-top";
  btn.setAttribute("title", "Back to top");
  btn.innerHTML = "&#8679;";
  document.body.appendChild(btn);

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  });

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------------------------------------------------------
   Small shared helpers
--------------------------------------------------------- */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showMessage(afterEl, text, type) {
  let msg = afterEl.parentElement.querySelector(".form-message");
  if (!msg) {
    msg = document.createElement("span");
    msg.className = "form-message";
    afterEl.insertAdjacentElement("afterend", msg);
  }
  msg.textContent = text;
  msg.className = "form-message " + type;
}

function markField(field, invalid) {
  if (!field) return;
  field.classList.toggle("field-error", invalid);
}

/* ---------------------------------------------------------
   4. Contact page — validate name, email, subject, message
--------------------------------------------------------- */
function initContactForm() {
  const msgBox = document.querySelector(".msg");
  if (!msgBox) return;

  const name = msgBox.querySelector("#name");
  const email = msgBox.querySelector("#email");
  const subject = msgBox.querySelector("#subject");
  const message = msgBox.querySelector("#message");
  const submitBtn = msgBox.querySelector("button[type='submit']");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", function (e) {
    e.preventDefault();
    let valid = true;

    [name, subject, message].forEach(function (field) {
      const empty = !field.value.trim();
      markField(field, empty);
      if (empty) valid = false;
    });

    const emailInvalid = !isValidEmail(email.value.trim());
    markField(email, emailInvalid);
    if (emailInvalid) valid = false;

    if (!valid) {
      showMessage(submitBtn, "Please fill every field with a valid email.", "error");
      return;
    }

    showMessage(submitBtn, "Thanks! Your message has been sent.", "success");
    [name, email, subject, message].forEach(function (field) {
      field.value = "";
      markField(field, false);
    });
  });
}

/* ---------------------------------------------------------
   5. Newsletter form (about page) — validate email
--------------------------------------------------------- */
function initNewsletterForm() {
  const form = document.querySelector(".newsletter form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const emailField = form.querySelector("input[type='email']");
    const submitBtn = form.querySelector("button");
    const invalid = !isValidEmail(emailField.value.trim());
    markField(emailField, invalid);

    if (invalid) {
      showMessage(submitBtn, "Please enter a valid email address.", "error");
      return;
    }

    showMessage(submitBtn, "Subscribed! Thanks for joining.", "success");
    emailField.value = "";
    markField(emailField, false);
  });
}

/* ---------------------------------------------------------
   6. Login page — validate required fields
--------------------------------------------------------- */
function initLoginForm() {
  const form = document.querySelector("body > form");
  if (!form || !window.location.pathname.endsWith("login.html")) return;

  const username = form.querySelector("input[type='text']");
  const password = form.querySelector("input[type='password']");
  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", function (e) {
    let valid = true;

    const userEmpty = !username.value.trim();
    markField(username, userEmpty);
    if (userEmpty) valid = false;

    const passEmpty = !password.value.trim();
    markField(password, passEmpty);
    if (passEmpty) valid = false;

    if (!valid) {
      e.preventDefault();
      showMessage(submitBtn, "Please enter your username and password.", "error");
    }
  });
}

/* ---------------------------------------------------------
   8. Password show/hide toggle (used on login & signup pages)
--------------------------------------------------------- */
function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const eyeIcon = document.getElementById(iconId);
  if (!input || !eyeIcon) return;

  if (input.type === "password") {
    input.type = "text";
    eyeIcon.innerHTML = `
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486zm-2.943 1.299.772.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.771.771a13 13 0 0 0-1.99 2.467 13 13 0 0 0 1.66 2.043C4.12 11.332 5.88 12.5 8 12.5a6 6 0 0 0 2.416-.963zM8 10.5a2.5 2.5 0 0 1-2.303-3.454l3.257 3.257A2.5 2.5 0 0 1 8 10.5"/>
      <path d="M0.146 0.146a0.5 0.5 0 0 1 0.708 0l15 15a0.5 0.5 0 0 1-0.708 0.708l-15-15a0.5 0.5 0 0 1 0-0.708"/>
    `;
  } else {
    input.type = "password";
    eyeIcon.innerHTML = `
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
    `;
  }
}

/* ---------------------------------------------------------
   7. Signup page — validate fields + matching passwords
--------------------------------------------------------- */
function initSignupForm() {
  const form = document.querySelector("body > form");
  if (!form || !window.location.pathname.endsWith("signup.html")) return;

  const inputs = form.querySelectorAll("input");
  const username = inputs[0];
  const firstname = inputs[1];
  const email = inputs[3];
  const password = inputs[4];
  const repassword = inputs[5];
  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", function (e) {
    let valid = true;

    [username, firstname].forEach(function (field) {
      const empty = !field.value.trim();
      markField(field, empty);
      if (empty) valid = false;
    });

    const emailInvalid = !isValidEmail(email.value.trim());
    markField(email, emailInvalid);
    if (emailInvalid) valid = false;

    const passShort = password.value.trim().length < 6;
    markField(password, passShort);
    if (passShort) valid = false;

    const passMismatch = password.value !== repassword.value || !repassword.value.trim();
    markField(repassword, passMismatch);
    if (passMismatch) valid = false;

    if (!valid) {
      e.preventDefault();
      showMessage(
        submitBtn,
        passShort
          ? "Password must be at least 6 characters."
          : passMismatch
          ? "Passwords do not match."
          : "Please fill every field with a valid email.",
        "error"
      );
    }
  });
}
