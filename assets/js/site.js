/* =====================================================================
   QUANTUM SUCCESS — site script (no libraries, no build step)
   Progressive enhancement: the site reads fine without JavaScript.
   ===================================================================== */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  /* ---------- SETTINGS (edit here) ----------
     FORM_URL: paste a Google Form link to send enquiries there.
     Leave empty ("") and the forms open the visitor's email app with the details filled in. */
  var FORM_URL = "";
  var EMAIL = "hemani@quantumsuccessblueprint.com";
  var WHATSAPP = "61433430416";
  /* Google Ads conversion tracking (optional). Paste both from Google Ads → Goals → Conversions,
     e.g. ADS_ID = "AW-123456789", ADS_LABEL = "AbC-D_efG". Empty = no Google script is loaded at all.
     A conversion is recorded when a visitor clicks a Calendly button, sends a form or taps WhatsApp. */
  var ADS_ID = "";
  var ADS_LABEL = "";

  /* ---------- Ad source (utm_* from the Google Ads link) — kept for this visit only ---------- */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var utm = {};
  try {
    var qs = new URLSearchParams(location.search);
    UTM_KEYS.forEach(function (k) { if (qs.get(k)) utm[k] = qs.get(k); });
    if (qs.get("gclid") && !utm.utm_source) { utm.utm_source = "google"; utm.utm_medium = "cpc"; }
    if (Object.keys(utm).length) sessionStorage.setItem("qs-utm", JSON.stringify(utm));
    else utm = JSON.parse(sessionStorage.getItem("qs-utm") || "{}") || {};
  } catch (err) { utm = utm || {}; }
  /* Calendly accepts utm_* and shows them with each booking */
  if (Object.keys(utm).length) {
    document.querySelectorAll('a[href*="calendly.com"]').forEach(function (a) {
      try {
        var u = new URL(a.href);
        Object.keys(utm).forEach(function (k) { u.searchParams.set(k, utm[k]); });
        a.href = u.toString();
      } catch (err) { /* leave link as is */ }
    });
  }

  /* ---------- Google Ads conversions (only when ADS_ID and ADS_LABEL are set) ---------- */
  var convert = function () {};
  if (ADS_ID && ADS_LABEL) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", ADS_ID);
    var gs = document.createElement("script");
    gs.async = true;
    gs.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ADS_ID);
    document.head.appendChild(gs);
    convert = function () { window.gtag("event", "conversion", { send_to: ADS_ID + "/" + ADS_LABEL }); };
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="calendly.com"], a[href*="wa.me"], [data-wa]');
    if (a) convert();
  });

  /* ---------- Video: load the Vimeo player only when the visitor taps play ---------- */
  document.querySelectorAll("[data-vimeo]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = btn.parentNode;
      var f = document.createElement("iframe");
      f.src = "https://player.vimeo.com/video/" + btn.getAttribute("data-vimeo") + "?autoplay=1&title=0&byline=0&portrait=0&dnt=1";
      f.allow = "autoplay; fullscreen; picture-in-picture";
      f.allowFullscreen = true;
      f.title = btn.getAttribute("data-title") || "Video";
      box.innerHTML = "";
      box.appendChild(f);
    });
  });

  /* ---------- Landing page: sticky "Book a call" bar on phones, hidden while the final form is on screen ---------- */
  var lpBar = document.querySelector(".lp-bar");
  if (lpBar) {
    var finalShown = false;
    var start = document.getElementById("start");
    if (start && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { finalShown = en[0].isIntersecting; place(); }, { threshold: 0.15 }).observe(start);
    }
    var place = function () { lpBar.classList.toggle("show", (window.scrollY || 0) > 520 && !finalShown); };
    window.addEventListener("scroll", place, { passive: true });
    place();
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var ICON_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg><span class="sr-only">Open menu</span>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg><span class="sr-only">Close menu</span>';
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.innerHTML = open ? ICON_CLOSE : ICON_OPEN;
    };
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  /* ---------- Header shadow, progress bar, back-to-top ---------- */
  var header = document.querySelector(".site-header");
  var bar = document.querySelector(".progress");
  var toTop = document.querySelector(".to-top");
  var wa = document.querySelector(".wa");
  var onScroll = function () {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (bar) {
      var h = document.body.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
    if (toTop) toTop.classList.toggle("show", y > 900);
    if (wa) wa.classList.toggle("show", y > 500);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Ticker: duplicate the track so the loop is seamless ---------- */
  document.querySelectorAll(".ticker .track").forEach(function (t) { t.innerHTML += t.innerHTML; });

  /* ---------- Programme level tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".panel");
  function showTab(id) {
    tabs.forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("aria-controls") === id ? "true" : "false"); });
    panels.forEach(function (p) { p.classList.toggle("show", p.id === id); });
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { showTab(t.getAttribute("aria-controls")); }); });
  if (tabs.length) {
    var fromHash = (location.hash || "").replace("#", "");
    showTab(document.getElementById(fromHash) && document.getElementById(fromHash).classList.contains("panel") ? fromHash : "lvl-foundation");
    window.addEventListener("hashchange", function () {
      var id = location.hash.replace("#", "");
      var p = document.getElementById(id);
      if (p && p.classList.contains("panel")) showTab(id);
    });
  }

  /* ---------- Country list for the forms ---------- */
  var COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Cambodia","Cameroon","Canada","Chile","China","Colombia","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Ethiopia","Fiji","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Laos","Latvia","Lebanon","Libya","Lithuania","Luxembourg","Malaysia","Maldives","Malta","Mauritius","Mexico","Mongolia","Morocco","Mozambique","Myanmar (Burma)","Namibia","Nepal","Netherlands","New Zealand","Nigeria","Norway","Oman","Pakistan","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland","Taiwan","Tanzania","Thailand","Trinidad and Tobago","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Zambia","Zimbabwe"];
  var dl = document.getElementById("countries");
  if (dl) dl.innerHTML = COUNTRIES.map(function (c) { return '<option value="' + c + '">'; }).join("");

  /* ---------- Enquiry forms ---------- */
  document.querySelectorAll("form[data-enquiry]").forEach(function (form) {
    var note = form.querySelector(".form-note");
    var say = function (m, bad) { if (note) { note.textContent = m; note.style.color = bad ? "#b3261e" : ""; } };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var d = new FormData(form), lines = [];
      form.querySelectorAll("[name]").forEach(function (f) {
        if (f.type === "checkbox") return;
        var label = (form.querySelector('label[for="' + f.id + '"]') || {}).textContent || f.name;
        var v = d.get(f.name);
        if (v) lines.push(label.replace("*", "").trim() + ": " + v);
      });
      var topic = form.getAttribute("data-enquiry");
      if (Object.keys(utm).length) lines.push("Came from: " + UTM_KEYS.filter(function (k) { return utm[k]; }).map(function (k) { return k.replace("utm_", "") + "=" + utm[k]; }).join(", "));
      convert();
      var body = lines.join("\n");
      if (FORM_URL) {
        window.open(FORM_URL, "_blank", "noopener");
        say("Thank you — opening the enquiry form in a new tab.");
      } else {
        window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Quantum Success — " + topic) + "&body=" + encodeURIComponent(body + "\n\n(Sent from the website)");
        say("Thank you — your email app should open with the details ready to send. Prefer WhatsApp? Use the green button.");
      }
    });
    var wa = form.querySelector("[data-wa]");
    if (wa) wa.addEventListener("click", function (e) {
      e.preventDefault();
      var n = (form.querySelector('[name="name"]') || {}).value || "";
      var t = "Hello Dr Hemani, I'm " + (n || "interested") + " and would like to know more about Quantum Success (" + form.getAttribute("data-enquiry") + ").";
      window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(t), "_blank", "noopener");
    });
  });
})();
