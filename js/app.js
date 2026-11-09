/* =====================================================================
   App shell — navigation, scroll-spy, hero map, protocol steppers,
   reveal-on-scroll, scroll-to-top. No dependencies.
   ===================================================================== */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- top bar & mobile menu ---------- */
  function initNav() {
    const bar = $("topbar"), toggle = $("navToggle"), menu = $("mobileNav");
    const setOpen = (open) => {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "סגירת תפריט" : "פתיחת תפריט");
      toggle.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
    };
    toggle.addEventListener("click", () => setOpen(menu.hidden));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setOpen(false); toggle.focus(); } });
    window.addEventListener("resize", () => { if (window.innerWidth >= 1180 && !menu.hidden) setOpen(false); });

    const toTop = $("toTop");
    const onScroll = () => {
      const y = window.scrollY;
      bar.classList.toggle("scrolled", y > 8);
      toTop.classList.toggle("show", y > 900);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  }

  /* ---------- scroll-spy: highlight the active section ---------- */
  function initSpy() {
    // map every section id to the nav item that represents it
    const groups = { home: null, intro: "intro", foundations: "intro", atlas: "atlas", pointsTable: "pointsTable", muscles: "muscles",
      methods: "methods", diagnosis: "methods", protocols: "protocols", cases: "cases", technique: "technique", videos: "videos", glossary: "glossary", review: "glossary" };
    const sections = Object.keys(groups).map((id) => $(id)).filter(Boolean);
    const links = [...document.querySelectorAll("#nav a, #mobileNav a")];
    let current = null;
    const activate = (id) => {
      if (id === current) return;
      current = id;
      links.forEach((a) => {
        const target = a.getAttribute("href").slice(1);
        const on = a.closest("#nav") ? groups[id] === target : target === id;
        a.classList.toggle("active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    };
    const update = () => {
      const line = window.innerHeight * 0.3;
      let active = "home";
      for (const s of sections) { if (s.getBoundingClientRect().top - line <= 0) active = s.id; }
      activate(active);
    };
    let raf = 0;
    window.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ---------- hero map: the 16 points on the existing head model ---------- */
  function initHero() {
    const g = $("heroPoints"), tracks = $("heroTracks");
    if (!g || typeof cheekPoints === "undefined") return;
    const NS = "http://www.w3.org/2000/svg";
    const groups = [["CA-5", "CA-6", "CA-7", "CA-8"], ["CA-2", "CA-3", "CA-4"], ["CA-9", "CA-10", "CA-11", "CA-12"], ["CA-13", "CA-14", "CA-15", "CA-16"]];
    groups.forEach((codes) => {
      const pts = codes.map((c) => cheekPoints.find((p) => p.code === c));
      const pl = document.createElementNS(NS, "polyline");
      pl.setAttribute("points", pts.map((p) => `${p.x},${p.y}`).join(" "));
      pl.setAttribute("fill", "none");
      pl.setAttribute("stroke", pts[0].color);
      pl.setAttribute("stroke-width", "2");
      pl.setAttribute("stroke-dasharray", "4 4");
      pl.setAttribute("opacity", ".75");
      tracks.appendChild(pl);
    });
    cheekPoints.forEach((pt) => {
      const a = document.createElementNS(NS, "g");
      a.setAttribute("class", "hero-dot-g");
      a.setAttribute("tabindex", "0");
      a.setAttribute("role", "link");
      a.setAttribute("aria-label", `${pt.code} ${pt.nameHe} – פתח באטלס`);
      const t = document.createElementNS(NS, "title");
      t.textContent = `${pt.code} · ${pt.nameHe}`;
      a.appendChild(t);
      const halo = document.createElementNS(NS, "circle");
      halo.setAttribute("cx", pt.x); halo.setAttribute("cy", pt.y); halo.setAttribute("r", 18); halo.setAttribute("fill", "transparent");
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y);
      c.setAttribute("r", pt.isLarge ? 10 : 7);
      c.setAttribute("fill", pt.color);
      c.setAttribute("stroke", pt.strokeColor);
      c.setAttribute("stroke-width", "1.5");
      a.append(halo, c);
      const go = () => (window.CA_goToPoint ? window.CA_goToPoint(pt.code) : selectPoint(pt.code));
      a.addEventListener("click", go);
      a.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      g.appendChild(a);
    });
  }

  /* ---------- stats come from the data, never hard-coded guesses ---------- */
  function initStats() {
    const set = (k, v) => { const el = document.querySelector(`[data-stat="${k}"]`); if (el && v) el.textContent = v; };
    if (typeof cheekPoints !== "undefined") set("points", cheekPoints.length);
    if (typeof cheekMuscles !== "undefined") set("muscles", cheekMuscles.length);
    set("cases", (window.CA_BOOK_CASES || []).length);
    set("videos", document.querySelectorAll("#videos .video-card").length);
  }

  /* ---------- protocol steppers ---------- */
  function initProtocols() {
    document.querySelectorAll(".protocol").forEach((card) => {
      const steps = [...card.querySelectorAll(".step")];
      const bar = card.querySelector(".progress");
      if (!steps.length || !bar) return;
      bar.innerHTML = steps.map(() => "<span></span>").join("");
      const segs = [...bar.children];
      const setStep = (i) => {
        steps.forEach((s, j) => { s.classList.toggle("active", j <= i); const b = s.querySelector(".step-toggle"); if (b) b.setAttribute("aria-current", j === i ? "step" : "false"); });
        segs.forEach((s, j) => s.classList.toggle("on", j <= i));
      };
      steps.forEach((s, i) => { const b = s.querySelector(".step-toggle"); if (b) b.addEventListener("click", () => setStep(i)); });
      setStep(0);
    });
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-highlight]");
      if (!b) return;
      setProtocol(b.dataset.highlight);
      $("atlas").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- video thumbnails: graceful fallback ---------- */
  function initVideos() {
    document.querySelectorAll(".video-thumb img").forEach((img) => {
      img.addEventListener("error", () => { img.style.visibility = "hidden"; }, { once: true });
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    const observe = () => document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    observe();
    document.addEventListener("ca:content-ready", observe);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initHero();
    initStats();
    initProtocols();
    initVideos();
    initReveal();
    initSpy();
  });
})();
