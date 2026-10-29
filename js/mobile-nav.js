// AVENOR — Mobile Navigation (editorial drawer) + wordmark/home scroll
// No new dependencies. Respects AVENOR_transition, PDP/cart/search/wishlist layering.
(function(){
  var menuBtn = document.getElementById("menuBtn");
  var mobileNav = document.getElementById("mobileNav");
  var closeBtn = document.getElementById("mobileNavClose");
  var mobileSearchBtn = document.getElementById("mobileSearchBtn");
  var mobileWishlistBtn = document.getElementById("mobileWishlistBtn");
  var mobileCartBtn = document.getElementById("mobileCartBtn");

  function isOpen(){ return mobileNav && mobileNav.classList.contains("is-open"); }

  function openMenu(){
    if (!mobileNav) return;
    // close other overlays first
    ["pdpOverlay","cartDrawer","searchOverlay","wishlistDrawer","checkoutOverlay"].forEach(function(id){
      var el = document.getElementById(id);
      if (el){ el.classList.remove("is-open"); el.setAttribute("aria-hidden","true"); }
    });
    mobileNav.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden","false");
    if (menuBtn) menuBtn.setAttribute("aria-expanded","true");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu(opts){
    opts = opts || {};
    if (!mobileNav) return;
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden","true");
    if (menuBtn) menuBtn.setAttribute("aria-expanded","false");
    var anyOpen = false;
    ["pdpOverlay","cartDrawer","searchOverlay","wishlistDrawer","checkoutOverlay"].forEach(function(id){
      var el = document.getElementById(id);
      if (el && el.classList.contains("is-open")) anyOpen = true;
    });
    if (!anyOpen) document.body.style.overflow = "";
    if (opts.focusMenu && menuBtn) menuBtn.focus();
  }

  if (menuBtn){
    menuBtn.addEventListener("click", function(e){
      e.preventDefault();
      if (isOpen()) closeMenu({focusMenu:false});
      else openMenu();
    });
  }
  if (closeBtn){
    closeBtn.addEventListener("click", function(e){
      e.preventDefault();
      closeMenu({focusMenu:true});
    });
  }

  // Backdrop dismiss
  if (mobileNav){
    mobileNav.addEventListener("click", function(e){
      if (e.target === mobileNav) closeMenu({focusMenu:true});
    });
  }

  // Footer "soon" links — soft demo note without navigating away
  document.addEventListener("click", function(e){
    var soon = e.target.closest("[data-footer-soon]");
    if (!soon) return;
    e.preventDefault();
    var msg = soon.textContent.trim() + " is a demonstration link. No real delivery or returns flow is implemented in this portfolio demo.";
    // inline, non-blocking: use small temporary toast via footer contact area
    var toast = document.getElementById("footerSoonToast");
    if (!toast){
      toast = document.createElement("div");
      toast.id = "footerSoonToast";
      toast.setAttribute("role","status");
      toast.setAttribute("aria-live","polite");
      toast.style.cssText = "position:fixed;left:50%;bottom:22px;transform:translateX(-50%);max-width:min(92vw,560px);padding:12px 16px;border-radius:999px;background:var(--mocha-deep);color:white;font-size:12.5px;line-height:1.5;box-shadow:0 14px 30px rgba(27,20,16,0.22);z-index:70;text-align:center;border:1px solid rgba(255,255,255,0.14)";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function(){ toast.hidden = true; }, 2600);
  });

  // Quick actions from mobile drawer
  function closeAndThen(fn){
    closeMenu();
    setTimeout(fn, 220);
  }
  if (mobileSearchBtn){
    mobileSearchBtn.addEventListener("click", function(){
      closeAndThen(function(){
        var btn = document.getElementById("searchBtn");
        if (btn) btn.click();
        else {
          var so = document.getElementById("searchOverlay");
          if (so){ so.classList.add("is-open"); so.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; }
        }
      });
    });
  }
  if (mobileWishlistBtn){
    mobileWishlistBtn.addEventListener("click", function(){
      closeAndThen(function(){
        if (window.AVENOR_wishlist && window.AVENOR_wishlist.open) window.AVENOR_wishlist.open();
        else {
          var b = document.getElementById("wishlistBtn");
          if (b) b.click();
        }
      });
    });
  }
  if (mobileCartBtn){
    mobileCartBtn.addEventListener("click", function(){
      closeAndThen(function(){
        var cd = document.getElementById("cartDrawer");
        if (cd){ cd.classList.add("is-open"); cd.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; }
        else {
          var b = document.querySelector(".cart-btn");
          if (b) b.click();
        }
      });
    });
  }

  // Mobile nav anchor routing — close drawer then transition to section
  if (mobileNav){
    mobileNav.addEventListener("click", function(e){
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var hash = a.getAttribute("href");
      if (!hash || hash === "#" || hash.length < 2) return;
      if (!document.querySelector(hash)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      closeMenu();
      setTimeout(function(){
        var target = document.querySelector(hash);
        var run = function(){
          if (target){
            var top = target.getBoundingClientRect().top + window.scrollY - 8;
            var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({top: top, behavior: reduced ? "auto" : "smooth"});
          } else {
            window.location.hash = hash;
          }
        };
        if (typeof window.AVENOR_transition === "function") window.AVENOR_transition(hash, run);
        else run();
        try{ history.pushState(null,"", hash); }catch(_){}
      }, 220);
    });
  }

  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && isOpen()){
      closeMenu({focusMenu:true});
    }
  });

  // Wordmark already handled via main transition delegation; ensure Esc also clears mobile when other overlays closed via their own handlers
})();
