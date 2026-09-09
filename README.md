# Aqua Nirmal — Water Delivery Website
*(Aqua Nirmal Quality Khane Pani (Pra.) Limited)*

A 5-page static website for a water purification / jar delivery business.
No build step, no dependencies — pure HTML, CSS and JS.

## Run it
1. Unzip the folder.
2. Open the folder in VS Code.
3. Install the **Live Server** extension (if you don't have it), right-click
   `index.html` → **Open with Live Server**.
   (Or just double-click `index.html` to open it in a browser — everything
   except the Google Maps embed on the Contact page will still work.)

## Pages
- `index.html` — Home: 3D hero, company dashboard panel, how-it-works, plant photo gallery, product panel, area checker, testimonials
- `products.html` — The 20L jar, bulk rate table, deposit policy, corporate/bulk enquiry form
- `order.html` — Order form (20L jars, minimum 5) + "Send order via WhatsApp" button
- `about.html` — Purification process, certifications/quality section, plant photo
- `contact.html` — Contact details, map, contact form

## Already set up with your real details
- WhatsApp / phone: **+977 9700150416**
- Email: **aquanirmal5@gmail.com**
- Name: **Aqua Nirmal Quality Khane Pani (Pra.) Limited**
- Registration: **11541/074**, Gokarneshwor Municipality, Ward 8, Kathmandu
- Photos: real plant/product photos from your uploads, cropped (watermark
  removed) and colour/contrast-corrected — see `assets/photos/`. The two
  jar-stack shots now carry the product panels on the homepage and the
  products page.

## What we sell — one product
The site supplies a **single format: the 20L returnable jar**. The 1L bottle
and 5L can were removed, along with the weekly/monthly subscription plans —
every order is a one-time order placed over WhatsApp.

**Orders have a 5-jar minimum.** It's enforced in `js/main.js` (`MIN_JARS`)
and stated on the order form, the products page and the homepage. Change
`MIN_JARS` and those three copy references together if the minimum moves.

## Amounts are deliberately not shown on the order form
Because the per-jar rate is negotiated by quantity, the order form shows
**no prices and no estimated total** — the summary lists jar size, quantity,
delivery slot and payment method only, and the WhatsApp message asks your
team to confirm the rate. Indicative bulk rates still live on
`products.html` where they belong.

## Bulk pricing — confirm these numbers
The 20L rate is a negotiable, quantity-based tier, as you described it
("negotiable, bigger quantity, Rs 30–50/jar"):

| Quantity | Rate/jar |
|---|---|
| 5–9 jars | Rs 70 |
| 10–29 jars | Rs 50 |
| 30–49 jars | Rs 40 |
| 50+ jars | Rs 30 |

**These exact breakpoints are my best guess at a sensible curve landing
inside your Rs 30–50 range — not numbers you gave me.** They're displayed
in `products.html` only; edit them there before you publish.

## The homepage dashboard — set your real numbers
The panel under the hero is branded with the company name and shows three
figures. Two are derived from real config and stay correct on their own:

- **Purification stages (7)** — matches the process listed on `about.html`
- **Service areas** — the count and the chips are both generated from
  `BUSINESS.serviceAreas` in `js/main.js`, so they can never disagree

**"Jars delivered today" is a placeholder and is shown to customers as your
delivery figure.** It lives in `BUSINESS.dashboard` in `js/main.js`:

```js
dashboard: {
  jarsToday: 128,                             // today's figure
  last7Days: [64, 92, 71, 118, 99, 143, 128], // the little bar chart
}
```

Nothing measures this automatically — there is no backend. Put your real
numbers there, or delete that tile from `index.html`, before you publish.
The "updated HH:MM" clock in the panel header is a genuine live clock.

## Other things to personalize
- `serviceAreas` in `js/main.js` (`BUSINESS` object) — replace the sample
  tole/area list with your real delivery coverage; it's used by the
  homepage "check your area" widget
- Deposit amount on `products.html` (currently placeholder Rs 300)
- Certification numbers on `about.html` (`#certs` section) — the
  Gokarneshwor Municipality registration (11541/074) is real; the
  DFTQC/NBSM certificate numbers are placeholders until you add yours
- The Google Maps embed URL in `contact.html` (`.map-embed iframe`) is
  currently a generic "Gokarneshwor, Kathmandu" search — replace with
  your exact pinned location for accuracy

## How the order flow works right now
The order form does **not** call a backend — it builds a WhatsApp message
from the form fields (name, phone, address, quantity, slot) and opens
`wa.me` with it pre-filled, so orders land directly in your business
WhatsApp, where you confirm the rate. This is intentional: it needs zero
server setup and works for a door-to-door delivery business immediately.

To move to a real backend later (database, admin dashboard, delivery
tracking, online payment), you'd replace the `submit` handler in
`initOrderForm()` inside `js/main.js` with a `fetch()` call to your API.

## Structure
```
aquasource/
├── index.html
├── products.html
├── order.html
├── about.html
├── contact.html
├── css/style.css
├── js/main.js
├── assets/            (logo, contour-line SVG illustrations, assets/photos/ = your enhanced real photos)
└── README.md
```

## Design notes
The visual identity is built around the contour line — the same lines
used to map an aquifer or watershed — instead of generic wave/droplet
clichés, tying the graphics back to "water traced to its source."

**Palette — all aqua.** Deep ocean darks (`--abyss`, `--deep`, `--teal`),
an aqua ramp for accents and CTAs (`--aqua`, `--aqua-bright`,
`--aqua-light`, `--aqua-pale`) and a pale foam page ground (`--foam`,
`--mist`). Every token is defined once at the top of `css/style.css`; the
logo and contour SVGs in `assets/` were retinted to match. Headings use
Fraunces (serif), body/UI uses Inter.

## The 3D jars
The jars on the homepage, in the dashboard and on the order form are real
CSS 3D — no images, no libraries, no build step. `initJars3D()` in
`js/main.js` builds each one:

- The **body** is a true cylinder: 28 flat panels ("staves") fanned around
  the Y axis with `rotateY(...) translateZ(radius)`, inside a
  `transform-style: preserve-3d` group that spins continuously. The panel
  count, radius and taper live in `JAR_BODY`.
- The **water** is a child of each stave. Its height animates with a phase
  offset per panel, so the surface travels around the jar as one wave
  rather than every panel pulsing together.
- The **cap, neck and shoulder** are surfaces of revolution — they look
  identical at every angle — so they are shaded static geometry rather than
  spinning panels, which is both cheaper and free of the overlap artefacts
  that spinning translucent panels produce. The shoulder taper is a
  `clip-path` trapezoid.
- **Lighting does not spin.** The shading and specular highlights sit in
  their own layer over the top, so the glass keeps a fixed highlight while
  the jar turns underneath — the way real glass behaves.
- **Droplets and bubbles** sit at different `translateZ` depths, so they
  separate from the jar as the scene tilts.

A soft ellipse at the base (`.jar3d-foot`) gives the cylinder a rounded
bottom edge — the base disc is edge-on at this viewing angle, so without it
the jar reads as cut off flat.

Sizing is a single custom property: `--jar-scale` on `.jar3d`. Jars appear
in the homepage hero and dashboard, on the order form, and standing in the
empty half of the hero band on the products, about and contact pages
(`.page-hero-jar`, hidden below 900px where there is no room).

## Motion
All of it is switched off by `prefers-reduced-motion: reduce`, and the
scroll reveal is gated behind a `js` class on `<html>` so content is never
hidden if JavaScript fails to load.

- Sections and cards rise into view on scroll (IntersectionObserver in
  `initMotion()`), with a scroll sweep as a safety net so a jump — an
  anchor link, or the browser restoring a scroll position — can't leave a
  block stuck invisible
- `[data-tilt]` elements rotate toward the cursor in real 3D, and their
  `[data-depth]` children lift out of the plane: the hero's photo, glow and
  jar separate into three layers as you move the mouse. Pointer devices
  only, so it never interferes with touch
- The header frosts and lifts once you leave the top; nav underlines wipe in
- Hero and page heroes carry a slow aqua light drift; buttons sweep a
  highlight; cards lift with their photos scaling
- Dashboard figures count up when the panel scrolls into view

On narrow screens the hero stacks: the plant photo spans the full width and
the jar stands centred in front of it, rather than the two being squeezed
side by side.
