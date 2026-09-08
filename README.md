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
- `index.html` — Home: hero (real plant photo), how-it-works, plant photo gallery, pricing preview, area checker, testimonials
- `products.html` — Full pricing incl. bulk rate table, deposit policy, corporate/bulk enquiry form
- `order.html` — Order form with live price summary + "Send order via WhatsApp" button
- `about.html` — Purification process, certifications/quality section, plant photo
- `contact.html` — Contact details, map, contact form

## Already set up with your real details
- WhatsApp / phone: **+977 9700150416**
- Email: **aquanirmal5@gmail.com**
- Name: **Aqua Nirmal Quality Khane Pani (Pra.) Limited**
- Registration: **11541/074**, Gokarneshwor Municipality, Ward 8, Kathmandu
- Photos: real plant/product photos from your uploads, cropped (watermark
  removed) and colour/contrast-corrected — see `assets/photos/`. Two extra
  enhanced shots (`jar-stack-1.jpg`, `jar-stack-2.jpg`) aren't placed on any
  page yet, in case you want to swap one in later.

## Bulk pricing — confirm these numbers
I set the 20L jar rate as a negotiable, quantity-based tier since that's
how you described it ("negotiable, bigger quantity, Rs 30–50/jar"):

| Quantity | Rate/jar |
|---|---|
| 1–9 jars | Rs 70 |
| 10–29 jars | Rs 50 |
| 30–49 jars | Rs 40 |
| 50+ jars | Rs 30 |

**These exact breakpoints are my best guess at a sensible curve landing
inside your Rs 30–50 range — not numbers you gave me.** Edit them in
`js/main.js` (the `JAR_20L_TIERS` array near the top) and update the
matching numbers in `products.html`, `order.html`, and `index.html`
wherever a price is shown, before you publish this site. 5L (Rs 30) and
1L (Rs 15) prices are placeholders too — confirm both.

## Other things to personalize
- `serviceAreas` in `js/main.js` (`BUSINESS` object) — replace the sample
  tole/area list with your real delivery coverage; it's used by the
  homepage "check your area" widget
- Deposit amounts on `products.html` (currently placeholder Rs 300 / Rs 100)
- Certification numbers on `about.html` (`#certs` section) — the
  Gokarneshwor Municipality registration (11541/074) is real; the
  DFTQC/NBSM certificate numbers are placeholders until you add yours
- The Google Maps embed URL in `contact.html` (`.map-embed iframe`) is
  currently a generic "Gokarneshwor, Kathmandu" search — replace with
  your exact pinned location for accuracy

## How the order flow works right now
The order form does **not** call a backend — it builds a WhatsApp message
from the form fields and opens `wa.me` with it pre-filled, so orders land
directly in your business WhatsApp. This is intentional: it needs zero
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
