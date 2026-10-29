# AVENOR — The Modern Atelier

**Premium editorial demo commerce · Static · Image-accurate · No fulfillment**

> A curated universe of fashion, footwear, beauty and accessories — edited for those who dress with intention. AVENOR is a frontend portfolio demonstration: every product is locked to its photograph, every collection shares one catalog, and no real payment is processed.

**Live demo:** *Add your deployed URL here after GitHub Pages / Netlify / Vercel is connected.*

---

## Demo Notice

This is a **frontend demonstration**, not a real store.

- All products, prices (USD), copy and checkout are illustrative.
- No payment gateway, no backend, no order fulfillment.
- Cart and wishlist persist locally via `localStorage` only.
- Delivery is complimentary in the demo — no shipping rules are invented.

---

## Features

- **Editorial landing** — split hero with portrait, wordmark and a 7-product manual showcase (`assets/hero/`).
- **New Arrivals** — 20 just-dropped pieces in a responsive editorial grid.
- **Shop by Category** — 3 banners (Fashion / Sneakers & Footwear / Beauty & Care) that navigate to dedicated collection pages and filter New Arrivals via a chip bar.
- **The AVENOR Showcase** (formerly *The Edit*) — luxury editorial section with 3 chapters reusing banner imagery and 6 curated products (2 per chapter) from the central catalog. Not a product grid.
- **Collections** — Fashion (24), Sneakers & Footwear (18), Beauty & Care (57) — all rendered from one catalog, one product detail view.
- **Product Detail (PDP)** — single overlay `#pdpOverlay` with image, category, name, description, price, size pills where applicable, quantity controls, Add to Cart and Save to wishlist.
- **Search** — client-side token-contains across name + category + description, reuses product cards, handles empty and no-results states, opens the correct PDP. Works on desktop and mobile.
- **Favorites / Wishlist** — heart buttons on every card and PDP, header badge, drawer `#wishlistDrawer` with View / Remove, `localStorage` key `avenor-wishlist-v1`, synced everywhere via `MutationObserver`.
- **Cart** — drawer `#cartDrawer`, composite key `id::size`, quantity steppers, subtotal, `localStorage` key `avenor-cart-v1`.
- **Demo Checkout** — premium overlay `#checkoutOverlay` with order summary (image, name, size, qty, unit price, line total), accurate subtotal, complimentary delivery, customer fields with required + email validation, demo order reference (`AV-YYYYMMDD-XXXX`) and confirmation. Cart is cleared only after confirmation. No card details requested.
- **Navigation** — sticky header `Home → Showcase → New In → Categories → Info` with signature `AVENOR_transition` overlay, wordmark returns to `#hero`, Search / Wishlist / Cart in header, editorial mobile drawer with collections shortcuts.
- **Footer** — premium editorial footer with Atelier / Collections / Assistance columns, personal contact block and palette mark.

---

## Tech Stack

- **Static site** — no framework, no build step, no bundler, no `package.json`.
- **HTML** — single `index.html` with semantic sections and ARIA overlays (`role="dialog"`, `aria-modal`, `aria-live`).
- **CSS** — `css/style.css` (~72KB) with custom properties: Mocha `#6F4E37` · Platinum `#E5E4E2` · Lavender `#E6E0F0`, plus cream / off-white / espresso. Typography: Cormorant Garamond, Instrument Sans, Newsreader (via Google Fonts). Responsive breakpoints at 1080/1100, 980, 820, 760, 720, 680, 480/380 with `prefers-reduced-motion` guards.
- **JavaScript** — 10 classic scripts (no modules, no imports):
  `catalog.js` → `wishlist.js` → `search.js` → `app.js` → `new-arrivals.js` → `shop-by-category.js` → `collections.js` → `avenor-edit.js` → `checkout.js` → `mobile-nav.js`
- **State** — `localStorage` (`avenor-cart-v1`, `avenor-wishlist-v1`); single source of truth `AVENOR_PRODUCTS` (99 locked pairs) in `js/catalog.js`.

---

## Project Structure

```
avenor/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── catalog.js            # 99 locked image-to-words pairs — single source of truth
│   ├── wishlist.js           # Favorites — avenor-wishlist-v1
│   ├── search.js             # Token search overlay
│   ├── app.js                # Hero showcase (7) + header scroll
│   ├── new-arrivals.js       # 20 grid + AVENOR_transition
│   ├── shop-by-category.js   # 3 banners + chip filtering
│   ├── collections.js        # Fashion/Sneakers/Beauty grids + PDP + cart drawer
│   ├── avenor-edit.js        # The AVENOR Showcase — 6 curated products
│   ├── checkout.js           # Atelier checkout + demo confirmation
│   └── mobile-nav.js         # Editorial mobile drawer
└── assets/
    ├── logo.png
    ├── portrait.png
    ├── banners/              # fashion.jpg · sneakers.jpg · beauty.jpg
    ├── hero/                 # 01–07 hero images
    ├── new-arrivals/         # 01–20
    └── collections/
        ├── fashion/          # 01–19
        ├── sneakers/         # 01–12
        └── beauty/           # 01–48
```

---

## Central Catalog — Image-Locked Rule

Every image path is permanently tied to its name, category, price and description. Swaps exchange words only — `id` and `image`/`images` never change — so PDP, cart and wishlist references remain stable.

```js
// js/catalog.js
const AVENOR_PRODUCTS = [
  { id: "na-07-zara-loafer", collection: "sneakers", isNewArrival: true,
    image: "assets/new-arrivals/07.jpg", name: "…", category: "…", price: 132.00, desc: "…" },
  // … 99 total: 20 New Arrivals + 19 Fashion + 12 Sneakers + 48 Beauty
];
const NEW_ARRIVALS = AVENOR_PRODUCTS.filter(p => p.isNewArrival);
function AVENOR_getProduct(id){ return AVENOR_PRODUCTS.find(p => p.id === id) || null; }
function AVENOR_byCollection(col){ return AVENOR_PRODUCTS.filter(p => p.collection === col); }
```

---

## Getting Started

No install, no build.

**Option A — open directly:**

1. Open `avenor/index.html` in a modern browser.

**Option B — local server (recommended for accurate routing):**

```bash
# from the repo root
npx serve avenor
# or
python -m http.server --directory avenor 8000
```

Then visit `http://localhost:3000` or `http://localhost:8000`.

Hard-refresh (Ctrl/Cmd + Shift + R) after editing `index.html` — the page sets `no-cache` headers during development.

---

## Deployment

Static hosting only. No environment variables.

- **GitHub Pages:** Publish directory `avenor/` (or move `avenor/index.html` to repo root if your Pages source expects root). No build command.
- **Netlify / Vercel:** Set publish directory to `avenor`, build command empty.

---

## Configuration

None. The app is pure frontend. To reset demo state, clear site data for `avenor-cart-v1` and `avenor-wishlist-v1` in browser storage.

---

## Contact — Atelier Owner

Personal links from the footer bottom information area:

- **WhatsApp:** +234 816 696 6893 — https://wa.me/2348166966893 (opens direct chat)
- **Email:** johnolatunji772@gmail.com — mailto:johnolatunji772@gmail.com (opens default mail app)
- **X (Twitter):** @Cool_joohn — https://x.com/Cool_joohn (opens in a new tab, `rel="noopener noreferrer"`)

No additional business accounts, addresses or phone numbers are part of this demo.

---

## Credits

- Design & build — John Ayodele (AVENOR — The Modern Atelier).
- Imagery — supplied assets in `assets/` (banners, hero, new-arrivals, collections, portrait, logo).
- Type — Cormorant Garamond, Instrument Sans, Newsreader via Google Fonts.

---

## License

Choose a license for the repository (MIT is common for portfolio demos) and add a `LICENSE` file. Until then, all rights reserved — demonstration project.

---

*© 2026 AVENOR — Demonstration experience. No real transactions processed. No payment collected.*
