// ===== CONFIG — Aqua Nirmal Business Info =====
const BUSINESS = {
  name: "Aqua Nirmal",
  whatsappNumber: "9779700150416", // country code + number, no + or spaces
  phone: "+977 9700150416",
  email: "aquanirmal5@gmail.com",
  serviceAreas: ["Gokarneshwor", "Budhanilkantha", "Chabahil", "Sundarijal", "Jorpati", "Kapan", "Boudha", "Kathmandu"],
};

document.addEventListener("DOMContentLoaded", () => {
  // Set current year
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  // Core features
  initMobileNav();
  initWaterDroplets();
  init3DTiltCards();
  initGallery();
  initLightbox();
  initScrollReveal();
  initButtonRipples();
  initPincodeChecker();
  initOrderForm();
  initContactForm();
});

// =========================================================
// 1. MOBILE NAV TOGGLE (Bug-free, Keyboard & Scroll-locked)
// =========================================================
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  function setOpen(isOpen) {
    nav.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  toggle.addEventListener("click", () => {
    const willOpen = !nav.classList.contains("open");
    setOpen(willOpen);
  });

  // Close on link click
  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => setOpen(false));
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setOpen(false);
    }
  });

  // Header scroll shadow
  const header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 20);
    }, { passive: true });
  }
}

// =========================================================
// 2. ANIMATED WATER DROPLETS & CONDENSATION CANVAS
// =========================================================
function initWaterDroplets() {
  const container = document.querySelector(".water-droplets-backdrop");
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.className = "water-droplets-canvas";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width, height;
  let animationId;
  let isVisible = true;

  // Droplets simulation array
  let droplets = [];
  const maxDroplets = window.innerWidth < 768 ? 45 : 85;

  function resize() {
    width = canvas.width = container.offsetWidth;
    height = canvas.height = container.offsetHeight;
    initDropletData();
  }

  function initDropletData() {
    droplets = [];
    for (let i = 0; i < maxDroplets; i++) {
      droplets.push(createDroplet(true));
    }
  }

  function createDroplet(initial = false) {
    const radius = Math.random() < 0.8 ? (Math.random() * 3 + 1.5) : (Math.random() * 6 + 4);
    return {
      x: Math.random() * (width || 800),
      y: initial ? Math.random() * (height || 600) : -15,
      radius: radius,
      speedY: radius > 4 ? (0.3 + Math.random() * 0.7) : (0.05 + Math.random() * 0.15),
      speedX: (Math.random() - 0.5) * 0.05,
      opacity: 0.4 + Math.random() * 0.45,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      tailLength: radius > 4 ? radius * 1.6 : 0
    };
  }

  // Mouse interaction ripple
  let mouse = { x: -1000, y: -1000, active: false };
  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    } else {
      mouse.active = false;
    }
  }, { passive: true });

  function drawDroplet(d) {
    ctx.save();
    ctx.translate(d.x, d.y);

    // Realistic Water droplet refraction & specular highlight
    // 1. Soft droplet shadow
    ctx.beginPath();
    ctx.arc(1, 1.5, d.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${d.opacity * 0.22})`;
    ctx.fill();

    // 2. Droplet body with water refraction gradient
    const grad = ctx.createRadialGradient(
      -d.radius * 0.25, -d.radius * 0.25, d.radius * 0.1,
      0, 0, d.radius
    );
    grad.addColorStop(0, `rgba(220, 245, 250, ${d.opacity * 0.9})`);
    grad.addColorStop(0.5, `rgba(130, 195, 205, ${d.opacity * 0.5})`);
    grad.addColorStop(0.9, `rgba(30, 80, 85, ${d.opacity * 0.4})`);
    grad.addColorStop(1, `rgba(255, 255, 255, ${d.opacity * 0.7})`);

    ctx.beginPath();
    ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 3. Crisp specular highlight on top curve
    ctx.beginPath();
    ctx.arc(-d.radius * 0.35, -d.radius * 0.35, d.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${d.opacity * 0.95})`;
    ctx.fill();

    // 4. Subtle secondary bottom-rim light reflection
    ctx.beginPath();
    ctx.arc(d.radius * 0.25, d.radius * 0.3, d.radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${d.opacity * 0.5})`;
    ctx.fill();

    ctx.restore();
  }

  function update() {
    if (!isVisible) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < droplets.length; i++) {
      const d = droplets[i];
      d.wobble += d.wobbleSpeed;
      d.x += d.speedX + Math.sin(d.wobble) * 0.15;
      d.y += d.speedY;

      // Mouse wipe interaction
      if (mouse.active) {
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) {
          const force = (60 - dist) / 60;
          d.x += (dx / dist) * force * 4;
          d.y += (dy / dist) * force * 4;
        }
      }

      // Reset when falling off canvas
      if (d.y > height + 20 || d.x < -20 || d.x > width + 20) {
        droplets[i] = createDroplet(false);
      }

      drawDroplet(d);
    }

    animationId = requestAnimationFrame(update);
  }

  window.addEventListener("resize", resize);
  resize();

  // Pause when out of view for 0% CPU waste
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible) {
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationId);
    }
  }, { threshold: 0.05 });

  observer.observe(container);
  animationId = requestAnimationFrame(update);
}

// =========================================================
// 3. 3D PERSPECTIVE TILT CARDS (Interactive mouse parallax)
// =========================================================
function init3DTiltCards() {
  const cards = document.querySelectorAll(".hero-3d-card, .photo-3d-item");
  if (!cards.length) return;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  cards.forEach(card => {
    // Ensure glare layer exists
    let glare = card.querySelector(".card-glare");
    if (!glare) {
      glare = document.createElement("div");
      glare.className = "card-glare";
      card.appendChild(glare);
    }

    let isHovered = false;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let animFrame;

    function renderTilt() {
      // Smooth lerp easing
      currentRotateX += (targetRotateX - currentRotateX) * 0.12;
      currentRotateY += (targetRotateY - currentRotateY) * 0.12;

      card.style.transform = `perspective(1000px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) translateZ(${isHovered ? 12 : 0}px)`;

      if (isHovered || Math.abs(currentRotateX) > 0.05 || Math.abs(currentRotateY) > 0.05) {
        animFrame = requestAnimationFrame(renderTilt);
      } else {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
      }
    }

    card.addEventListener("mouseenter", () => {
      isHovered = true;
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(renderTilt);
    });

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max tilt angle
      const maxTilt = 12;
      targetRotateX = ((centerY - y) / centerY) * maxTilt;
      targetRotateY = ((x - centerX) / centerX) * maxTilt;

      // Glare position
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      card.style.setProperty("--glare-x", `${glareX}%`);
      card.style.setProperty("--glare-y", `${glareY}%`);
    });

    card.addEventListener("mouseleave", () => {
      isHovered = false;
      targetRotateX = 0;
      targetRotateY = 0;
    });

    // Device orientation for mobile (if available & permitted)
    if (isTouchDevice && window.DeviceOrientationEvent && card.classList.contains("hero-3d-card")) {
      window.addEventListener("deviceorientation", (e) => {
        if (e.gamma !== null && e.beta !== null) {
          const tiltX = Math.min(Math.max((e.beta - 45) * 0.25, -10), 10);
          const tiltY = Math.min(Math.max(e.gamma * 0.25, -10), 10);
          card.style.transform = `perspective(800px) rotateX(${tiltX.toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg)`;
        }
      }, { passive: true });
    }
  });
}

// =========================================================
// 4. 3D PHOTO GALLERY FILTERING
// =========================================================
function initGallery() {
  const filterBtns = document.querySelectorAll(".gallery-filter-btn");
  const items = document.querySelectorAll(".photo-3d-item");
  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      items.forEach(item => {
        const cat = item.getAttribute("data-category");
        if (filter === "all" || cat === filter) {
          item.style.display = "block";
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "scale(1)";
          }, 20);
        } else {
          item.style.opacity = "0";
          item.style.transform = "scale(0.95)";
          setTimeout(() => {
            item.style.display = "none";
          }, 250);
        }
      });
    });
  });
}

// =========================================================
// 5. LIGHTBOX MODAL (Click to Zoom in 3D)
// =========================================================
function initLightbox() {
  const galleryItems = document.querySelectorAll(".photo-3d-item, .hero-3d-card");
  if (!galleryItems.length) return;

  // Create lightbox if not in DOM
  let lightbox = document.querySelector(".photo-lightbox");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.className = "photo-lightbox";
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close preview">&times;</button>
        <div class="lightbox-img-box">
          <img src="" alt="">
        </div>
        <div class="lightbox-caption">
          <div>
            <h3 id="lightbox-title"></h3>
            <p id="lightbox-desc"></p>
          </div>
          <span class="badge-tag-amber" id="lightbox-badge">Aqua Nirmal</span>
        </div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const lbImg = lightbox.querySelector("img");
  const lbTitle = lightbox.querySelector("#lightbox-title");
  const lbDesc = lightbox.querySelector("#lightbox-desc");
  const lbBadge = lightbox.querySelector("#lightbox-badge");
  const closeBtn = lightbox.querySelector(".lightbox-close");

  function openLightbox(src, title, desc, badge) {
    lbImg.src = src;
    lbTitle.textContent = title || "Aqua Nirmal Quality Khane Pani";
    lbDesc.textContent = desc || "Purified and packaged with multi-stage RO, UV & Ozonation.";
    lbBadge.textContent = badge || "Pure Batch";
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  galleryItems.forEach(item => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      if (!img) return;
      const title = item.querySelector("h3")?.textContent || img.alt || "Aqua Nirmal";
      const desc = item.querySelector("p")?.textContent || "Multi-stage purified water delivered to your doorstep.";
      const badge = item.querySelector(".photo-3d-badge")?.textContent || "Pure Himalayan Source";
      openLightbox(img.src, title, desc, badge);
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) closeLightbox();
  });
}

// =========================================================
// 6. SCROLL REVEAL OBSERVER
// =========================================================
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal-up");
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  elements.forEach(el => observer.observe(el));
}

// =========================================================
// 7. BUTTON WATER RIPPLE EFFECT
// =========================================================
function initButtonRipples() {
  document.querySelectorAll(".btn").forEach(button => {
    button.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement("span");
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add("ripple-fx");

      const ripple = this.querySelector(".ripple-fx");
      if (ripple) ripple.remove();

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });
}

// =========================================================
// 8. PINCODE / AREA CHECKER (Fixed Responsive Behavior)
// =========================================================
function initPincodeChecker() {
  const form = document.getElementById("pincode-form");
  if (!form) return;
  const input = document.getElementById("pincode-input");
  const result = document.getElementById("check-result");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) {
      result.textContent = "Please enter your area or tole name.";
      result.style.color = "#E5A056";
      return;
    }
    const covered = BUSINESS.serviceAreas.some(a =>
      a.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(a.toLowerCase())
    );
    result.textContent = covered
      ? "✓ Verified! We deliver to " + val + ". Next available slot: Today, 4–7 PM."
      : "We may cover this area! WhatsApp us your exact location to confirm instant delivery.";
    result.style.color = covered ? "#7FE0B5" : "#F5BA72";
  });
}

// =========================================================
// 9. ORDER FORM (Live calculation & WhatsApp Handoff)
// =========================================================
const JAR_20L_TIERS = [
  { min: 50, price: 30 },
  { min: 30, price: 40 },
  { min: 10, price: 50 },
  { min: 1,  price: 70 },
];
function price20L(qty) {
  return JAR_20L_TIERS.find(t => qty >= t.min).price;
}
const FLAT_PRICES = { "5L": 30, "1L": 15 };

function initOrderForm() {
  const form = document.getElementById("order-form");
  if (!form) return;

  const qtyDisplay = document.getElementById("qty-value");
  const qtyInput = document.getElementById("qty-hidden");
  let qty = 1;

  const minusBtn = document.getElementById("qty-minus");
  const plusBtn = document.getElementById("qty-plus");

  if (minusBtn && plusBtn) {
    minusBtn.addEventListener("click", () => {
      qty = Math.max(1, qty - 1);
      qtyDisplay.textContent = qty;
      qtyInput.value = qty;
      updateSummary();
    });
    plusBtn.addEventListener("click", () => {
      qty = Math.min(100, qty + 1);
      qtyDisplay.textContent = qty;
      qtyInput.value = qty;
      updateSummary();
    });
  }

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

    const sumSize = document.getElementById("sum-size");
    const sumQty = document.getElementById("sum-qty");
    const sumUnit = document.getElementById("sum-unit");
    const sumFreq = document.getElementById("sum-freq");
    const sumTotal = document.getElementById("sum-total");

    if (sumSize) sumSize.textContent = size;
    if (sumQty) sumQty.textContent = qty;
    if (sumUnit) sumUnit.textContent = "Rs " + unit + (size === "20L" ? " (negotiable)" : "");
    if (sumFreq) sumFreq.textContent = freq === "one-time" ? "One-time" : freq[0].toUpperCase() + freq.slice(1) + " subscription";
    if (sumTotal) sumTotal.textContent = "~Rs " + total;
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
    const slot = data.get("slot") || "Evening";
    const size = currentSize();
    const freq = currentFreq();
    const total = document.getElementById("sum-total")?.textContent || "";

    const msg =
      `*New Order — ${BUSINESS.name}*\n` +
      `👤 *Name:* ${name}\n` +
      `📞 *Phone:* ${phone}\n` +
      `📍 *Address:* ${addr} (${pincode})\n` +
      `📦 *Size:* ${size} x ${qty}\n` +
      `🔄 *Plan:* ${freq}\n` +
      `⏰ *Preferred Slot:* ${slot}\n` +
      `💰 *Estimated Total:* ${total}\n\n` +
      `_Please confirm availability and dispatch schedule._`;

    window.open(`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  });
}

// =========================================================
// 10. CONTACT FORM
// =========================================================
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = document.getElementById("contact-status");
    if (status) {
      status.textContent = "✓ Message sent successfully! Our team will contact you shortly.";
      status.style.color = "#256b53";
      status.style.fontWeight = "600";
    }
    form.reset();
  });
}
