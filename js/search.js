// AVENOR — Search — client-side, covers AVENOR_PRODUCTS (Fashion + Sneakers + Beauty)
// Matches name, category, desc (case-insensitive, token-contains). Reuses na-card look.
// Results open the single PDP via window.AVENOR_openPDP. Handles empty & no-results.
(function(){
  var overlay = document.getElementById("searchOverlay");
  var input = document.getElementById("searchInput");
  var resultsEl = document.getElementById("searchResults");
  var metaEl = document.getElementById("searchMeta");
  var clearBtn = document.getElementById("searchClear");

  function getCatalog(){
    if (typeof AVENOR_PRODUCTS !== "undefined" && Array.isArray(AVENOR_PRODUCTS)) return AVENOR_PRODUCTS;
    return [];
  }
  function money(n){ return "$" + n.toFixed(2); }
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  function normalize(q){ return (q||"").trim().toLowerCase(); }

  function searchProducts(query){
    var q = normalize(query);
    if (!q) return null; // null means empty prompt
    var tokens = q.split(/\s+/).filter(Boolean);
    var catalog = getCatalog();
    // score: name exact/contains weighted higher, then category, then desc
    var scored = catalog.map(function(p){
      var hay = (p.name + " " + p.category + " " + p.desc).toLowerCase();
      var name = p.name.toLowerCase();
      var cat = p.category.toLowerCase();
      var desc = p.desc.toLowerCase();
      // must match all tokens somewhere
      for (var t=0; t<tokens.length; t++){
        if (hay.indexOf(tokens[t]) === -1) return null;
      }
      var score = 0;
      tokens.forEach(function(tok){
        if (name.indexOf(tok) !== -1) score += 10;
        if (cat.indexOf(tok) !== -1) score += 6;
        if (desc.indexOf(tok) !== -1) score += 2;
        // bonus for word boundary at start of name
        if (name.indexOf(tok) === 0) score += 3;
      });
      return {product:p, score:score};
    }).filter(Boolean).sort(function(a,b){ return b.score - a.score; });
    return scored.map(function(s){ return s.product; });
  }

  function savedClass(id){
    try { if (window.AVENOR_wishlist && window.AVENOR_wishlist.has(id)) return " is-saved"; } catch(_){}
    return "";
  }

  function resultCardHTML(p){
    var wishCls = savedClass(p.id);
    return '<article class="na-card" data-open="' + esc(p.id) + '" tabindex="0" aria-label="' + esc(p.name) + ' — ' + money(p.price) + '">'
      + '<div class="na-media">'
      + '<span class="na-badge">' + esc(p.category.split("·")[0].trim()) + '</span>'
      + '<button class="na-wishlist' + wishCls + '" aria-label="Save ' + esc(p.name) + '" aria-pressed="' + (wishCls ? "true" : "false") + '" data-wish="' + esc(p.id) + '" data-wish-label="' + esc(p.name) + '" onclick="event.stopPropagation()"><svg width="14" height="14" viewBox="0 0 24 24" fill="' + (wishCls ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.5"><path d="M12 21C12 21 4 13.5 4 8.5a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 5-8 12.5-8 12.5Z"/></svg></button>'
      + '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + ' — ' + esc(p.category) + '" loading="lazy" width="600" height="600">'
      + '</div>'
      + '<div class="na-body">'
      + '<p class="na-cat">' + esc(p.category) + '</p>'
      + '<h3 class="na-name">' + esc(p.name) + '</h3>'
      + '<p class="na-desc">' + esc(p.desc) + '</p>'
      + '<div class="na-row"><span class="na-price">' + money(p.price) + ' <small>USD · Demo</small></span><button class="na-add" data-add="' + esc(p.id) + '" onclick="event.stopPropagation()">Add <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg></button></div>'
      + '</div></article>';
  }

  function renderEmpty(){
    metaEl.textContent = "Search 99 products across Fashion, Sneakers & Beauty — try “lipstick”, “Air Force” or “satchel”";
    if (clearBtn) clearBtn.hidden = true;
    resultsEl.innerHTML = '<div class="search-empty"><p class="se-title">Start typing to search</p><p class="se-copy">Search looks through product names, categories and the honest description on each card. Works on mobile and desktop. Empty searches show this prompt — they don’t flash “no results”.</p><div class="se-chips" role="list">'
      + ['lipstick','Air Force','satchel','platinum','palazzo','oud','Loafer','serum'].map(function(t){return '<button class="se-chip" data-search-example="' + esc(t) + '">' + esc(t) + '</button>';}).join("")
      + '</div></div>';
  }

  function renderNoResults(q){
    metaEl.textContent = 'No results for “' + q.trim() + '” — try another term';
    if (clearBtn) clearBtn.hidden = false;
    resultsEl.innerHTML = '<div class="search-empty search-empty--no-results"><p class="se-title">No matching products</p><p class="se-copy">We searched name, category and description and found no match for “' + esc(q.trim()) + '”. Check spelling or try a broader term like “lipstick”, “Air”, “bag” or “serum”.</p><div class="se-chips">'
      + ['lipstick','bag','sneaker','serum','blazer'].map(function(t){return '<button class="se-chip" data-search-example="' + esc(t) + '">' + esc(t) + '</button>';}).join("")
      + '</div><button class="se-clear" id="seClearInline">Clear search</button></div>';
  }

  function renderResults(list, q){
    var n = list.length;
    metaEl.textContent = n + ' result' + (n===1?'':'s') + ' for “' + q.trim() + '”';
    if (clearBtn) clearBtn.hidden = false;
    if (!n){ renderNoResults(q); return; }
    resultsEl.innerHTML = list.map(resultCardHTML).join("");
    // Sync wishlist hearts if available
    if (window.AVENOR_wishlist && window.AVENOR_wishlist.sync) window.AVENOR_wishlist.sync();
  }

  function onInput(){
    var q = input.value;
    if (clearBtn) clearBtn.hidden = !q.trim();
    if (!normalize(q)){ renderEmpty(); return; }
    var list = searchProducts(q);
    if (list === null) renderEmpty();
    else renderResults(list, q);
  }

  function openSearch(){
    if (!overlay) return;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
    renderEmpty();
    // keep previous query if user reopens
    setTimeout(function(){ input.focus(); input.select(); }, 80);
    // if there was a query, show its results again
    if (input.value.trim()) onInput();
  }
  function closeSearch(){
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden","true");
    var pdp = document.getElementById("pdpOverlay");
    var wishD = document.getElementById("wishlistDrawer");
    var cart = document.getElementById("cartDrawer");
    var anyOpen = (pdp && pdp.classList.contains("is-open")) || (wishD && wishD.classList.contains("is-open")) || (cart && cart.classList.contains("is-open"));
    if (!anyOpen) document.body.style.overflow = "";
  }

  // Events
  var debT = null;
  if (input){
    input.addEventListener("input", function(){
      clearTimeout(debT);
      debT = setTimeout(onInput, 160);
    });
    input.addEventListener("keydown", function(e){
      if (e.key === "Enter"){
        e.preventDefault();
        clearTimeout(debT);
        onInput();
      }
    });
  }
  if (clearBtn){
    clearBtn.addEventListener("click", function(){
      input.value = "";
      renderEmpty();
      input.focus();
    });
  }

  document.addEventListener("click", function(e){
    if (e.target.closest("#searchBtn")){ e.preventDefault(); openSearch(); return; }
    if (e.target.closest("#searchClose") || (overlay && e.target === overlay)) { closeSearch(); return; }
    var ex = e.target.closest("[data-search-example]");
    if (ex){
      var term = ex.getAttribute("data-search-example");
      input.value = term;
      onInput();
      input.focus();
      return;
    }
    var inline = e.target.closest("#seClearInline");
    if (inline){
      input.value = "";
      renderEmpty();
      input.focus();
      return;
    }
  });

  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && overlay && overlay.classList.contains("is-open")){
      e.preventDefault();
      closeSearch();
      var btn = document.getElementById("searchBtn");
      if (btn) btn.focus();
    }
    // "/" to open search when not typing
    if (e.key === "/" && !overlay.classList.contains("is-open")){
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement.isContentEditable) return;
      e.preventDefault();
      openSearch();
    }
  });

  // Keep catalog-aware: if catalog wasn't ready at init, empty state is fine; search runs live on input
  function init(){
    renderEmpty();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.AVENOR_search = { open: openSearch, close: closeSearch, search: searchProducts };
})();
