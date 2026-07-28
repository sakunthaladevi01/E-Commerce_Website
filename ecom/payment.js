/* ==========================================================
   payment.js
   Reads the cart saved by cart.js (same "ecom_cart" key in
   localStorage), shows the order summary, validates the
   payment form, and on submit clears the cart and shows a
   success message.
   ========================================================== */

(function () {
  const CART_KEY = "ecom_cart";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function clearCart() {
    localStorage.setItem(CART_KEY, JSON.stringify({}));
  }

  function renderOrderSummary() {
    const itemsList = document.getElementById("orderItems");
    const totalEl = document.getElementById("orderTotal");
    const payBtn = document.getElementById("payBtn");

    const cart = getCart();
    const items = Object.values(cart);

    itemsList.innerHTML = "";

    if (items.length === 0) {
      itemsList.innerHTML = `<li class="empty-msg">Your cart is empty.</li>`;
      if (payBtn) payBtn.disabled = true;
      totalEl.textContent = "₹0";
      return 0;
    }

    let total = 0;
    items.forEach(function (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span>${item.name} x ${item.qty}</span><span>₹${item.price * item.qty}</span>`;
      itemsList.appendChild(li);
      total += item.price * item.qty;
    });

    totalEl.textContent = `₹${total}`;
    return total;
  }

  function markField(field, invalid) {
    if (!field) return;
    field.classList.toggle("field-error", invalid);
  }

  function showFormMessage(afterEl, text, type) {
    let msg = afterEl.parentElement.querySelector(".form-message");
    if (!msg) {
      msg = document.createElement("span");
      msg.className = "form-message";
      afterEl.insertAdjacentElement("afterend", msg);
    }
    msg.textContent = text;
    msg.className = "form-message " + type;
  }

  function initPaymentMethodToggle() {
    const methodRadios = document.querySelectorAll('input[name="method"]');
    const cardFields = document.getElementById("cardFields");
    if (!methodRadios.length || !cardFields) return;

    methodRadios.forEach(function (radio) {
      radio.addEventListener("change", function () {
        cardFields.classList.toggle("show", radio.value === "card" && radio.checked);
      });
    });
  }

  function initPaymentForm() {
    const form = document.getElementById("paymentForm");
    if (!form) return;

    const fullname = document.getElementById("fullname");
    const address = document.getElementById("address");
    const pincode = document.getElementById("pincode");
    const phone = document.getElementById("phone");
    const payBtn = document.getElementById("payBtn");

    const cardnumber = document.getElementById("cardnumber");
    const expiry = document.getElementById("expiry");
    const cvv = document.getElementById("cvv");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const cart = getCart();
      if (Object.keys(cart).length === 0) {
        showFormMessage(payBtn, "Your cart is empty.", "error");
        return;
      }

      let valid = true;

      [fullname, address].forEach(function (field) {
        const empty = !field.value.trim();
        markField(field, empty);
        if (empty) valid = false;
      });

      const pinInvalid = !/^\d{6}$/.test(pincode.value.trim());
      markField(pincode, pinInvalid);
      if (pinInvalid) valid = false;

      const phoneInvalid = !/^\d{10}$/.test(phone.value.trim());
      markField(phone, phoneInvalid);
      if (phoneInvalid) valid = false;

      const method = form.querySelector('input[name="method"]:checked').value;

      if (method === "card") {
        const cardInvalid = !/^\d{13,16}$/.test(cardnumber.value.trim());
        markField(cardnumber, cardInvalid);
        if (cardInvalid) valid = false;

        const expiryInvalid = !/^\d{2}\/\d{2}$/.test(expiry.value.trim());
        markField(expiry, expiryInvalid);
        if (expiryInvalid) valid = false;

        const cvvInvalid = !/^\d{3}$/.test(cvv.value.trim());
        markField(cvv, cvvInvalid);
        if (cvvInvalid) valid = false;
      }

      if (!valid) {
        showFormMessage(payBtn, "Please fill every field correctly.", "error");
        return;
      }

      // "place" the order: build the order record, fill the invoice,
      // clear the cart, then show the success + invoice screen
      const order = buildOrder({
        name: fullname.value.trim(),
        address: address.value.trim(),
        phone: phone.value.trim(),
        method: method,
      });

      fillInvoice(order);
      clearCart();

      document.getElementById("paymentWrap").style.display = "none";
      document.getElementById("orderSuccess").style.display = "block";
    });
  }

  /* ---------------- build an order record from the cart + form ---------------- */
  function buildOrder(customer) {
    const cart = getCart();
    const items = Object.values(cart);
    const total = items.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);

    return {
      orderId: "ORD" + Date.now(),
      date: new Date().toLocaleString(),
      customer: customer,
      items: items,
      total: total,
    };
  }

  /* ---------------- fill the printable / downloadable invoice ---------------- */
  function fillInvoice(order) {
    document.getElementById("invOrderId").textContent = order.orderId;
    document.getElementById("invDate").textContent = order.date;
    document.getElementById("invName").textContent = order.customer.name;
    document.getElementById("invAddress").textContent = order.customer.address;
    document.getElementById("invPhone").textContent = order.customer.phone;
    document.getElementById("invMethod").textContent = order.customer.method.toUpperCase();

    const tbody = document.getElementById("invItems");
    tbody.innerHTML = "";
    order.items.forEach(function (item) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>₹${item.price}</td>
        <td>₹${item.price * item.qty}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById("invTotal").textContent = `₹${order.total}`;

    // keep the last order around so the download/print buttons
    // still work even if the page gets reloaded
    localStorage.setItem("ecom_last_order", JSON.stringify(order));
  }

  /* ---------------- download the invoice as a PDF ---------------- */
  /* ---------------- download the invoice as a PDF ---------------- */
  function initDownloadPdf() {
    const btn = document.getElementById("downloadPdfBtn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      if (!window.jspdf) {
        alert("PDF library did not load. Please check your internet connection and try again.");
        return;
      }

      const orderRaw = localStorage.getItem("ecom_last_order");
      const order = orderRaw ? JSON.parse(orderRaw) : null;
      if (!order) return;

      // load the logo first, THEN build the PDF once it's ready
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.onload = function () {
        buildPdf(order, logoImg);
      };
      logoImg.onerror = function () {
        // logo failed to load (missing file, wrong format, etc.)
        // still generate the PDF, just without the logo image
        buildPdf(order, null);
      };
      logoImg.src = "/ecom/logo02.png";
    });
  }

  function buildPdf(order, logoImg) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;

    if (logoImg) {
      doc.addImage(logoImg, "PNG", 14, 10, 30, 12);
      doc.setFontSize(16);
      doc.text("Order Invoice", 50, 20);
      y = 32;
    } else {
      doc.setFontSize(18);
      doc.text("Order Invoice", 20, 20);
      y = 30;
    }

    doc.setFontSize(11);
    doc.text(`Order ID: ${order.orderId}`, 14, y);
    y += 6;
    doc.text(`Date: ${order.date}`, 14, y);

    y += 10;
    doc.text(`Name: ${order.customer.name}`, 14, y);
    y += 6;
    doc.text(`Address: ${order.customer.address}`, 14, y);
    y += 6;
    doc.text(`Phone: ${order.customer.phone}`, 14, y);
    y += 6;
    doc.text(`Payment Method: ${order.customer.method.toUpperCase()}`, 14, y);

    y += 12;
    doc.setFont(undefined, "bold");
    doc.text("Item", 14, y);
    doc.text("Qty", 110, y);
    doc.text("Price", 135, y);
    doc.text("Subtotal", 165, y);
    doc.setFont(undefined, "normal");

    y += 4;
    doc.line(14, y, 196, y);

    order.items.forEach(function (item) {
      y += 8;
      doc.text(String(item.name), 14, y);
      doc.text(String(item.qty), 110, y);
      doc.text("Rs " + item.price, 135, y);
      doc.text("Rs " + item.price * item.qty, 165, y);
    });

    y += 6;
    doc.line(14, y, 196, y);
    y += 10;
    doc.setFont(undefined, "bold");
    doc.text(`Total: Rs ${order.total}`, 14, y);

    doc.save(`${order.orderId}.pdf`);
  }
  
  /* ---------------- print the invoice ---------------- */
  function initPrintInvoice() {
    const btn = document.getElementById("printInvoiceBtn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      window.print();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderOrderSummary();
    initPaymentMethodToggle();
    initPaymentForm();
    initDownloadPdf();
    initPrintInvoice();
  });
})();
