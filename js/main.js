// ===== CONFIG — edit these to match the real business =====
const BUSINESS = {
  name: "Aqua Nirmal",
  whatsappNumber: "9779700150416", // country code + number, no + or spaces
  phone: "+977 9700150416",
  email: "aquanirmal5@gmail.com",
  serviceAreas: ["Gokarneshwor", "Budhanilkantha", "Chabahil", "Sundarijal", "Jorpati", "Kapan"], // sample — edit to your real delivery areas
};

// Flag JS so CSS can safely hide scroll-reveal targets — without this class
// the content stays visible for no-JS visitors.
document.documentElement.classList.add("js");

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
  initMotion();
});

// ===== Motion: scroll reveals, header lift, subtle hero parallax =====
function initMotion() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Anything inside a .wrap that reads as a block of content gets revealed on entry.
  const targets = document.querySelectorAll(
    ".reveal, .section-head, .step, .plan, .quote, .cert, .photo-card, .check-card, .process-list li, .order-summary, .hero-product"
  );
  targets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", (i % 6) * 70 + "ms");
  });

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach(el => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    targets.forEach(el => io.observe(el));
  }

  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (!reduced) {
    const art = document.querySelector(".hero-art");
    if (art) {
      let ticking = false;
      window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const shift = Math.min(window.scrollY * 0.06, 28);
          art.style.transform = `translateY(${shift}px)`;
          ticking = false;
        });
      }, { passive: true });
    }
  }
}

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

// ===== Order form: 20L jars only, min 5, live summary, WhatsApp handoff =====
// Pricing is negotiated per order on WhatsApp, so no amounts are shown on the site.
const MIN_JARS = 5;
const MAX_JARS = 200;

function initOrderForm() {
  const form = document.getElementById("order-form");
  if (!form) return;

  const qtyDisplay = document.getElementById("qty-value");
  const qtyInput = document.getElementById("qty-hidden");
  const minus = document.getElementById("qty-minus");
  const plus = document.getElementById("qty-plus");
  const note = document.getElementById("qty-note");
  const slot = document.getElementById("o-slot");
  let qty = MIN_JARS;

  function setQty(next) {
    const clamped = Math.min(MAX_JARS, Math.max(MIN_JARS, next));
    const hitFloor = next < MIN_JARS;
    if (clamped !== qty) {
      qty = clamped;
      qtyDisplay.textContent = qty;
      qtyDisplay.classList.remove("bump");
      void qtyDisplay.offsetWidth; // restart the bump animation
      qtyDisplay.classList.add("bump");
      qtyInput.value = qty;
      updateSummary();
    }
    // The minus button stays clickable at the floor so a tap explains the
    // 5-jar minimum instead of silently doing nothing.
    minus.classList.toggle("at-limit", qty <= MIN_JARS);
    plus.disabled = qty >= MAX_JARS;
    if (hitFloor && note) {
      note.classList.remove("nudge");
      void note.offsetWidth;
      note.classList.add("nudge");
    }
  }

  minus.addEventListener("click", () => setQty(qty - 1));
  plus.addEventListener("click", () => setQty(qty + 1));
  if (slot) slot.addEventListener("change", updateSummary);

  function updateSummary() {
    document.getElementById("sum-qty").textContent = qty + (qty === 1 ? " jar" : " jars");
    const slotEl = document.getElementById("sum-slot");
    if (slotEl && slot) slotEl.textContent = slot.value;
  }
  setQty(MIN_JARS);
  updateSummary();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = new FormData(form);
    const msg =
      `New order — ${BUSINESS.name}\n` +
      `Name: ${data.get("name")}\n` +
      `Phone: ${data.get("phone")}\n` +
      `Address: ${data.get("address")} (${data.get("pincode")})\n` +
      `Jar size: 20L\n` +
      `Quantity: ${qty} jars\n` +
      `Delivery slot: ${data.get("slot")}\n` +
      `Please confirm the rate for this quantity.`;

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
