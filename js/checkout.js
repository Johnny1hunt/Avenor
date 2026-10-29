// AVENOR — Checkout Experience (frontend demo, no payment, no backend)
// Connected to CART_KEY "avenor-cart-v1" and central catalog AVENOR_PRODUCTS.
// Reuses AVENOR_getProduct / AVENOR_PRODUCTS, preserves PDP/cart/wishlist/search/transition.
(function(){
  var CART_KEY = "avenor-cart-v1";

  function getProduct(id){
    if (typeof AVENOR_getProduct === "function") return AVENOR_getProduct(id);
    if (typeof AVENOR_PRODUCTS !== "undefined") return AVENOR_PRODUCTS.find(function(p){ return p.id===id; }) || null;
    return null;
  }
  function money(n){ return "$" + n.toFixed(2); }
  function readCart(){
    try{
      var raw = localStorage.getItem(CART_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr;
    }catch(_){ return []; }
  }
  function writeCart(cart){
    try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch(_){}
    // If collections.js exposes a refresh, call it to sync badges/list
    if (window.AVENOR_cart && typeof window.AVENOR_cart.refresh === "function"){
      try{ window.AVENOR_cart.refresh(); }catch(_){}
    } else {
      // fallback: update badge count directly
      var n = cart.reduce(function(s,i){ return s + (i.qty|0); }, 0);
      var badge = document.querySelector(".cart-count");
      if (badge) badge.textContent = String(n);
      var btn = document.querySelector(".cart-btn");
      if (btn) btn.setAttribute("aria-label", "Cart, " + n + " items");
    }
    // notify other tabs / listeners
    try{ window.dispatchEvent(new Event("avenor:cart-updated")); }catch(_){}
  }
  function cartSubtotal(cart){
    var sum = 0;
    cart.forEach(function(c){
      var p = getProduct(c.id);
      if (p) sum += p.price * (c.qty|0);
    });
    return sum;
  }
  function generateRef(){
    var d = new Date();
    var y = String(d.getFullYear());
    var m = String(d.getMonth()+1).padStart(2,"0");
    var da = String(d.getDate()).padStart(2,"0");
    var rand = Math.random().toString(36).slice(2,6).toUpperCase().padEnd(4,"0").slice(0,4);
    return "AV-" + y + m + da + "-" + rand;
  }

  var overlay = document.getElementById("checkoutOverlay");
  var bodyEl = document.getElementById("checkoutBody");
  var confirmEl = document.getElementById("checkoutConfirm");
  var itemsEl = document.getElementById("checkoutItems");
  var subEl = document.getElementById("checkoutSubtotal");
  var delEl = document.getElementById("checkoutDelivery");
  var totEl = document.getElementById("checkoutTotal");
  var countEl = document.getElementById("checkoutCount");
  var form = document.getElementById("checkoutForm");
  var submitBtn = document.getElementById("checkoutSubmit");

  // delivery is complimentary in demo — kept simple per brief (no complicated rules)
  var DELIVERY_LABEL = "Complimentary — demo";
  var DELIVERY_VALUE = 0;

  function isOverlayOpen(){ return overlay && overlay.classList.contains("is-open"); }

  function openCheckout(){
    if (!overlay) return;
    var cart = readCart();
    // close other drawers/overlays
    var pdp = document.getElementById("pdpOverlay");
    var cartDrawer = document.getElementById("cartDrawer");
    var search = document.getElementById("searchOverlay");
    var wish = document.getElementById("wishlistDrawer");
    if (cartDrawer) { cartDrawer.classList.remove("is-open"); cartDrawer.setAttribute("aria-hidden","true"); }
    if (pdp) { pdp.classList.remove("is-open"); pdp.setAttribute("aria-hidden","true"); }
    if (search) { search.classList.remove("is-open"); search.setAttribute("aria-hidden","true"); }
    if (wish) { wish.classList.remove("is-open"); wish.setAttribute("aria-hidden","true"); }

    // reset confirm vs form view
    if (confirmEl) { confirmEl.hidden = true; confirmEl.innerHTML = ""; }
    if (bodyEl) bodyEl.hidden = false;
    if (form) { form.reset(); clearErrors(); }
    render();
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
    // focus first field if cart has items, else focus browse button
    setTimeout(function(){
      if (cart.length && form){
        var first = form.querySelector("input[name='fullName']");
        if (first) first.focus();
      }
    }, 180);
    try{ history.replaceState(null,"","#checkout"); }catch(_){}
  }

  function closeCheckout(opts){
    opts = opts || {};
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden","true");
    var anyOpen = false;
    ["pdpOverlay","cartDrawer","searchOverlay","wishlistDrawer"].forEach(function(id){
      var el = document.getElementById(id);
      if (el && el.classList.contains("is-open")) anyOpen = true;
    });
    if (!anyOpen) document.body.style.overflow = "";
    if (opts.clearHash && location.hash === "#checkout"){
      try{ history.replaceState(null,"", location.pathname + location.search); }catch(_){}
    }
  }

  function render(){
    if (!itemsEl || !overlay) return;
    var cart = readCart();
    var n = cart.reduce(function(s,c){ return s + (c.qty|0); }, 0);
    if (countEl) countEl.textContent = n === 1 ? "1 piece" : n + " pieces";
    if (!cart.length){
      itemsEl.innerHTML = '<div class="checkout-empty"><p class="checkout-empty-title">Your cart is empty</p><p class="checkout-empty-copy">Add products from New Arrivals or any collection. The same catalog and product detail are used everywhere — no duplicates.</p><a href="#new-arrivals" class="checkout-browse" data-checkout-browse>Browse New Arrivals</a></div>';
      if (subEl) subEl.textContent = money(0);
      if (delEl) delEl.textContent = DELIVERY_LABEL;
      if (totEl) totEl.textContent = money(0);
      if (submitBtn) { submitBtn.disabled = true; submitBtn.setAttribute("aria-disabled","true"); }
      return;
    }
    if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute("aria-disabled"); }
    var html = "";
    cart.forEach(function(c){
      var p = getProduct(c.id);
      if (!p) return;
      var line = p.price * (c.qty|0);
      var sizePart = c.size ? ' · <span class="co-size">' + c.size + '</span>' : '';
      html += '<div class="co-item">'
        + '<img src="' + p.image + '" alt="" width="84" height="84" loading="lazy">'
        + '<div class="co-item-body">'
        + '<p class="co-item-cat">' + p.category + sizePart + '</p>'
        + '<p class="co-item-name">' + p.name + '</p>'
        + '<p class="co-item-meta">' + money(p.price) + ' <small>× ' + (c.qty|0) + '</small> <strong>' + money(line) + '</strong></p>'
        + '</div></div>';
    });
    itemsEl.innerHTML = html;
    var sub = cartSubtotal(cart);
    var total = sub + DELIVERY_VALUE;
    if (subEl) subEl.textContent = money(sub);
    if (delEl) delEl.textContent = DELIVERY_LABEL;
    if (totEl) totEl.textContent = money(total);
  }

  function clearErrors(){
    if (!form) return;
    form.querySelectorAll(".co-field").forEach(function(f){ f.classList.remove("has-error"); });
    form.querySelectorAll(".co-error").forEach(function(e){ e.textContent = ""; e.hidden = true; });
  }
  function setError(input, msg){
    var field = input.closest(".co-field");
    if (field) field.classList.add("has-error");
    var err = field ? field.querySelector(".co-error") : null;
    if (err){ err.textContent = msg; err.hidden = false; }
    input.setAttribute("aria-invalid","true");
  }
  function clearFieldError(input){
    var field = input.closest(".co-field");
    if (field) field.classList.remove("has-error");
    var err = field ? field.querySelector(".co-error") : null;
    if (err){ err.textContent = ""; err.hidden = true; }
    input.removeAttribute("aria-invalid");
  }

  function validate(){
    if (!form) return false;
    clearErrors();
    var ok = true;
    var fullName = form.querySelector("input[name='fullName']");
    var email = form.querySelector("input[name='email']");
    var phone = form.querySelector("input[name='phone']");
    var addr = form.querySelector("input[name='address']");
    var city = form.querySelector("input[name='city']");
    var postcode = form.querySelector("input[name='postcode']");
    var country = form.querySelector("input[name='country']");

    function required(input, label){
      if (!input.value.trim()){
        setError(input, label + " is required.");
        ok = false;
        return false;
      }
      return true;
    }

    if (fullName && !required(fullName, "Full name")) {}
    else if (fullName && fullName.value.trim().length < 2){ setError(fullName, "Enter at least 2 characters."); ok = false; }

    if (email && required(email, "Email")){
      var v = email.value.trim();
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(v)){ setError(email, "Enter a valid email — e.g. you@atelier.com."); ok = false; }
    }

    if (phone && required(phone, "Phone number")){
      var digits = phone.value.replace(/\D/g,"");
      if (digits.length < 7){ setError(phone, "Enter a valid phone number (at least 7 digits)."); ok = false; }
    }

    if (addr && !required(addr, "Delivery address")) {}
    if (city && !required(city, "City")) {}
    if (country && !required(country, "Country")) {}
    if (postcode && !required(postcode, "Postcode")) {}

    if (!ok){
      var firstErr = form.querySelector(".co-field.has-error input");
      if (firstErr) firstErr.focus();
    }
    return ok;
  }

  function buildConfirmation(cart, customer, ref){
    var n = cart.reduce(function(s,c){ return s + (c.qty|0); }, 0);
    var sub = cartSubtotal(cart);
    var total = sub + DELIVERY_VALUE;
    var itemsHtml = cart.map(function(c){
      var p = getProduct(c.id);
      if (!p) return "";
      var line = p.price * (c.qty|0);
      return '<div class="co-confirm-row"><img src="' + p.image + '" alt="" width="56" height="56"><div><p class="co-confirm-name">' + p.name + (c.size ? ' · ' + c.size : '') + '</p><p class="co-confirm-meta">' + p.category + ' · ' + money(p.price) + ' × ' + c.qty + '</p></div><strong>' + money(line) + '</strong></div>';
    }).join("");

    return '<div class="co-confirm-head">'
      + '<p class="co-confirm-eyebrow">Demo order confirmed — no charge</p>'
      + '<h2 class="co-confirm-title">Thank you, ' + (customer.fullName.split(" ")[0] || "atelier") + '.</h2>'
      + '<p class="co-confirm-ref">Reference <strong>' + ref + '</strong> · ' + n + (n===1 ? ' piece' : ' pieces') + ' · <span class="co-confirm-total">' + money(total) + ' total</span></p>'
      + '<p class="co-confirm-note">This is a frontend demonstration. No payment was collected, no order was fulfilled, and no data was sent to a server. The cart has been cleared locally.</p>'
      + '</div>'
      + '<div class="co-confirm-summary">'
      + '<div class="co-confirm-items">' + itemsHtml + '</div>'
      + '<div class="co-confirm-totals"><div><span>Subtotal</span><strong>' + money(sub) + '</strong></div><div><span>Delivery</span><strong>' + DELIVERY_LABEL + '</strong></div><div class="is-total"><span>Total</span><strong>' + money(total) + '</strong></div></div>'
      + '<div class="co-confirm-customer"><p class="co-confirm-label">Delivered to (demo)</p><p>' + customer.fullName + ' · ' + customer.email + (customer.phone ? ' · ' + customer.phone : '') + '</p><p>' + customer.address + ', ' + customer.city + ' ' + customer.postcode + ', ' + customer.country + '</p></div>'
      + '</div>'
      + '<div class="co-confirm-actions">'
      + '<a href="#new-arrivals" class="co-confirm-primary" data-confirm-continue>Continue shopping</a>'
      + '<button class="co-confirm-secondary" data-confirm-close>Close</button>'
      + '</div>'
      + '<p class="co-confirm-foot">A copy was not emailed — this is an illustrative portfolio checkout from AVENOR’s single catalog of 99 products.</p>';
  }

  function onSubmit(e){
    e.preventDefault();
    var cart = readCart();
    if (!cart.length){
      render();
      return;
    }
    if (!validate()) return;

    var fd = new FormData(form);
    var customer = {
      fullName: String(fd.get("fullName")||"").trim(),
      email: String(fd.get("email")||"").trim(),
      phone: String(fd.get("phone")||"").trim(),
      address: String(fd.get("address")||"").trim(),
      city: String(fd.get("city")||"").trim(),
      postcode: String(fd.get("postcode")||"").trim(),
      country: String(fd.get("country")||"").trim()
    };
    var ref = generateRef();
    // snapshot cart before clearing
    var snapshot = cart.slice();

    // build confirmation first, then clear cart
    var html = buildConfirmation(snapshot, customer, ref);
    if (bodyEl) bodyEl.hidden = true;
    if (confirmEl){
      confirmEl.hidden = false;
      confirmEl.innerHTML = html;
      confirmEl.scrollTop = 0;
      var sheet = overlay.querySelector(".checkout-sheet");
      if (sheet) sheet.scrollTop = 0;
    }

    // clear cart only after successful confirmation is rendered
    if (window.AVENOR_cart && typeof window.AVENOR_cart.clear === "function"){
      window.AVENOR_cart.clear();
    } else {
      writeCart([]);
    }

    try{
      window.dispatchEvent(new CustomEvent("avenor:order-placed", { detail: { ref: ref, customer: customer, items: snapshot }}));
    }catch(_){}

    var closeBtn = confirmEl ? confirmEl.querySelector("[data-confirm-close]") : null;
    if (closeBtn) closeBtn.focus();
  }

  // Delegation for open/close and validation UX
  document.addEventListener("click", function(e){
    if (e.target.closest("#checkoutClose")){ e.preventDefault(); closeCheckout({clearHash:true}); return; }
    if (e.target.closest("#checkoutBack")){
      e.preventDefault();
      closeCheckout({clearHash:true});
      // reopen cart drawer
      var cd = document.getElementById("cartDrawer");
      if (cd){ cd.classList.add("is-open"); cd.setAttribute("aria-hidden","false"); document.body.style.overflow = "hidden"; }
      return;
    }
    if (e.target.closest("[data-checkout-browse]")){
      e.preventDefault();
      closeCheckout({clearHash:true});
      var na = document.getElementById("new-arrivals");
      if (na){
        var top = na.getBoundingClientRect().top + window.scrollY - 14;
        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (typeof window.AVENOR_transition === "function") window.AVENOR_transition("#new-arrivals", function(){ window.scrollTo({top:top, behavior: reduced?"auto":"smooth"}); });
        else window.scrollTo({top:top, behavior: reduced?"auto":"smooth"});
      }
      return;
    }
    if (e.target.closest("[data-confirm-continue]")){
      // let anchor scroll happen after close
      e.preventDefault();
      closeCheckout({clearHash:true});
      var na2 = document.getElementById("new-arrivals");
      if (na2){
        var top2 = na2.getBoundingClientRect().top + window.scrollY - 14;
        var reduced2 = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (typeof window.AVENOR_transition === "function") window.AVENOR_transition("#new-arrivals", function(){ window.scrollTo({top:top2, behavior: reduced2?"auto":"smooth"}); });
        else window.scrollTo({top:top2, behavior: reduced2?"auto":"smooth"});
      } else {
        window.scrollTo({top:0, behavior:"smooth"});
      }
      return;
    }
    if (e.target.closest("[data-confirm-close]")){
      e.preventDefault();
      closeCheckout({clearHash:true});
      return;
    }
    // backdrop click closes
    if (overlay && e.target === overlay){ closeCheckout({clearHash:true}); return; }
  });

  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && isOverlayOpen()){
      closeCheckout({clearHash:true});
    }
  });

  // live clear of field error on input
  if (form){
    form.addEventListener("input", function(e){
      var t = e.target;
      if (t.matches("input") && t.closest(".co-field.has-error")){
        clearFieldError(t);
      }
    });
    form.addEventListener("submit", onSubmit);
  }

  // keep order summary in sync if cart changes while checkout is open
  window.addEventListener("avenor:cart-updated", function(){ if (isOverlayOpen() && bodyEl && !bodyEl.hidden) render(); });
  window.addEventListener("storage", function(e){
    if (e.key === CART_KEY && isOverlayOpen() && bodyEl && !bodyEl.hidden) render();
  });

  // Expose
  window.AVENOR_checkout = {
    open: openCheckout,
    close: closeCheckout,
    render: render,
    CART_KEY: CART_KEY
  };

  // Support direct #checkout hash
  function handleHash(){
    if (location.hash === "#checkout") openCheckout();
  }
  window.addEventListener("hashchange", function(){
    if (location.hash === "#checkout") openCheckout();
    else if (isOverlayOpen()) closeCheckout();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", handleHash);
  else handleHash();
})();
