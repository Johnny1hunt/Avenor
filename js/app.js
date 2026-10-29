// AVENOR — Hero Showcase — FRESH REBUILD 2026-10-29
// Order EXACTLY as owner supplied: 1=MIXIT, 2=Nike, 3=Bag, 4=Trousers, 5=Lipstick, 6=Blazer, 7=Reef
// Each object is a LOCKED PAIR: image + name + category + desc + price
const HERO_PRODUCTS = [
  { id:"hero-01-mixit", name:"Velvet Rouge — Crimson Lipstick", category:"Beauty · Colour", price:28.99, badge:"Hero · 01", image:"assets/hero/03-mixit-serum.jpg", desc:"High-pigment, soft-matte crimson with a hydrating glide — a single stroke, editorial finish." },
  { id:"hero-02-bag", name:"Blush & Burgundy Top-Handle Handbag — Structured Silhouette", category:"Accessories · Handbags", price:342.00, badge:"Hero · 02", image:"assets/hero/01-nike-air-force.jpg", desc:"Structured top-handle handbag in blush with burgundy handles and flap, polished gold hardware and a refined day-to-evening profile." },
  { id:"hero-03-mixit", name:"MIXIT Energy Serum — Vitamin C 5%", category:"Beauty & Skincare", price:80.05, badge:"Hero · 03", image:"assets/hero/04-dior-handbag.jpg", desc:"A brightening daily serum with stable Vitamin C — light, citrus-fresh, and made for morning rituals" },
  { id:"hero-04-blazer", name:"Atelier Double-Breasted Wool Blazer — Camel", category:"Fashion · Outerwear", price:278.95, badge:"Hero · 04", image:"assets/hero/06-tailored-trousers.jpg", desc:"Sharp shoulders, peak lapels and a clean, long line — the modern power blazer in warm camel." },
  { id:"hero-05-nike", name:"Nike Air Force 1 Mid — Cloud White", category:"Sneakers & Footwear", price:128.00, badge:"Hero · 05", image:"assets/hero/07-lakme-lipstick.jpg", desc:"The icon, elevated. Supple leather, mid-cut poise and the unmistakable Air sole — made to live in." },
  { id:"hero-06-trousers", name:"Tailored Wide-Leg Trousers — Noir", category:"Fashion · Tailoring", price:165.50, badge:"Hero · 06", image:"assets/hero/05-camel-blazer.jpg", desc:"High-waisted, fluid and precise — gold-button detail, pressed crease and a leg-lengthening drape." },
  { id:"hero-07-reef", name:"Reef 33 — Noir Oud Eau de Parfum", category:"Beauty & Fragrance", price:189.50, badge:"Hero · 07", image:"assets/hero/02-reef-perfume.jpg", desc:"Dark rose, golden saffron and aged oud — a long-wearing, evening-forward signature in a faceted bottle." }
];

const ROTATION_MS = 5000;
const stage = document.getElementById("showcaseStage");
const countEl = document.getElementById("showcaseCount");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let current = 0;
let timer = null;

function money(n){ return "$" + n.toFixed(2); }

function renderSlides(){
  stage.innerHTML = HERO_PRODUCTS.map((p,i)=>`
    <article class="slide ${i===current?'is-active':''}" role="group" aria-roledescription="slide" aria-label="${i+1} of ${HERO_PRODUCTS.length}: ${p.name}" data-index="${i}">
      <div class="slide-media">
        <span class="slide-badge">${p.badge}</span>
        <button class="slide-wishlist" aria-label="Save ${p.name} to wishlist" aria-pressed="false" data-wish="${p.id}" data-wish-label="${p.name.replace(/"/g,'&quot;')}" onclick="event.stopPropagation()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21C12 21 4 13.5 4 8.5a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 5-8 12.5-8 12.5Z"/></svg>
        </button>
        <img src="${p.image}" alt="${p.name} — ${p.category}" loading="${i===0?'eager':'lazy'}" width="700" height="700">
      </div>
      <div class="slide-meta">
        <p class="slide-category">${p.category}</p>
        <h3 class="slide-name">${p.name}</h3>
        <p class="slide-desc">${p.desc}</p>
        <div class="slide-price-row">
          <span class="slide-price">${money(p.price)} <small>USD · Demo</small></span>
          <a href="#hero" class="slide-action">View <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg></a>
        </div>
      </div>
    </article>`).join("");
  countEl.textContent = String(current+1).padStart(2,'0') + " / " + String(HERO_PRODUCTS.length).padStart(2,'0');
  if(window.AVENOR_wishlist && window.AVENOR_wishlist.sync) window.AVENOR_wishlist.sync();
}

function goTo(index){
  const n = HERO_PRODUCTS.length;
  current = ((index % n) + n) % n;
  stage.querySelectorAll(".slide").forEach((s,i)=> s.classList.toggle("is-active", i===current));
  countEl.textContent = String(current+1).padStart(2,'0') + " / " + String(n).padStart(2,'0');
}
function next(){ goTo(current+1); }
function prev(){ goTo(current-1); }
function startTimer(){ stopTimer(); if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; timer=setInterval(next, ROTATION_MS); }
function stopTimer(){ if(timer){ clearInterval(timer); timer=null; } }
function resetTimer(){ stopTimer(); startTimer(); }

prevBtn.addEventListener("click", ()=>{ prev(); resetTimer(); });
nextBtn.addEventListener("click", ()=>{ next(); resetTimer(); });
stage.addEventListener("keydown", (e)=>{
  if(e.key==="ArrowLeft"){ e.preventDefault(); prev(); resetTimer(); }
  if(e.key==="ArrowRight"){ e.preventDefault(); next(); resetTimer(); }
});
stage.setAttribute("tabindex","0");
stage.addEventListener("mouseenter", stopTimer);
stage.addEventListener("mouseleave", startTimer);
stage.addEventListener("focusin", stopTimer);
stage.addEventListener("focusout", startTimer);
document.addEventListener("visibilitychange", ()=>{ if(document.hidden) stopTimer(); else startTimer(); });

renderSlides();
startTimer();

const header = document.getElementById("siteHeader");
window.addEventListener("scroll", ()=>{
  const y = window.scrollY;
  header.style.boxShadow = y>8 ? "0 6px 20px rgba(62,42,29,0.08)" : "none";
}, {passive:true});

stage.addEventListener("error", (e)=>{
  if(e.target.tagName==="IMG"){
    e.target.style.background = "linear-gradient(135deg, #F5EFE8, #E6E0F0)";
    e.target.alt += " (image unavailable)";
  }
}, true);
