/* ==========================================================
   KARSJ SHOP - PAYMENT.JS

   Features:
   - Read cart from localStorage
   - Show order summary
   - Validate checkout form
   - Card / UPI / COD
   - Create order
   - Save order
   - Clear cart
   - Show invoice
   - Download invoice PDF
   - Print invoice

   NOTE:
   This is a DEMO checkout.
   It does NOT process real card payments.
   ========================================================== */

(function () {

    "use strict";


    /* ======================================================
       CONSTANTS
    ====================================================== */

    const CART_KEY = "ecom_cart";

    const LAST_ORDER_KEY =
        "ecom_last_order";


    /* ======================================================
       GET CART
    ====================================================== */

    function getCart() {

        try {

            const savedCart =
                localStorage.getItem(CART_KEY);

            if (!savedCart) {
                return {};
            }

            const cart =
                JSON.parse(savedCart);

            if (
                !cart ||
                typeof cart !== "object"
            ) {
                return {};
            }

            return cart;

        } catch (error) {

            console.error(
                "Cart loading error:",
                error
            );

            return {};
        }
    }


    /* ======================================================
       CLEAR CART
    ====================================================== */

    function clearCart() {

        localStorage.removeItem(
            CART_KEY
        );

    }


    /* ======================================================
       GET ELEMENT
    ====================================================== */

    function getElement(id) {

        return document.getElementById(id);

    }


    /* ======================================================
       FORMAT CURRENCY
    ====================================================== */

    function formatCurrency(value) {

        const amount =
            Number(value) || 0;

        return (
            "₹" +
            amount.toLocaleString(
                "en-IN",
                {
                    maximumFractionDigits: 2
                }
            )
        );

    }


    /* ======================================================
       SHOW MESSAGE
    ====================================================== */

    function showMessage(
        message,
        type = "error"
    ) {

        const messageElement =
            getElement("paymentMessage");

        if (!messageElement) {
            return;
        }

        messageElement.textContent =
            message;

        messageElement.className =
            "form-message " + type;

    }


    /* ======================================================
       FIELD ERROR
    ====================================================== */

    function markField(
        field,
        invalid
    ) {

        if (!field) {
            return;
        }

        field.classList.toggle(
            "field-error",
            invalid
        );

        if (invalid) {

            field.setAttribute(
                "aria-invalid",
                "true"
            );

        } else {

            field.removeAttribute(
                "aria-invalid"
            );

        }

    }


    /* ======================================================
       RENDER ORDER SUMMARY
    ====================================================== */

    function renderOrderSummary() {

        const itemsList =
            getElement("orderItems");

        const totalElement =
            getElement("orderTotal");

        const payButton =
            getElement("payBtn");


        if (
            !itemsList ||
            !totalElement
        ) {

            console.error(
                "Order summary elements are missing."
            );

            return 0;
        }


        const cart =
            getCart();

        const items =
            Object.values(cart);


        itemsList.innerHTML =
            "";


        /* Empty cart */

        if (items.length === 0) {

            const emptyItem =
                document.createElement("li");

            emptyItem.className =
                "empty-msg";

            emptyItem.textContent =
                "Your cart is empty.";

            itemsList.appendChild(
                emptyItem
            );

            totalElement.textContent =
                "₹0";


            if (payButton) {

                payButton.disabled =
                    true;

            }


            return 0;
        }


        if (payButton) {

            payButton.disabled =
                false;

        }


        let total = 0;


        items.forEach(
            function (item) {

                const name =
                    String(
                        item.name ||
                        "Product"
                    );

                const price =
                    Number(
                        item.price
                    ) || 0;

                const quantity =
                    Number(
                        item.qty
                    ) || 0;

                const subtotal =
                    price * quantity;


                total += subtotal;


                const li =
                    document.createElement(
                        "li"
                    );


                const nameElement =
                    document.createElement(
                        "span"
                    );

                nameElement.textContent =
                    name +
                    " x " +
                    quantity;


                const priceElement =
                    document.createElement(
                        "span"
                    );

                priceElement.textContent =
                    formatCurrency(
                        subtotal
                    );


                li.appendChild(
                    nameElement
                );

                li.appendChild(
                    priceElement
                );


                itemsList.appendChild(
                    li
                );

            }
        );


        totalElement.textContent =
            formatCurrency(total);


        return total;

    }


    /* ======================================================
       PAYMENT METHOD TOGGLE
    ====================================================== */

    function initPaymentMethodToggle() {

        const radios =
            document.querySelectorAll(
                'input[name="method"]'
            );

        const cardFields =
            getElement("cardFields");


        if (
            !radios.length ||
            !cardFields
        ) {
            return;
        }


        function updateFields() {

            const selected =
                document.querySelector(
                    'input[name="method"]:checked'
                );


            const showCard =
                selected &&
                selected.value === "card";


            if (showCard) {

                cardFields.style.display =
                    "block";

                cardFields.classList.add(
                    "show"
                );

            } else {

                cardFields.style.display =
                    "none";

                cardFields.classList.remove(
                    "show"
                );

            }

        }


        radios.forEach(
            function (radio) {

                radio.addEventListener(
                    "change",
                    updateFields
                );

            }
        );


        updateFields();

    }


    /* ======================================================
       VALIDATE FORM
    ====================================================== */

    function validateForm() {

        const fullname =
            getElement("fullname");

        const address =
            getElement("address");

        const pincode =
            getElement("pincode");

        const phone =
            getElement("phone");

        const cardnumber =
            getElement("cardnumber");

        const expiry =
            getElement("expiry");

        const cvv =
            getElement("cvv");


        let valid = true;


        /* Full name */

        if (
            !fullname ||
            !fullname.value.trim()
        ) {

            markField(
                fullname,
                true
            );

            valid = false;

        } else {

            markField(
                fullname,
                false
            );

        }


        /* Address */

        if (
            !address ||
            !address.value.trim()
        ) {

            markField(
                address,
                true
            );

            valid = false;

        } else {

            markField(
                address,
                false
            );

        }


        /* Pincode */

        if (
            !pincode ||
            !/^\d{6}$/.test(
                pincode.value.trim()
            )
        ) {

            markField(
                pincode,
                true
            );

            valid = false;

        } else {

            markField(
                pincode,
                false
            );

        }


        /* Phone */

        if (
            !phone ||
            !/^\d{10}$/.test(
                phone.value.trim()
            )
        ) {

            markField(
                phone,
                true
            );

            valid = false;

        } else {

            markField(
                phone,
                false
            );

        }


        /* Payment method */

        const selectedMethod =
            document.querySelector(
                'input[name="method"]:checked'
            );


        if (!selectedMethod) {

            valid = false;

        }


        /* Card validation */

        if (
            selectedMethod &&
            selectedMethod.value === "card"
        ) {


            /* Card number */

            const cleanCardNumber =
                cardnumber
                    ? cardnumber.value
                        .replace(/\s/g, "")
                    : "";


            if (
                !/^\d{13,19}$/.test(
                    cleanCardNumber
                )
            ) {

                markField(
                    cardnumber,
                    true
                );

                valid = false;

            } else {

                markField(
                    cardnumber,
                    false
                );

            }


            /* Expiry */

            if (
                !expiry ||
                !/^(0[1-9]|1[0-2])\/\d{2}$/.test(
                    expiry.value.trim()
                )
            ) {

                markField(
                    expiry,
                    true
                );

                valid = false;

            } else {

                markField(
                    expiry,
                    false
                );

            }


            /* CVV */

            if (
                !cvv ||
                !/^\d{3,4}$/.test(
                    cvv.value.trim()
                )
            ) {

                markField(
                    cvv,
                    true
                );

                valid = false;

            } else {

                markField(
                    cvv,
                    false
                );

            }

        }


        return {

            valid: valid,

            method:
                selectedMethod
                    ? selectedMethod.value
                    : null

        };

    }


    /* ======================================================
       BUILD ORDER
    ====================================================== */

    function buildOrder(
        customer
    ) {

        const cart =
            getCart();

        const items =
            Object.values(cart);


        const cleanItems =
            items.map(
                function (item) {

                    const price =
                        Number(
                            item.price
                        ) || 0;

                    const qty =
                        Number(
                            item.qty
                        ) || 0;


                    return {

                        name:
                            String(
                                item.name ||
                                "Product"
                            ),

                        price:
                            price,

                        qty:
                            qty,

                        subtotal:
                            price * qty

                    };

                }
            );


        const total =
            cleanItems.reduce(
                function (
                    sum,
                    item
                ) {

                    return (
                        sum +
                        item.subtotal
                    );

                },
                0
            );


        return {

            orderId:
                "ORD" +
                Date.now(),

            date:
                new Date()
                    .toLocaleString(
                        "en-IN"
                    ),

            customer: {

                name:
                    customer.name,

                address:
                    customer.address,

                phone:
                    customer.phone,

                method:
                    customer.method

            },

            items:
                cleanItems,

            total:
                total

        };

    }


    /* ======================================================
       FILL INVOICE
    ====================================================== */

    function fillInvoice(
        order
    ) {

        const orderId =
            getElement("invOrderId");

        const date =
            getElement("invDate");

        const name =
            getElement("invName");

        const address =
            getElement("invAddress");

        const phone =
            getElement("invPhone");

        const method =
            getElement("invMethod");

        const itemsTable =
            getElement("invItems");

        const total =
            getElement("invTotal");


        if (orderId) {

            orderId.textContent =
                order.orderId;

        }


        if (date) {

            date.textContent =
                order.date;

        }


        if (name) {

            name.textContent =
                order.customer.name;

        }


        if (address) {

            address.textContent =
                order.customer.address;

        }


        if (phone) {

            phone.textContent =
                order.customer.phone;

        }


        if (method) {

            method.textContent =
                order.customer.method
                    .toUpperCase();

        }


        if (itemsTable) {

            itemsTable.innerHTML =
                "";


            order.items.forEach(
                function (item) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    const nameCell =
                        document.createElement(
                            "td"
                        );

                    nameCell.textContent =
                        item.name;


                    const qtyCell =
                        document.createElement(
                            "td"
                        );

                    qtyCell.textContent =
                        item.qty;


                    const priceCell =
                        document.createElement(
                            "td"
                        );

                    priceCell.textContent =
                        formatCurrency(
                            item.price
                        );


                    const subtotalCell =
                        document.createElement(
                            "td"
                        );

                    subtotalCell.textContent =
                        formatCurrency(
                            item.subtotal
                        );


                    row.appendChild(
                        nameCell
                    );

                    row.appendChild(
                        qtyCell
                    );

                    row.appendChild(
                        priceCell
                    );

                    row.appendChild(
                        subtotalCell
                    );


                    itemsTable.appendChild(
                        row
                    );

                }
            );

        }


        if (total) {

            total.textContent =
                formatCurrency(
                    order.total
                );

        }


        /* Save last order */

        localStorage.setItem(
            LAST_ORDER_KEY,
            JSON.stringify(order)
        );

    }


    /* ======================================================
       PAYMENT FORM
    ====================================================== */

    function initPaymentForm() {

        const form =
            getElement("paymentForm");


        if (!form) {

            console.error(
                "paymentForm not found."
            );

            return;
        }


        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const cart =
                    getCart();


                /* Check cart */

                if (
                    Object.keys(cart)
                        .length === 0
                ) {

                    showMessage(
                        "Your cart is empty.",
                        "error"
                    );

                    return;
                }


                /* Validate */

                const validation =
                    validateForm();


                if (!validation.valid) {

                    showMessage(
                        "Please fill every field correctly.",
                        "error"
                    );

                    return;
                }


                /* Get customer data */

                const fullname =
                    getElement("fullname");

                const address =
                    getElement("address");

                const phone =
                    getElement("phone");


                /* Create order */

                const order =
                    buildOrder({

                        name:
                            fullname.value.trim(),

                        address:
                            address.value.trim(),

                        phone:
                            phone.value.trim(),

                        method:
                            validation.method

                    });


                /* Fill invoice */

                fillInvoice(
                    order
                );


                /* Clear cart */

                clearCart();


                /* Hide payment */

                const paymentWrap =
                    getElement(
                        "paymentWrap"
                    );


                if (paymentWrap) {

                    paymentWrap.style.display =
                        "none";

                }


                /* Show success */

                const success =
                    getElement(
                        "orderSuccess"
                    );


                if (success) {

                    success.style.display =
                        "block";


                    success.scrollIntoView({
                        behavior:
                            "smooth",

                        block:
                            "start"
                    });

                }


                showMessage(
                    "",
                    ""
                );

            }
        );

    }


    /* ======================================================
       DOWNLOAD PDF
    ====================================================== */

    function initDownloadPdf() {

        const button =
            getElement(
                "downloadPdfBtn"
            );


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            function () {


                /* Check jsPDF */

                if (
                    !window.jspdf ||
                    !window.jspdf.jsPDF
                ) {

                    alert(
                        "PDF library did not load. Please refresh the page and try again."
                    );

                    return;
                }


                /* Get order */

                const savedOrder =
                    localStorage.getItem(
                        LAST_ORDER_KEY
                    );


                if (!savedOrder) {

                    alert(
                        "No invoice is available."
                    );

                    return;
                }


                let order;


                try {

                    order =
                        JSON.parse(
                            savedOrder
                        );

                } catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        "Unable to read order information."
                    );

                    return;
                }


                /*
                 * Logo path
                 *
                 * This assumes:
                 *
                 * ecom/
                 * ├── payment.html
                 * ├── payment.js
                 * └── logo02.svg
                 *
                 * If your logo is inside image/,
                 * change this to:
                 *
                 * image/logo02.png
                 */


                const logo =
                    new Image();


                logo.onload =
                    function () {

                        buildPdf(
                            order,
                            logo
                        );

                    };


                logo.onerror =
                    function () {

                        console.warn(
                            "Logo could not be loaded. PDF will be generated without logo."
                        );


                        buildPdf(
                            order,
                            null
                        );

                    };


                /*
                 * SVG logo
                 * is used only as a page image here.
                 *
                 * If jsPDF cannot add it,
                 * the PDF will still be generated.
                 */

                logo.src =
                    "logo02.svg";

            }
        );

    }


    /* ======================================================
       BUILD PDF
    ====================================================== */

    function buildPdf(
        order,
        logo
    ) {

        const jsPDF =
            window.jspdf.jsPDF;


        const doc =
            new jsPDF();


        let y = 20;


        /* ==================================================
           HEADER
        ================================================== */

        doc.setFontSize(
            18
        );


        doc.text(
            "KARSJ Shop",
            20,
            20
        );


        doc.setFontSize(
            14
        );


        doc.text(
            "Order Invoice",
            20,
            29
        );


        y = 40;


        /* ==================================================
           ORDER INFORMATION
        ================================================== */

        doc.setFontSize(
            11
        );


        doc.text(
            "Order ID: " +
                order.orderId,
            14,
            y
        );


        y += 6;


        doc.text(
            "Date: " +
                order.date,
            14,
            y
        );


        y += 10;


        doc.text(
            "Name: " +
                order.customer.name,
            14,
            y
        );


        y += 6;


        doc.text(
            "Address: " +
                order.customer.address,
            14,
            y
        );


        y += 6;


        doc.text(
            "Phone: " +
                order.customer.phone,
            14,
            y
        );


        y += 6;


        doc.text(
            "Payment Method: " +
                order.customer.method
                    .toUpperCase(),
            14,
            y
        );


        /* ==================================================
           TABLE
        ================================================== */

        y += 12;


        doc.setFont(
            undefined,
            "bold"
        );


        doc.text(
            "Item",
            14,
            y
        );


        doc.text(
            "Qty",
            105,
            y
        );


        doc.text(
            "Price",
            130,
            y
        );


        doc.text(
            "Subtotal",
            165,
            y
        );


        doc.setFont(
            undefined,
            "normal"
        );


        y += 4;


        doc.line(
            14,
            y,
            196,
            y
        );


        /* ==================================================
           PRODUCTS
        ================================================== */

        order.items.forEach(
            function (item) {

                y += 8;


                /* New page */

                if (y > 270) {

                    doc.addPage();

                    y = 20;

                }


                let itemName =
                    String(
                        item.name
                    );


                if (
                    itemName.length >
                    30
                ) {

                    itemName =
                        itemName.substring(
                            0,
                            27
                        ) +
                        "...";

                }


                doc.text(
                    itemName,
                    14,
                    y
                );


                doc.text(
                    String(
                        item.qty
                    ),
                    105,
                    y
                );


                doc.text(
                    "Rs " +
                        item.price,
                    130,
                    y
                );


                doc.text(
                    "Rs " +
                        item.subtotal,
                    165,
                    y
                );

            }
        );


        /* ==================================================
           TOTAL
        ================================================== */

        y += 8;


        if (y > 270) {

            doc.addPage();

            y = 20;

        }


        doc.line(
            14,
            y,
            196,
            y
        );


        y += 10;


        doc.setFont(
            undefined,
            "bold"
        );


        doc.text(
            "Total: Rs " +
                order.total,
            14,
            y
        );


        doc.setFont(
            undefined,
            "normal"
        );


        /* ==================================================
           SAVE
        ================================================== */

        doc.save(
            order.orderId +
                ".pdf"
        );

    }


    /* ======================================================
       PRINT
    ====================================================== */

    function initPrintInvoice() {

        const button =
            getElement(
                "printInvoiceBtn"
            );


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            function () {

                window.print();

            }
        );

    }


    /* ======================================================
       INPUT FORMATTING
    ====================================================== */

    function initInputFormatting() {

        const pincode =
            getElement(
                "pincode"
            );

        const phone =
            getElement(
                "phone"
            );

        const cardnumber =
            getElement(
                "cardnumber"
            );

        const expiry =
            getElement(
                "expiry"
            );

        const cvv =
            getElement(
                "cvv"
            );


        /* Pincode */

        if (pincode) {

            pincode.addEventListener(
                "input",
                function () {

                    this.value =
                        this.value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(
                                0,
                                6
                            );

                }
            );

        }


        /* Phone */

        if (phone) {

            phone.addEventListener(
                "input",
                function () {

                    this.value =
                        this.value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(
                                0,
                                10
                            );

                }
            );

        }


        /* Card */

        if (cardnumber) {

            cardnumber.addEventListener(
                "input",
                function () {

                    let value =
                        this.value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(
                                0,
                                19
                            );


                    /*
                     * Add spaces every 4 digits
                     */

                    value =
                        value.replace(
                            /(.{4})/g,
                            "$1 "
                        ).trim();


                    this.value =
                        value;

                }
            );

        }


        /* Expiry */

        if (expiry) {

            expiry.addEventListener(
                "input",
                function () {

                    let value =
                        this.value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(
                                0,
                                4
                            );


                    if (
                        value.length >= 3
                    ) {

                        value =
                            value.substring(
                                0,
                                2
                            ) +
                            "/" +
                            value.substring(
                                2
                            );

                    }


                    this.value =
                        value;

                }
            );

        }


        /* CVV */

        if (cvv) {

            cvv.addEventListener(
                "input",
                function () {

                    this.value =
                        this.value
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(
                                0,
                                4
                            );

                }
            );

        }

    }


    /* ======================================================
       INITIALIZE
    ====================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            renderOrderSummary();

            initPaymentMethodToggle();

            initPaymentForm();

            initDownloadPdf();

            initPrintInvoice();

            initInputFormatting();

        }
    );

})();
