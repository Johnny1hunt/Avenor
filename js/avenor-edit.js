// AVENOR — The AVENOR Showcase — curated 6-product editorial from the central catalog
// No new products, no duplicate ids. Reuses cardHTML/PDP/wishlist/cart/search.
(function(){
  // 6 curated ids — locked image-to-words, cross-collection
  var CURATED = [
    // Chapter 01 — Tailoring (fashion)
    "fash-03-wrap-blazer",
    "fash-09-burgundy-coat-set",
    // Chapter 02 — Air & Lug (footwear)
    "snk-04-lv-horsebit-platform",
    "snk-09-air-max-dust",
    // Chapter 03 — Ritual (beauty: bag + beauty)
    "bea-26-dior-blush-bag",
    "bea-06-mixit-vitc"
  ];

  function get(id){
    if (typeof AVENOR_getProduct === "function") return AVENOR_getProduct(id);
    if (typeof AVENOR_PRODUCTS !== "undefined") return AVENOR_PRODUCTS.find(function(p){return p.id===id;})||null;
    return null;
  }
  function money(n){ return "$"+n.toFixed(2); }

  function cardHTML(p){
    var badge = p.collection === "fashion" ? "Fashion" : p.collection === "sneakers" ? "Footwear" : "Beauty";
    return '<article class="na-card" data-open="' + p.id + '" tabindex="0" aria-label="' + p.name + ' — ' + money(p.price) + '">'
      + '<div class="na-media">'
      + '<span class="na-badge">' + badge + '</span>'
      + '<button class="na-wishlist" aria-label="Save ' + p.name.replace(/"/g,'&quot;') + ' to wishlist" aria-pressed="false" data-wish="' + p.id + '" data-wish-label="' + p.name.replace(/"/g,'&quot;') + '" onclick="event.stopPropagation()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21C12 21 4 13.5 4 8.5a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 5-8 12.5-8 12.5Z"/></svg></button>'
      + '<img src="' + p.image + '" alt="' + p.name + ' — ' + p.category + '" loading="lazy" width="600" height="600">'
      + '</div>'
      + '<div class="na-body">'
      + '<p class="na-cat">' + p.category + '</p>'
      + '<h3 class="na-name">' + p.name + '</h3>'
      + '<p class="na-desc">' + p.desc + '</p>'
      + '<div class="na-row"><span class="na-price">' + money(p.price) + ' <small>USD · Demo</small></span><button class="na-add" data-add="' + p.id + '" onclick="event.stopPropagation()">Add <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg></button></div>'
      + '</div></article>';
  }

  function render(){
    if (typeof AVENOR_PRODUCTS === "undefined") return;
    var pairs = CURATED.map(get).filter(Boolean);
    // split 2 per chapter
    var ids = {editFashion:0, editSneakers:2, editBeauty:4};
    Object.keys(ids).forEach(function(domId){
      var el = document.getElementById(domId);
      if (!el) return;
      var start = ids[domId];
      var slice = pairs.slice(start, start+2);
      el.innerHTML = slice.map(cardHTML).join("");
    });
    if (window.AVENOR_wishlist && window.AVENOR_wishlist.sync) window.AVENOR_wishlist.sync();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();

  // keep wishlist hearts synced after re-renders
  if (typeof MutationObserver !== "undefined"){
    var obs = new MutationObserver(function(){ if(window.AVENOR_wishlist) window.AVENOR_wishlist.sync(); });
    ["editFashion","editSneakers","editBeauty"].forEach(function(id){
      var el=document.getElementById(id);
      if(el) obs.observe(el,{childList:true, subtree:true});
    });
  }
})();
