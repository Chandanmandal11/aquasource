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
- `index.html` — Home: hero (real plant photo), how-it-works, plant photo gallery, product panel, area checker, testimonials
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
Palette: limestone off-white, deep slate teal, muted aqua, and a mineral
amber accent. Headings use Fraunces (serif), body/UI uses Inter.

**Motion.** Sections and cards fade and rise into view as you scroll
(IntersectionObserver in `initMotion()`), the header frosts and lifts once
you leave the top, the hero carries a slow aqua light drift plus a
one-pass sheen across the photo, buttons sweep a highlight on hover, and
the order form's jar glyph has a continuously rippling water line. All of
it is switched off by `prefers-reduced-motion: reduce`, and the reveal
animation is gated behind a `js` class on `<html>` so content is never
hidden if JavaScript fails to load.
