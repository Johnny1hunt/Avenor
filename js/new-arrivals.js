// AVENOR — New Arrivals render + Brand Signature Transition 2026-10-29
(function(){
  // ---- Render New Arrivals grid ----
  const grid = document.getElementById("naGrid");
  function money(n){ return "$"+n.toFixed(2); }
  function renderNA(){
    if(!grid || typeof NEW_ARRIVALS==="undefined") return;
    grid.innerHTML = NEW_ARRIVALS.map(p=>`
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
      </article>
    `).join("");
    if (window.AVENOR_wishlist && window.AVENOR_wishlist.sync) window.AVENOR_wishlist.sync();
    // image fallback
    grid.addEventListener("error", (e)=>{
      if(e.target.tagName==="IMG"){
        e.target.style.background="linear-gradient(135deg,#F5EFE8,#E6E0F0)";
        e.target.alt += " (image unavailable)";
      }
    }, true);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", renderNA);
  else renderNA();

  // ---- Brand Signature Transition (section jumps only) ----
  const transition = document.getElementById("avenorTransition");
  let running = false;
  let prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", e=> prefersReduced=e.matches);

  function runTransition(onReveal){
    if(prefersReduced){ onReveal(); return; }
    if(running) return;
    running = true;
    transition.classList.remove("is-done");
    // force reflow then run
    void transition.offsetWidth;
    transition.classList.add("is-running");
    // mid-point reveal (when layer covers)
    setTimeout(()=>{ onReveal(); }, 420);
    // end
    setTimeout(()=>{
      transition.classList.remove("is-running");
      transition.classList.add("is-done");
      running=false;
    }, 980);
  }

  // intercept anchor jumps to sections (not every click)
  const triggers = document.querySelectorAll('a[data-transition], .header-nav a[href^="#"], .cta-primary[href^="#"]');
  function smoothTo(hash){
    const target = document.querySelector(hash);
    if(target){
      const top = target.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({top, behavior: prefersReduced ? "auto" : "smooth"});
    } else {
      window.location.hash = hash;
    }
  }
  document.addEventListener("click", (e)=>{
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    // ignore cart/wishlist buttons styled as links without hash nav
    const hash = a.getAttribute("href");
    if(!hash || hash==="#" || hash.length<2) return;
    // only handle jumps to hero / new-arrivals / footer on this single page
    if(!document.querySelector(hash)) return;
    // don't hijack if modifier keys
    if(e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    runTransition(()=> smoothTo(hash));
    // update url without jump
    try{ history.pushState(null,"", hash); }catch(_){}
  });

  // also support programmatic trigger: window.AVENOR_transition(toHash)
  window.AVENOR_transition = (hash, cb)=>{
    if(typeof hash==="function"){ cb=hash; hash=null; }
    runTransition(()=>{ if(hash) smoothTo(hash); if(cb) cb(); });
  };
})();
