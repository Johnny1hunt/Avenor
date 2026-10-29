// AVENOR — Shop by Category filtering 2026-10-29
// Maps each banner to a bucket of NEW_ARRIVALS categories. No fake pages, no broken links.
(function(){
  const BUCKETS = {
    fashion:  (c)=> /fashion|accessories|jewelry/i.test(c),
    sneakers: (c)=> /sneaker|footwear|loafer/i.test(c),
    beauty:   (c)=> /beauty/i.test(c),
  };
  function bucketOf(category){
    for(const [key, test] of Object.entries(BUCKETS)){
      if(test(category)) return key;
    }
    return "other";
  }

  const grid = document.getElementById("naGrid");
  const filterLabel = document.getElementById("scFilterLabel");
  const filterCount = document.getElementById("scFilterCount");
  const clearBtn = document.getElementById("scClear");
  const banners = document.querySelectorAll(".sc-banner[data-filter]");
  let active = "all";

  function money(n){ return "$"+n.toFixed(2); }

  function cardHTML(p){
    return `
      <article class="na-card" data-open="${p.id}" tabindex="0" aria-label="${p.name} — ${p.category}">
        <div class="na-media">
          <span class="na-badge">New</span>
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

  function applyFilter(key){
    if(typeof NEW_ARRIVALS === "undefined" || !grid) return;
    active = key;
    let items;
    if(key === "all") items = NEW_ARRIVALS;
    else items = NEW_ARRIVALS.filter(p=> bucketOf(p.category) === key);

    grid.innerHTML = items.map(cardHTML).join("");
    if(window.AVENOR_wishlist && window.AVENOR_wishlist.sync) window.AVENOR_wishlist.sync();

    // update banner active states
    banners.forEach(b=> b.classList.toggle("is-active", b.dataset.filter === key));
    document.querySelectorAll("[data-sc-chip]").forEach(ch=> ch.classList.toggle("is-active", ch.dataset.scChip === key));

    // filter bar
    if(filterLabel){
      const names = {all:"All arrivals", fashion:"Fashion", sneakers:"Sneakers & Footwear", beauty:"Beauty & Care"};
      filterLabel.textContent = "Viewing: " + (names[key] || key);
    }
    if(filterCount) filterCount.textContent = items.length + " pieces";
    if(clearBtn) clearBtn.hidden = (key === "all");

    // announce for SR
    const live = document.getElementById("scLive");
    if(live) live.textContent = "Showing " + items.length + " " + (key==="all" ? "new arrivals" : key) + " products.";
  }

  function scrollToArrivals(prefersReduced){
    const target = document.getElementById("new-arrivals");
    if(!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 14;
    window.scrollTo({top, behavior: prefersReduced ? "auto" : "smooth"});
  }

  function onBannerClick(e){
    const banner = e.target.closest(".sc-banner[data-filter]");
    if(!banner) return;
    // capture chip clicks too
    e.preventDefault();
    e.stopPropagation();
    const key = banner.dataset.filter || banner.getAttribute("data-sc-chip") || "all";
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = ()=>{
      applyFilter(key);
      scrollToArrivals(prefersReduced);
      try{ history.pushState(null,"","#new-arrivals"); }catch(_){}
    };
    if(typeof window.AVENOR_transition === "function"){
      window.AVENOR_transition("#new-arrivals", run);
      // AVENOR_transition already scrolls; we filter on its mid-point
      // so schedule filter slightly before its reveal
      setTimeout(run, 380);
    } else {
      run();
    }
  }

  // delegate: banners + chip bar + clear
  document.addEventListener("click", (e)=>{
    if(e.target.closest(".sc-banner[data-filter]") || e.target.closest("[data-sc-chip]")){
      const el = e.target.closest("[data-filter], [data-sc-chip]");
      const key = el.dataset.filter || el.dataset.scChip;
      e.preventDefault();
      e.stopPropagation();
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const run = ()=>{
        applyFilter(key);
        const t = document.getElementById("new-arrivals");
        if(t) window.scrollTo({top: t.getBoundingClientRect().top + window.scrollY - 14, behavior: prefersReduced ? "auto":"smooth"});
        try{ history.pushState(null,"","#new-arrivals"); }catch(_){}
      };
      if(typeof window.AVENOR_transition === "function"){
        window.AVENOR_transition(()=>{});
        setTimeout(run, 380);
      } else run();
      return;
    }
    if(e.target.closest("#scClear")){
      e.preventDefault();
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const run = ()=>{ applyFilter("all"); scrollToArrivals(prefersReduced); };
      if(typeof window.AVENOR_transition === "function"){
        window.AVENOR_transition(()=>{});
        setTimeout(run, 380);
      } else run();
    }
  }, true);

  // expose for console / future sections
  window.AVENOR_filter = applyFilter;
  window.AVENOR_buckets = BUCKETS;

  // no auto-filter on load — stays on All
})();
