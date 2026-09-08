// ===== CONFIG — edit these to match the real business =====
const BUSINESS = {
  name: "Aqua Nirmal",
  whatsappNumber: "9779700150416", // country code + number, no + or spaces
  phone: "+977 9700150416",
  email: "aquanirmal5@gmail.com",
  serviceAreas: ["Gokarneshwor", "Budhanilkantha", "Chabahil", "Sundarijal", "Jorpati", "Kapan"], // sample — edit to your real delivery areas
};

// ===== Mobile nav toggle =====
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
    nav.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => nav.classList.remove("open"))
    );
  }

  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  initPincodeChecker();
  initOrderForm();
  initContactForm();
});

// ===== Pincode / service-area checker =====
function initPincodeChecker() {
  const form = document.getElementById("pincode-form");
  if (!form) return;
  const input = document.getElementById("pincode-input");
  const result = document.getElementById("check-result");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) {
      result.textContent = "Enter your area or tole name.";
      result.style.color = "#e2a35c";
      return;
    }
    const covered = BUSINESS.serviceAreas.some(a => a.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(a.toLowerCase()));
    result.textContent = covered
      ? "✓ We deliver to your area. Next slot: today, 4–7 PM."
      : "Not sure if we cover this yet — WhatsApp us your area and we'll confirm.";
    result.style.color = covered ? "#8fd6b4" : "#e2a35c";
  });
}

// ===== Order form: jar sizes, qty, subscription, live summary, WhatsApp handoff =====
// 20L jar pricing is quantity-tiered and negotiable — edit these breakpoints to match your real rates.
const JAR_20L_TIERS = [
  { min: 50, price: 30 },
  { min: 30, price: 40 },
  { min: 10, price: 50 },
  { min: 1,  price: 70 },
];
function price20L(qty) {
  return JAR_20L_TIERS.find(t => qty >= t.min).price;
}
const FLAT_PRICES = { "5L": 30, "1L": 15 }; // smaller sizes, less bulk-driven

function initOrderForm() {
  const form = document.getElementById("order-form");
  if (!form) return;

  const qtyDisplay = document.getElementById("qty-value");
  const qtyInput = document.getElementById("qty-hidden");
  let qty = 1;

  document.getElementById("qty-minus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyDisplay.textContent = qty;
    qtyInput.value = qty;
    updateSummary();
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    qty = Math.min(50, qty + 1);
    qtyDisplay.textContent = qty;
    qtyInput.value = qty;
    updateSummary();
  });

  form.querySelectorAll('input[name="jarSize"], input[name="frequency"]').forEach(el =>
    el.addEventListener("change", updateSummary)
  );

  function currentSize() {
    return form.querySelector('input[name="jarSize"]:checked')?.value || "20L";
  }
  function currentFreq() {
    return form.querySelector('input[name="frequency"]:checked')?.value || "one-time";
  }

  function updateSummary() {
    const size = currentSize();
    const unit = size === "20L" ? price20L(qty) : FLAT_PRICES[size];
    const subtotal = unit * qty;
    const freq = currentFreq();
    const discount = freq === "weekly" ? 0.1 : freq === "monthly" ? 0.05 : 0;
    const total = Math.round(subtotal * (1 - discount));

    document.getElementById("sum-size").textContent = size;
    document.getElementById("sum-qty").textContent = qty;
    document.getElementById("sum-unit").textContent = "Rs " + unit + (size === "20L" ? " (negotiable)" : "");
    document.getElementById("sum-freq").textContent = freq === "one-time" ? "One-time" : freq[0].toUpperCase() + freq.slice(1) + " subscription";
    document.getElementById("sum-total").textContent = "~Rs " + total;
  }
  updateSummary();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = new FormData(form);
    const name = data.get("name");
    const addr = data.get("address");
    const pincode = data.get("pincode");
    const phone = data.get("phone");
    const size = currentSize();
    const freq = currentFreq();
    const total = document.getElementById("sum-total").textContent;

    const msg =
      `New order — ${BUSINESS.name}\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Address: ${addr} (${pincode})\n` +
      `Jar size: ${size}\n` +
      `Quantity: ${qty}\n` +
      `Plan: ${freq}\n` +
      `Est. total: ${total}`;

    window.open(`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  });
}

// ===== Contact form (demo — wire to your backend / form service) =====
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = document.getElementById("contact-status");
    status.textContent = "Message received — we'll get back to you within a business day.";
    status.style.color = "#2f5d4f";
    form.reset();
  });
}
