// AVENOR — Collections, PDP and Cart Drawer 2026-10-29
// Uses AVENOR_PRODUCTS central catalog. No duplicates. No fake pages.
// Fashion is fully populated (29 items = 10 NA-fashion + 19 fash-*). Sneakers/Beauty render from catalog placeholders until their drops arrive.
(function(){
  const $ = (s, r=document)=> r.querySelector(s);
  const $$ = (s, r=document)=> [...r.querySelectorAll(s)];

  // ---- Helpers ----
  function money(n){ return "$"+n.toFixed(2); }
  function get(id){ return (typeof AVENOR_getProduct==="function" ? AVENOR_getProduct(id) : AVENOR_PRODUCTS.find(p=>p.id===id)) || null; }
  function byCol(col){ return AVENOR_PRODUCTS.filter(p=>p.collection===col); }

  // Size options inferred (demo only)
  function sizesFor(p){
    if(p.collection==="sneakers") return ["US 7","US 8","US 9","US 10","US 11","US 12"];
    if(p.category && /trouser|culotte|palazzo|tailoring/i.test(p.category)) return ["XS","S","M","L","XL"];
    if(p.collection==="fashion") return ["XS","S","M","L","XL"];
    return [];
  }

  // ---- Card template (reuses na-card styling) ----
  function cardHTML(p){
    const isFashNew = p.collection==="fashion" && !p.isNewArrival ? "Collection" : (p.isNewArrival ? "New" : "Collection");
    return `
      <article class="na-card" data-open="${p.id}" tabindex="0" aria-label="${p.name} — ${money(p.price)}">
        <div class="na-media">
          <span class="na-badge">${isFashNew}</span>
          <button class="na-wishlist" aria-label="Save ${p.name} to wishlist" aria-pressed="false" data-wish="${p.id}" data-wish-label="${p.name.replace(/"/g,'&quot;')}" onclick="event.stopPropagation()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21C12 21 4 13.5 4 8.5a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 5-8 12.5-8 12.5Z"/></svg>
          </button>
          <img src="${p.image}" alt="${p.name} — ${p.category}" loading="lazy" width="600" height="600">
        </div>
        <div class="na-body">
          <p class="na-cat">${p.category}</p>
          <h3 class="na-name">${p.name}</h3>
          <p class="na-desc">${p.desc}</p>
          <div class="na-row">
            <span class="na-price">${money(p.price)} <small>USD · Demo</small></span>
            <button class="na-add" data-add="${p.id}" onclick="event.stopPropagation()">Add <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg></button>
          </div>
        </div>
      </article>`;
  }

  function renderGrid(gridEl, items){
    if(!gridEl) return;
    if(!items.length){
      gridEl.innerHTML = `<div class="collection-empty"><p class="ce-title">Collection arriving shortly</p><p class="ce-copy">This collection is reserved for your supplied images only. No placeholder products have been added. Share the next drop and it will appear here, locked to its image.</p></div>`;
      const meta = gridEl.closest(".collection-section")?.querySelector(".col-count");
      if(meta) meta.textContent = "0 pieces · Awaiting drop";
      return;
    }
    gridEl.innerHTML = items.map(cardHTML).join("");
    if (window.AVENOR_wishlist && window.AVENOR_wishlist.sync) window.AVENOR_wishlist.sync();
    const meta = gridEl.closest(".collection-section")?.querySelector(".col-count");
    if(meta) meta.textContent = items.length + (items.length===1 ? " piece" : " pieces") + " · Editorial grid";
  }

  function renderAll(){
    if(typeof AVENOR_PRODUCTS==="undefined") return;
    renderGrid($("#fashionGrid"), byCol("fashion"));
    renderGrid($("#sneakersGrid"), byCol("sneakers"));
    renderGrid($("#beautyGrid"), byCol("beauty"));
  }

  // ---- PDP ----
  const pdp = $("#pdpOverlay");
  const pdpImg = $("#pdpImg");
  const pdpCat = $("#pdpCat");
  const pdpName = $("#pdpName");
  const pdpDesc = $("#pdpDesc");
  const pdpPrice = $("#pdpPrice");
  const pdpSizes = $("#pdpSizes");
  const pdpQty = $("#pdpQty");
  const pdpAdd = $("#pdpAdd");
  const pdpClose = $("#pdpClose");
  let pdpProduct = null;
  let pdpSize = "";
  let pdpQuantity = 1;

  function openPDP(id){
    const p = get(id);
    if(!p || !pdp) return;
    pdpProduct = p;
    pdpSize = "";
    pdpQuantity = 1;
    if(pdpImg){ pdpImg.src = p.image; pdpImg.alt = p.name + " — " + p.category; }
    if(pdpCat) pdpCat.textContent = p.category;
    if(pdpName) pdpName.textContent = p.name;
    if(pdpDesc) pdpDesc.textContent = p.desc;
    if(pdpPrice) pdpPrice.innerHTML = money(p.price) + ' <small>USD · Demo</small>';
    if(pdpQty) pdpQty.textContent = "1";
    if(pdpSizes){
      const opts = sizesFor(p);
      if(opts.length){
        pdpSizes.hidden = false;
        pdpSizes.innerHTML = `<span class="pdp-sizes-label">Size</span>` + opts.map(s=>`<button class="pdp-size" data-size="${s}">${s}</button>`).join("");
      } else {
        pdpSizes.hidden = true;
        pdpSizes.innerHTML = "";
      }
    }
    if(pdpAdd) pdpAdd.textContent = "Add to cart — " + money(p.price);
    if(window.AVENOR_wishlist && window.AVENOR_wishlist.setPDP) window.AVENOR_wishlist.setPDP(id);
    pdp.classList.add("is-open");
    pdp.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
    pdpClose?.focus();
    try{ history.replaceState(null,"", "#pdp-"+id); }catch(_){}
  }
  function closePDP(){
    if(!pdp) return;
    pdp.classList.remove("is-open");
    pdp.setAttribute("aria-hidden","true");
    var wl = document.getElementById("wishlistDrawer");
    var se = document.getElementById("searchOverlay");
    var anyOpen = (wl && wl.classList.contains("is-open")) || (se && se.classList.contains("is-open")) || (cartDrawer && cartDrawer.classList.contains("is-open"));
    if(!anyOpen) document.body.style.overflow = "";
    pdpProduct = null;
    if(location.hash.startsWith("#pdp-")){
      try{ history.replaceState(null,"", location.pathname + location.search); }catch(_){}
    }
  }

  // ---- Cart ----
  const CART_KEY = "avenor-cart-v1";
  let cart = [];
  try{ cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }catch(_){ cart=[]; }
  function saveCart(){ try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch(_){} updateCartUI(); }
  function cartCount(){ return cart.reduce((s,i)=> s + i.qty, 0); }
  function cartSubtotal(){ return cart.reduce((s,i)=>{ const pr = get(i.id); return s + (pr ? pr.price * i.qty : 0); }, 0); }

  function addToCart(id, qty, size){
    qty = Math.max(1, qty|0);
    const key = size ? id+"::"+size : id;
    const existing = cart.find(c=> (c._key||c.id)===key);
    if(existing) existing.qty += qty;
    else cart.push({ id, qty, size: size||"", _key: key });
    saveCart();
    openCart();
  }

  const cartDrawer = $("#cartDrawer");
  const cartItemsEl = $("#cartItems");
  const cartCountEl = $(".cart-count");
  const cartSubEl = $("#cartSubtotal");
  const cartCheckout = $("#cartCheckout");

  function updateCartUI(){
    const n = cartCount();
    if(cartCountEl) cartCountEl.textContent = String(n);
    const btn = $(".cart-btn");
    if(btn) btn.setAttribute("aria-label", "Cart, "+n+" items");
    if(cartSubEl) cartSubEl.textContent = money(cartSubtotal());
    if(!cartItemsEl) return;
    if(!cart.length){
      cartItemsEl.innerHTML = `<div class="cart-empty"><p>Your cart is empty.</p><p class="cart-empty-note">Add products from New Arrivals or the Fashion collection. Demo only — no real payment is processed.</p><a href="#collection-fashion" class="cart-empty-cta" data-close-cart>Explore Fashion</a></div>`;
      return;
    }
    cartItemsEl.innerHTML = cart.map((c,idx)=>{
      const p = get(c.id);
      if(!p) return "";
      const line = p.price * c.qty;
      return `<div class="cart-item" data-idx="${idx}">
        <img src="${p.image}" alt="" width="72" height="72">
        <div class="cart-item-body">
          <p class="cart-item-cat">${p.category}${c.size ? " · " + c.size : ""}</p>
          <p class="cart-item-name">${p.name}</p>
          <p class="cart-item-price">${money(p.price)} <small>× ${c.qty}</small> <strong>${money(line)}</strong></p>
          <div class="cart-item-actions">
            <button class="qty-btn" data-dec="${idx}" aria-label="Decrease quantity">−</button>
            <span class="qty-val">${c.qty}</span>
            <button class="qty-btn" data-inc="${idx}" aria-label="Increase quantity">+</button>
            <button class="cart-remove" data-remove="${idx}">Remove</button>
          </div>
        </div>
      </div>`;
    }).join("");
  }

  function openCart(){
    if(!cartDrawer) return;
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }
  function closeCart(){
    if(!cartDrawer) return;
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden","true");
    // only clear overflow if PDP not open
    if(!pdp || !pdp.classList.contains("is-open")) document.body.style.overflow = "";
  }

  // ---- Delegation ----
  document.addEventListener("click", (e)=>{
    const openCard = e.target.closest("[data-open]");
    if(openCard && !e.target.closest("[data-add],[data-wish]")){
      // Close search overlay if a search result card was clicked, then open PDP
      var searchOverlay = document.getElementById("searchOverlay");
      if(searchOverlay && searchOverlay.classList.contains("is-open")){
        searchOverlay.classList.remove("is-open");
        searchOverlay.setAttribute("aria-hidden","true");
      }
      e.preventDefault();
      openPDP(openCard.getAttribute("data-open"));
      return;
    }
    const addBtn = e.target.closest("[data-add]");
    if(addBtn){
      e.preventDefault();
      const id = addBtn.getAttribute("data-add");
      // feedback
      const orig = addBtn.innerHTML;
      addToCart(id, 1, "");
      addBtn.textContent = "Added ✓";
      addBtn.disabled = true;
      setTimeout(()=>{ addBtn.innerHTML = orig; addBtn.disabled=false; }, 1100);
      return;
    }
    // [data-wish] toggles are handled centrally in wishlist.js (persistent + synced); do not toggle here
    if(e.target.closest("[data-wish]")){
      return;
    }
    // PDP sizes
    const sizeBtn = e.target.closest("[data-size]");
    if(sizeBtn && pdpSizes && pdpSizes.contains(sizeBtn)){
      pdpSize = sizeBtn.getAttribute("data-size");
      $$(".pdp-size", pdpSizes).forEach(b=> b.classList.toggle("is-selected", b===sizeBtn));
      return;
    }
    // PDP qty
    if(e.target.closest("#pdpMinus")){
      pdpQuantity = Math.max(1, pdpQuantity-1);
      if(pdpQty) pdpQty.textContent = String(pdpQuantity);
      return;
    }
    if(e.target.closest("#pdpPlus")){
      pdpQuantity = pdpQuantity+1;
      if(pdpQty) pdpQty.textContent = String(pdpQuantity);
      return;
    }
    if(e.target.closest("#pdpAdd") && pdpProduct){
      if(sizesFor(pdpProduct).length && !pdpSize){
        // nudge
        pdpSizes?.classList.add("is-needed");
        setTimeout(()=> pdpSizes?.classList.remove("is-needed"), 900);
        return;
      }
      addToCart(pdpProduct.id, pdpQuantity, pdpSize);
      closePDP();
      return;
    }
    if(e.target.closest("#pdpClose") || (pdp && e.target===pdp) || e.target.closest("[data-close-pdp]")){
      closePDP();
      return;
    }
    // Cart
    if(e.target.closest(".cart-btn")){
      e.preventDefault();
      openCart();
      return;
    }
    if(e.target.closest("[data-close-cart]") || (cartDrawer && e.target===cartDrawer)){
      closeCart();
      return;
    }
    if(e.target.closest("#cartClose")){ closeCart(); return; }
    const dec = e.target.closest("[data-dec]");
    if(dec){
      const idx = parseInt(dec.getAttribute("data-dec"),10);
      if(cart[idx]){ cart[idx].qty = Math.max(1, cart[idx].qty-1); saveCart(); }
      return;
    }
    const inc = e.target.closest("[data-inc]");
    if(inc){
      const idx = parseInt(inc.getAttribute("data-inc"),10);
      if(cart[idx]){ cart[idx].qty += 1; saveCart(); }
      return;
    }
    const rem = e.target.closest("[data-remove]");
    if(rem){
      const idx = parseInt(rem.getAttribute("data-remove"),10);
      cart.splice(idx,1); saveCart(); return;
    }
    // Checkout — open the premium checkout overlay (demo, no payment)
    if(e.target.closest("#cartCheckout")){
      e.preventDefault();
      const n = cartCount();
      if(!n) return;
      if (window.AVENOR_checkout && typeof window.AVENOR_checkout.open === "function"){
        window.AVENOR_checkout.open();
      } else {
        cartCheckout.textContent = "Demo — no charge ✓";
        setTimeout(()=>{ cartCheckout.textContent = "Checkout — Demo only"; }, 1600);
      }
      return;
    }
    // Collection anchor clicks use transition
    const collA = e.target.closest('a[href^="#collection-"]');
    if(collA){
      const hash = collA.getAttribute("href");
      if(document.querySelector(hash)){
        e.preventDefault();
        const run = ()=>{
          const t = document.querySelector(hash);
          const top = t.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
          try{ history.pushState(null,"", hash); }catch(_){}
        };
        if(typeof window.AVENOR_transition==="function") window.AVENOR_transition(hash, run);
        else run();
      }
    }
  });

  // Keyboard
  document.addEventListener("keydown", (e)=>{
    if(e.key==="Escape"){
      if(pdp && pdp.classList.contains("is-open")) closePDP();
      else if(cartDrawer && cartDrawer.classList.contains("is-open")) closeCart();
    }
  });

  // Handle direct #pdp- deep link
  function handleHash(){
    const h = location.hash;
    if(h.startsWith("#pdp-")){
      const id = h.slice(5);
      if(get(id)) openPDP(id);
    }
  }

  // Render on ready
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", ()=>{ renderAll(); updateCartUI(); handleHash(); });
  else { renderAll(); updateCartUI(); handleHash(); }

  window.addEventListener("hashchange", handleHash);

  function clearCart(){
    cart.length = 0;
    saveCart();
  }
  function refreshCart(){
    // re-read from storage (in case checkout cleared it) then re-render
    try{
      var raw = localStorage.getItem(CART_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)){ cart.length = 0; arr.forEach(function(x){ cart.push(x); }); }
    }catch(_){}
    updateCartUI();
  }

  // Expose for debugging + checkout
  window.AVENOR_openPDP = openPDP;
  window.AVENOR_cart = {
    get cart(){return cart;},
    add: addToCart,
    clear: clearCart,
    refresh: refreshCart,
    count: cartCount,
    subtotal: cartSubtotal
  };

})();
