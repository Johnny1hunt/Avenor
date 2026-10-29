// AVENOR — Wishlist / Favorites — localStorage, single ID per product, synced everywhere
// Key: avenor-wishlist-v1 stores string[] of product ids (from AVENOR_PRODUCTS)
// No backend, no auth. Persists across refreshes. Heart state consistent in New Arrivals, collections, PDP, hero.
(function(){
  var KEY = "avenor-wishlist-v1";
  var wishlist = [];
  try {
    var raw = localStorage.getItem(KEY);
    wishlist = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(wishlist)) wishlist = [];
  } catch(_) { wishlist = []; }

  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(wishlist)); } catch(_){}
    syncDOM();
    renderDrawer();
    updateBadge();
  }
  function has(id){ return wishlist.indexOf(id) !== -1; }
  function toggle(id){
    if (!id) return false;
    var i = wishlist.indexOf(id);
    var added = false;
    if (i === -1){ wishlist.push(id); added = true; }
    else { wishlist.splice(i,1); added = false; }
    save();
    return added;
  }
  function getAll(){ return wishlist.slice(); }

  function updateBadge(){
    var btn = document.getElementById("wishlistBtn");
    var countEl = document.querySelector(".wishlist-count");
    var n = wishlist.length;
    if (countEl) countEl.textContent = String(n);
    if (btn){
      btn.setAttribute("aria-label", "Wishlist, " + n + " item" + (n===1?"":"s") );
      btn.classList.toggle("has-items", n > 0);
    }
    var head = document.getElementById("wishlistCountHead");
    if (head) head.textContent = n === 0 ? "0 saved — hearts everywhere stay in sync" : n + " saved — hearts everywhere stay in sync";
  }

  function syncDOM(){
    // All heart buttons with data-wish
    document.querySelectorAll("[data-wish]").forEach(function(btn){
      var id = btn.getAttribute("data-wish");
      var on = has(id);
      btn.classList.toggle("is-saved", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-label", (on ? "Remove " : "Save ") + (btn.getAttribute("data-wish-label") || id || "product") + (on ? " from wishlist" : " to wishlist"));
    });
    // PDP wishlist button
    var pdpWish = document.getElementById("pdpWishlist");
    if (pdpWish && pdpWish.getAttribute("data-pdp-id")){
      var pid = pdpWish.getAttribute("data-pdp-id");
      var on2 = has(pid);
      pdpWish.classList.toggle("is-saved", on2);
      pdpWish.setAttribute("aria-pressed", on2 ? "true" : "false");
      var span = pdpWish.querySelector("span");
      if (span) span.textContent = on2 ? "Saved" : "Save";
    }
  }

  function money(n){ return "$" + n.toFixed(2); }
  function getProduct(id){
    if (typeof AVENOR_getProduct === "function") return AVENOR_getProduct(id);
    if (typeof AVENOR_PRODUCTS !== "undefined") return AVENOR_PRODUCTS.find(function(p){return p.id===id;}) || null;
    return null;
  }

  function renderDrawer(){
    var el = document.getElementById("wishlistItems");
    if (!el) return;
    if (!wishlist.length){
      el.innerHTML = '<div class="wishlist-empty"><p class="we-title">Your wishlist is empty</p><p class="we-copy">Tap the heart on any product — New Arrivals, Fashion, Sneakers or Beauty &amp; Care. The same heart stays filled wherever that product appears. Saved locally on this device.</p><div class="we-hints"><span>Try: lipstick</span><span>Try: Air Force</span><span>Try: satchel</span></div></div>';
      return;
    }
    var html = "";
    wishlist.forEach(function(id, idx){
      var p = getProduct(id);
      if (!p) return;
      html += '<div class="wishlist-item" data-wishlist-row="' + p.id + '">'
        + '<button class="wishlist-item-media" data-wishlist-open="' + p.id + '" aria-label="Open ' + p.name.replace(/"/g,'&quot;') + '">'
        + '<img src="' + p.image + '" alt="" width="96" height="96" loading="lazy">'
        + '</button>'
        + '<div class="wishlist-item-body">'
        + '<p class="wishlist-item-cat">' + p.category + '</p>'
        + '<p class="wishlist-item-name"><button data-wishlist-open="' + p.id + '">' + p.name + '</button></p>'
        + '<p class="wishlist-item-price">' + money(p.price) + ' <small>USD · Demo</small></p>'
        + '<div class="wishlist-item-actions">'
        + '<button class="wishlist-open-btn" data-wishlist-open="' + p.id + '">View details</button>'
        + '<button class="wishlist-remove" data-wishlist-remove="' + p.id + '" aria-label="Remove ' + p.name.replace(/"/g,'&quot;') + ' from wishlist">Remove</button>'
        + '</div>'
        + '</div>'
        + '<button class="wishlist-item-heart is-saved" data-wish="' + p.id + '" data-wish-label="' + p.name.replace(/"/g,'&quot;') + '" aria-label="Remove from wishlist" aria-pressed="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 21C12 21 4 13.5 4 8.5a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 5-8 12.5-8 12.5Z"/></svg></button>'
        + '</div>';
    });
    // if all ids were stale
    if (!html) {
      html = '<div class="wishlist-empty"><p class="we-title">Your wishlist is empty</p><p class="we-copy">Saved items were removed or unavailable.</p></div>';
    }
    el.innerHTML = html;
  }

  // Drawer open/close
  var drawer = document.getElementById("wishlistDrawer");
  function openDrawer(){
    if (!drawer) return;
    renderDrawer();
    syncDOM();
    updateBadge();
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer(){
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden","true");
    var pdp = document.getElementById("pdpOverlay");
    var search = document.getElementById("searchOverlay");
    var cart = document.getElementById("cartDrawer");
    var anyOpen = (pdp && pdp.classList.contains("is-open")) || (search && search.classList.contains("is-open")) || (cart && cart.classList.contains("is-open"));
    if (!anyOpen) document.body.style.overflow = "";
  }

  // PDP wishlist
  function setPDPProduct(id){
    var btn = document.getElementById("pdpWishlist");
    if (!btn) return;
    btn.setAttribute("data-pdp-id", id || "");
    var on = id ? has(id) : false;
    btn.classList.toggle("is-saved", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    var span = btn.querySelector("span");
    if (span) span.textContent = on ? "Saved" : "Save";
    btn.setAttribute("aria-label", (on ? "Remove from" : "Save to") + " wishlist");
  }

  // Delegation: hearts + drawer controls + PDP
  document.addEventListener("click", function(e){
    // Header button
    if (e.target.closest("#wishlistBtn")){
      e.preventDefault();
      if (drawer && drawer.classList.contains("is-open")) closeDrawer();
      else openDrawer();
      return;
    }
    // Heart toggle anywhere
    var wish = e.target.closest("[data-wish]");
    if (wish){
      e.preventDefault();
      e.stopPropagation();
      var id = wish.getAttribute("data-wish");
      // validate id exists
      if (getProduct(id)) toggle(id);
      return;
    }
    // PDP save button
    if (e.target.closest("#pdpWishlist")){
      var pb = e.target.closest("#pdpWishlist");
      var pid = pb.getAttribute("data-pdp-id");
      if (pid && getProduct(pid)) toggle(pid);
      return;
    }
    // Open PDP from wishlist row
    var openFromWish = e.target.closest("[data-wishlist-open]");
    if (openFromWish){
      e.preventDefault();
      var oid = openFromWish.getAttribute("data-wishlist-open");
      closeDrawer();
      // let PDP opener handle it (collections.js exposes window.AVENOR_openPDP)
      setTimeout(function(){
        if (typeof window.AVENOR_openPDP === "function") window.AVENOR_openPDP(oid);
        else {
          // fallback: dispatch click to card
          var card = document.querySelector('[data-open="' + CSS.escape(oid) + '"]');
          if (card) card.click();
        }
      }, 180);
      return;
    }
    var rem = e.target.closest("[data-wishlist-remove]");
    if (rem){
      e.preventDefault();
      var rid = rem.getAttribute("data-wishlist-remove");
      var idx = wishlist.indexOf(rid);
      if (idx !== -1){ wishlist.splice(idx,1); save(); }
      return;
    }
    if (e.target.closest("#wishlistClose") || (drawer && e.target === drawer)) { closeDrawer(); return; }
    if (e.target.closest("[data-close-wishlist]")){
      e.preventDefault();
      closeDrawer();
      var na = document.getElementById("new-arrivals");
      if (na){
        var top = na.getBoundingClientRect().top + window.scrollY - 14;
        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (typeof window.AVENOR_transition === "function") window.AVENOR_transition("#new-arrivals", function(){ window.scrollTo({top:top, behavior: reduced?"auto":"smooth"}); });
        else window.scrollTo({top:top, behavior: reduced?"auto":"smooth"});
      }
      return;
    }
    if (e.target.closest("#wishlistClear")){
      e.preventDefault();
      if (!wishlist.length) return;
      wishlist = [];
      save();
      return;
    }
  });

  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")){
      closeDrawer();
    }
  });

  // Keep sync after other renders (collections/new-arrivals re-render filtering, etc.)
  var observer = new MutationObserver(function(){ syncDOM(); });
  // Observe grids
  function observeGrids(){
    ["naGrid","fashionGrid","sneakersGrid","beautyGrid","searchResults","showcaseStage"].forEach(function(id){
      var el = document.getElementById(id);
      if (el) observer.observe(el, {childList:true, subtree:true});
    });
  }

  function init(){
    updateBadge();
    renderDrawer();
    syncDOM();
    observeGrids();
    // Re-observe after a tick in case grids not yet rendered
    setTimeout(function(){ syncDOM(); observeGrids(); }, 600);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Expose for other modules (PDP, renderers)
  window.AVENOR_wishlist = {
    has: has,
    toggle: toggle,
    getAll: getAll,
    sync: syncDOM,
    open: openDrawer,
    close: closeDrawer,
    setPDP: setPDPProduct,
    KEY: KEY
  };
})();
