// ===== CONFIG — edit these to match the real business =====
const BUSINESS = {
  name: "Aqua Nirmal",
  whatsappNumber: "9779700150416", // country code + number, no + or spaces
  phone: "+977 9700150416",
  email: "aquanirmal5@gmail.com",
  serviceAreas: ["Kathmandu", "Lalitpur", "Bhaktapur", "Gokarneshwor", "Budhanilkantha", "Chabahil", "Sundarijal", "Jorpati", "Kapan"],

  // Homepage dashboard. THESE ARE PLACEHOLDERS — they are shown to customers
  // as your delivery figures, so replace them with your real numbers (or drop
  // the tile) before publishing. Nothing here is measured automatically.
  dashboard: {
    jarsToday: 128,               // jars delivered today
    last7Days: [64, 92, 71, 118, 99, 143, 128], // same figure, previous 7 days
  },
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

  initWaterBackground();
  initJars3D();
  initDashboard();
  initTilt();
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

    // Safety net. An IntersectionObserver only reports elements that are
    // intersecting when it samples, so a jump — an anchor link, or the browser
    // restoring a scroll position — can skip straight past a block and leave it
    // stuck at opacity 0. Sweep anything already scrolled past into view.
    let sweeping = false;
    const sweep = () => {
      sweeping = false;
      targets.forEach(el => {
        if (el.classList.contains("is-in")) return;
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
    };
    window.addEventListener("scroll", () => {
      if (sweeping) return;
      sweeping = true;
      requestAnimationFrame(sweep);
    }, { passive: true });
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


// ===== 3D jar =====
// A real CSS-3D jar. Each segment of the jar's profile (cap, neck, shoulder,
// body) is its own cylinder: N flat "staves" fanned around the Y axis. The
// staves are plain translucent glass — the curvature shading and specular
// highlights live in a separate layer that does NOT spin, so the light stays
// put the way it would on real glass while the jar turns underneath it.
// The body is a true cylinder of flat staves fanned around the Y axis, and it
// spins — its vertical ribs and the travelling water surface are what make the
// rotation readable. The cap, neck and shoulder are surfaces of revolution:
// they look identical at every angle, so building them from spinning panels
// only produced overlap artefacts. They are drawn as shaded static geometry
// instead, lit to match the body.
const JAR_BODY = { staves: 28, rTop: 62, rBottom: 60, height: 152, top: 88 };
const JAR3D = { drops: 8, bubbles: 6 };

function buildFrustum(host, seg) {
  const { staves, rTop, rBottom, height } = seg;
  const dr = rBottom - rTop;
  // Slant height and lean of each panel — after the lean, the panel's
  // vertical extent is exactly `height` again.
  const slant = Math.sqrt(height * height + dr * dr);
  const tilt = (Math.atan2(dr, height) * 180) / Math.PI;
  const rMid = (rTop + rBottom) / 2;
  const rWide = Math.max(rTop, rBottom);
  // Chord width at the wider end, plus a hair of overlap so no seams show.
  const width = 2 * rWide * Math.tan(Math.PI / staves) + 1.4;
  // Narrow end of each trapezoid, as an inset from both sides.
  const inset = ((1 - Math.min(rTop, rBottom) / rWide) / 2) * 100;
  const clip = inset > 0.5
    ? (rTop < rBottom
        ? `polygon(0% 100%, 100% 100%, ${(100 - inset).toFixed(2)}% 0%, ${inset.toFixed(2)}% 0%)`
        : `polygon(${inset.toFixed(2)}% 100%, ${(100 - inset).toFixed(2)}% 100%, 100% 0%, 0% 0%)`)
    : "";
  const step = 360 / staves;

  const frag = document.createDocumentFragment();
  for (let i = 0; i < staves; i++) {
    const stave = document.createElement("span");
    stave.className = "stave";
    stave.style.width = width.toFixed(2) + "px";
    stave.style.height = slant.toFixed(2) + "px";
    stave.style.marginLeft = (-width / 2).toFixed(2) + "px";
    stave.style.marginTop = (-slant / 2).toFixed(2) + "px";
    stave.style.transform =
      `rotateY(${(i * step).toFixed(2)}deg) translateZ(${rMid.toFixed(2)}px) rotateX(${(-tilt).toFixed(2)}deg)`;
    if (clip) stave.style.clipPath = clip;
    // Phase the water animation around the circumference so the surface
    // reads as one travelling wave rather than every panel pulsing at once.
    stave.style.setProperty("--d", (-(i / staves) * 3.2).toFixed(2) + "s");
    stave.appendChild(document.createElement("i"));
    frag.appendChild(stave);
  }
  host.appendChild(frag);
}

function el(cls, tag) {
  const node = document.createElement(tag || "div");
  node.className = cls;
  return node;
}

function initJars3D() {
  document.querySelectorAll("[data-jar3d]").forEach(mount => {
    if (mount.dataset.jarReady === "true") return;
    mount.dataset.jarReady = "true";
    mount.classList.add("jar3d");
    mount.innerHTML = "";

    const scene = el("jar3d-scene");

    const spin = el("jar3d-spin");
    const body = el("jar3d-cyl seg-body");
    body.style.height = JAR_BODY.height + "px";
    body.style.top = JAR_BODY.top + "px";
    buildFrustum(body, JAR_BODY);
    spin.append(body, el("jar3d-disc jar3d-base"));

    // Static upper geometry: shoulder taper, ribbed neck, cap.
    const top = el("jar3d-top");
    top.append(el("jar3d-shoulder"), el("jar3d-neck"), el("jar3d-cap"));

    // Non-spinning layers: curvature shading, highlights, then droplets.
    const shade = el("jar3d-shade");
    const light = el("jar3d-light");
    const drops = el("jar3d-drops");

    for (let i = 0; i < JAR3D.drops; i++) {
      const d = el("drop", "span");
      // Deterministic spread — the jar looks identical on every load.
      d.style.setProperty("--x", (14 + (i * 23) % 68) + "%");
      d.style.setProperty("--y", (36 + (i * 17) % 40) + "%");
      d.style.setProperty("--s", (0.5 + ((i * 3) % 5) / 8).toFixed(2));
      d.style.setProperty("--d", (i * 0.66).toFixed(2) + "s");
      drops.appendChild(d);
    }
    for (let i = 0; i < JAR3D.bubbles; i++) {
      const b = el("bubble", "span");
      b.style.setProperty("--x", (30 + (i * 19) % 40) + "%");
      b.style.setProperty("--s", (0.45 + ((i * 4) % 6) / 9).toFixed(2));
      b.style.setProperty("--d", (i * 0.85).toFixed(2) + "s");
      drops.appendChild(b);
    }

    // A soft ellipse at the base. The base disc is edge-on at this viewing
    // angle, so without it the cylinder reads as cut off flat.
    scene.append(spin, top, el("jar3d-foot"), shade, light, drops);
    mount.append(scene, el("jar3d-shadow"));
  });
}

// ===== Pointer-driven 3D tilt =====
// Elements marked [data-tilt] rotate toward the cursor in real 3D, and their
// [data-depth] children lift out of the plane for a layered parallax.
function initTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover)").matches) return; // pointer devices only

  document.querySelectorAll("[data-tilt]").forEach(el => {
    const max = parseFloat(el.dataset.tilt) || 9;
    let frame = null;

    el.addEventListener("pointermove", (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--rx", (-py * max).toFixed(2) + "deg");
        el.style.setProperty("--ry", (px * max).toFixed(2) + "deg");
        el.classList.add("is-tilting");
        frame = null;
      });
    });

    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.classList.remove("is-tilting");
    });
  });
}

// ===== Homepage dashboard =====
function initDashboard() {
  const dash = document.querySelector("[data-dashboard]");
  if (!dash) return;

  // Live clock — the one genuinely real value on the panel.
  const clock = dash.querySelector("[data-clock]");
  if (clock) {
    const tick = () => {
      clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };
    tick();
    setInterval(tick, 30000);
  }

  // Delivery figures come from the BUSINESS config, never from the markup, so
  // there is exactly one place to correct them.
  const jarsToday = dash.querySelector("[data-jars-today]");
  if (jarsToday) jarsToday.dataset.count = String(BUSINESS.dashboard.jarsToday);
  const spark = dash.querySelector("[data-spark]");
  if (spark) {
    const days = BUSINESS.dashboard.last7Days;
    const peak = Math.max(...days, 1);
    days.forEach((value, i) => {
      const bar = document.createElement("span");
      bar.style.setProperty("--h", Math.max(8, (value / peak) * 100) + "%");
      bar.style.setProperty("--i", i);
      spark.appendChild(bar);
    });
  }

  // Service areas come straight from the BUSINESS config, so the count and the
  // chips can never drift apart.
  const areaCount = dash.querySelector("[data-areas-count]");
  if (areaCount) areaCount.dataset.count = String(BUSINESS.serviceAreas.length);
  const areaList = dash.querySelector("[data-areas]");
  if (areaList) {
    BUSINESS.serviceAreas.forEach(area => {
      const chip = document.createElement("span");
      chip.textContent = area;
      areaList.appendChild(chip);
    });
  }

  // Count the figures up when the panel scrolls into view.
  const counters = dash.querySelectorAll("[data-count]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    const suffix = el.dataset.suffix || "";
    if (reduced) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) { counters.forEach(run); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.4 });
  counters.forEach(c => io.observe(c));
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

// ===== Interactive Water Background (Movable waves, ripples & floating droplets) =====
function initWaterBackground() {
  const canvas = document.getElementById("hero-water-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const hero = canvas.closest(".hero") || canvas.parentElement;
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const mouse = {
    x: width * 0.7,
    y: height * 0.45,
    targetX: width * 0.7,
    targetY: height * 0.45,
    isHovering: false,
  };

  const ripples = [];
  function addRipple(x, y, strength = 1) {
    if (ripples.length > 20) ripples.shift();
    ripples.push({
      x,
      y,
      radius: 6,
      maxRadius: Math.max(width, height) * 0.5,
      alpha: 0.75 * strength,
      growth: 3.5 + Math.random() * 2,
    });
  }

  // Floating ambient water droplets & light motes
  const particles = [];
  const particleCount = 26;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * (width || 800),
      y: Math.random() * (height || 500),
      size: 1.5 + Math.random() * 3,
      speedY: 0.35 + Math.random() * 0.65,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: 0.25 + Math.random() * 0.55,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
    });
  }

  let lastMove = 0;
  function onPointerMove(e) {
    const rect = hero.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    if (px >= 0 && px <= width && py >= 0 && py <= height) {
      const dx = px - mouse.targetX;
      const dy = py - mouse.targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      mouse.targetX = px;
      mouse.targetY = py;
      mouse.isHovering = true;
      const now = performance.now();
      if (dist > 18 && now - lastMove > 80) {
        addRipple(px, py, Math.min(dist / 35, 1.3));
        lastMove = now;
      }
    }
  }

  hero.addEventListener("pointermove", onPointerMove, { passive: true });
  hero.addEventListener("pointerdown", (e) => {
    const rect = hero.getBoundingClientRect();
    addRipple(e.clientX - rect.left, e.clientY - rect.top, 1.6);
  }, { passive: true });
  hero.addEventListener("pointerleave", () => {
    mouse.isHovering = false;
    mouse.targetX = width * 0.7;
    mouse.targetY = height * 0.5;
  });

  let time = 0;
  let animId = null;
  let isVisible = true;

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !animId) loop();
    }, { threshold: 0.05 });
    io.observe(hero);
  }

  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
    if (isVisible && !animId) loop();
  });

  function drawWave(yOffset, amplitude, frequency, speed, colorTop, colorBottom, mouseInfluence) {
    ctx.beginPath();
    ctx.moveTo(0, height);

    const mOffsetX = (mouse.x - width / 2) * mouseInfluence;
    const mOffsetY = (mouse.y - height / 2) * mouseInfluence;

    for (let x = 0; x <= width; x += 6) {
      const distToMouse = Math.abs(x - mouse.x);
      const mouseBump = mouse.isHovering ? Math.exp(-Math.pow(distToMouse / 190, 2)) * 18 : 0;
      const y = yOffset + mOffsetY
        + Math.sin(x * frequency + time * speed + mOffsetX * 0.006) * amplitude
        + Math.cos(x * frequency * 0.65 - time * speed * 0.6) * (amplitude * 0.45)
        - mouseBump;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, yOffset - amplitude, 0, height);
    grad.addColorStop(0, colorTop);
    grad.addColorStop(1, colorBottom);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function loop() {
    if (!isVisible) {
      animId = null;
      return;
    }

    time += 0.022;
    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;

    ctx.clearRect(0, 0, width, height);

    // Deep water wave
    drawWave(
      height * 0.58,
      20,
      0.0024,
      0.85,
      "rgba(14, 74, 91, 0.48)",
      "rgba(4, 32, 42, 0.85)",
      0.035
    );

    // Vibrant aqua wave
    drawWave(
      height * 0.68,
      25,
      0.0034,
      1.2,
      "rgba(27, 127, 151, 0.38)",
      "rgba(7, 48, 61, 0.9)",
      -0.05
    );

    // Foreground cyan wave with light caustic shimmer
    drawWave(
      height * 0.78,
      18,
      0.0048,
      1.6,
      "rgba(41, 168, 196, 0.32)",
      "rgba(4, 32, 42, 0.95)",
      0.075
    );

    // Movable ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.radius += rip.growth;
      rip.alpha *= 0.955;

      if (rip.alpha < 0.015 || rip.radius > rip.maxRadius) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(124, 211, 228, ${rip.alpha * 0.75})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(rip.x, rip.y, Math.max(0, rip.radius - 8), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(41, 168, 196, ${rip.alpha * 0.4})`;
      ctx.lineWidth = 3.2;
      ctx.stroke();
      ctx.restore();
    }

    // Floating water motes & particles
    for (let p of particles) {
      p.y -= p.speedY;
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * 0.4;

      const pdx = p.x - mouse.x;
      const pdy = p.y - mouse.y;
      const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pDist < 130) {
        const force = (1 - pDist / 130) * 1.6;
        p.x += (pdx / pDist) * force;
        p.y += (pdy / pDist) * force;
      }

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(184, 232, 241, ${p.opacity * (0.6 + Math.sin(time + p.wobble) * 0.4)})`;
      ctx.shadowColor = "rgba(124, 211, 228, 0.85)";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }

    animId = requestAnimationFrame(loop);
  }

  loop();
}
