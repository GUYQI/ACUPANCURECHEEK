/* ==========================================================================
   Print transform — runs inside the offline page (via Playwright) right
   before the PDF is rendered. It turns the interactive single-view site into
   a fully expanded document:
     • one card per point (16) and per muscle (7), protocol summaries
     • every <details> opened, every case shown, book text shown in the table
     • interactive-only controls removed, a table of contents added
     • the dark theme converted to a light, print-friendly one
   It only re-arranges and re-colours existing content; it adds no content
   except headings for the generated groups, the table of contents and a
   short note about the edition.
   ========================================================================== */
/* global cheekPoints, cheekMuscles, selectPoint, selectMuscle, setProtocol */
(function printTransform(buildDate) {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const stripIds = (node) => { node.removeAttribute("id"); $$("[id]", node).forEach((n) => n.removeAttribute("id")); return node; };

  const sectionShell = (id, num, title, lead) => el(`
    <section id="${id}" class="max-w-7xl w-full mx-auto px-4 pb-6 print-section">
      <div class="kb-section">
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-sky-500 text-slate-950">${num}</span>
          <h2 class="text-lg md:text-xl font-extrabold text-white">${title}</h2>
        </div>
        ${lead ? `<p class="text-xs md:text-sm text-slate-400 mb-3">${lead}</p>` : ""}
        <div class="print-grid"></div>
      </div>
    </section>`);

  /* ---------- 1. Protocol summaries (cloned from the atlas protocol card) ---------- */
  const protoClones = ["cervical", "dysmenorrhea", "fertility"].map((key) => {
    setProtocol(key);
    const c = stripIds($("#protocolCard").cloneNode(true));
    c.classList.remove("hidden");
    $$("button", c).forEach((b) => b.remove());
    c.classList.add("print-card");
    return c;
  });
  setProtocol("all");

  /* ---------- 2. One card per point ---------- */
  const pointClones = cheekPoints.map((pt) => {
    selectPoint(pt.code);
    const card = stripIds($("#pointInspectorCard").cloneNode(true));
    const grid = $(".grid.grid-cols-2.sm\\:grid-cols-4", card) || $("[class*='max-h-44']", card);
    const quick = grid ? grid.closest(".mt-4") : null;
    if (quick) quick.remove();
    card.classList.add("print-card");
    return card;
  });

  /* ---------- 3. One card per muscle ---------- */
  const muscleClones = cheekMuscles.map((m) => {
    selectMuscle(m.id);
    const card = stripIds($("#muscleInspectorCard").cloneNode(true));
    const list = $(".grid.grid-cols-1.sm\\:grid-cols-2", card);
    const block = list ? list.closest(".mt-3\\.5") || list.parentElement : null;
    if (block) block.remove();
    card.classList.add("print-card");
    return card;
  });

  // Back to the neutral map: all 16 points, nothing dimmed
  setProtocol("all");
  selectPoint("CA-4");

  /* ---------- 4. Atlas: keep the map, replace the single-item inspector ---------- */
  const atlas = $("#atlas");
  const inspectorCol = $("#pointInspectorCard").parentElement;
  inspectorCol.remove();
  const mapCol = $("#cheekSvg").closest(".lg\\:col-span-7");
  if (mapCol) mapCol.className = mapCol.className.replace("lg:col-span-7", "lg:col-span-12");
  $$(".pulse-ring", atlas).forEach((n) => n.remove());

  const pointsSec = sectionShell("printPoints", "2א", "כרטיסי 16 הנקודות", "כל הפרטים של כל נקודה, כפי שהם מוצגים באטלס כשבוחרים בה: מיקום, מישוש, מחט, התוויות, טבלה 1 ונוסח ספר המקור.");
  pointClones.forEach((c) => $(".print-grid", pointsSec).appendChild(c));
  const musclesSec = sectionShell("printMuscles", "2ב", "כרטיסי 7 השרירים", "כל הפרטים של כל שריר, כפי שהם מוצגים באטלס כשבוחרים בו.");
  muscleClones.forEach((c) => $(".print-grid", musclesSec).appendChild(c));
  atlas.after(pointsSec);
  pointsSec.after(musclesSec);

  /* ---------- 5. Protocol summaries go at the top of the protocols area ---------- */
  const protocols = $("#protocols");
  if (protocols) {
    const box = el(`<div class="print-protos"><h3 class="kb-h3">סיכומי הפרוטוקולים מהאטלס</h3><div class="print-grid"></div></div>`);
    protoClones.forEach((c) => $(".print-grid", box).appendChild(c));
    protocols.after(box);
  }

  /* ---------- 6. Expand everything ---------- */
  const toggle = $("#tableBookToggle");
  if (toggle && !toggle.checked) { toggle.checked = true; toggle.dispatchEvent(new Event("change")); }
  if (toggle) toggle.closest("label").remove();

  const reset = $("#caseReset");
  if (reset) reset.click();
  const casesList = $("#casesList");
  if (casesList) casesList.className = casesList.className.replace(/max-h-\[[^\]]+\]|overflow-y-auto|custom-scroll/g, "");
  const caseSearch = $("#caseSearch");
  if (caseSearch) caseSearch.parentElement.remove();      // the row holds only the case filters
  const glossSearch = $("#glossSearch");
  if (glossSearch) glossSearch.remove();                  // its row also holds the heading: remove the input only

  // The videos heading is an <h3>; make it a section heading so it reaches the TOC and PDF bookmarks
  const vh = $("#videos h3");
  if (vh) {
    const h2 = document.createElement("h2");
    for (const a of vh.attributes) h2.setAttribute(a.name, a.value);
    h2.innerHTML = vh.innerHTML;
    vh.replaceWith(h2);
  }
  $$("details").forEach((d) => (d.open = true));

  /* ---------- 7. Remove interactive-only chrome ---------- */
  const layerBtns = $("#toggleModelBtn");
  if (layerBtns) layerBtns.parentElement.remove();
  const modeBar = $("#proto-all");
  if (modeBar) modeBar.closest("div[class*='bg-slate-800']").remove();
  $$('a[href="#videosSection"], a[href="#videos"]').forEach((a) => { if (a.closest("nav")) return; if (!a.closest("#videos")) a.remove(); });
  $$("button").forEach((b) => {
    // chips stay as labels; action buttons that only make sense on screen go
    if (/הדגש נקודות|חזור לכל|איפוס/.test(b.textContent)) b.remove();
  });
  $$(".kb-caret").forEach((n) => n.remove());

  /* ---------- 8. Edition note + table of contents ---------- */
  const header = $("header");
  const toc = $$("main h2, section h2, #videosSection h2, .kb-section h2")
    .filter((h, i, arr) => arr.indexOf(h) === i && h.offsetParent !== null && !h.closest(".print-card"))
    .map((h, i) => {
      const host = h.closest("section[id], div[id]");
      let id = host && host.id;
      if (!id) { id = `toc-${i}`; h.id = id; }
      return `<li><a href="#${id}">${h.textContent.trim()}</a></li>`;
    });
  header.after(el(`
    <section class="max-w-7xl w-full mx-auto px-4 pt-5 print-cover">
      <div class="kb-section">
        <p class="text-xs text-slate-400 mb-2">גרסת PDF של האתר, עם כל התוכן במצב פתוח: כל הנקודות, השרירים, הפרוטוקולים והמקרים. נוצרה ב-${buildDate} מתוך <span dir="ltr">guyqi.github.io/ACUPANCURECHEEK</span>. קישורי הסרטונים דורשים חיבור לאינטרנט.</p>
        <h2 class="text-lg font-extrabold text-white mb-2">תוכן העניינים</h2>
        <ol class="print-toc">${toc.join("")}</ol>
      </div>
    </section>`));

  /* ---------- 9. Dark → light: invert lightness, keep hue (outside the map) ---------- */
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const invert = ({ r, g, b, a }) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    l = 1 - l;
    // keep saturated accents legible on white: cap light text at 42% lightness
    return { h, s, l, a };
  };
  const hsla = ({ h, s, l, a }) => `hsla(${(h * 360).toFixed(1)}, ${(s * 100).toFixed(1)}%, ${(l * 100).toFixed(1)}%, ${a})`;

  const targets = $$("body *").filter((n) => !n.closest("svg") || n.tagName.toLowerCase() === "svg");
  const plan = targets.map((n) => {
    const cs = getComputedStyle(n);
    const inlineBg = /background/.test(n.getAttribute("style") || "");
    return {
      n,
      inlineBg,
      color: parse(cs.color),
      bg: parse(cs.backgroundColor),
      borders: ["Top", "Right", "Bottom", "Left"].map((side) => parse(cs[`border${side}Color`])),
      gradient: cs.backgroundImage.includes("gradient"),
    };
  });
  plan.forEach(({ n, inlineBg, color, bg, borders, gradient }) => {
    if (n.tagName.toLowerCase() === "svg") return; // leave the anatomical map and icons as drawn
    if (!inlineBg) {
      if (color) {
        const c = invert(color);
        if (c.l > 0.42 && c.s > 0.25) c.l = 0.42;   // e.g. amber/sky accents become readable dark tones
        n.style.setProperty("color", hsla(c), "important");
      }
      if (bg && bg.a > 0) {
        const c = invert(bg);
        if (c.l > 0.8) c.s = Math.min(c.s, 0.12);   // dark slate panels → neutral light greys, not lavender
        n.style.setProperty("background-color", hsla(c), "important");
      }
    }
    borders.forEach((b, i) => {
      if (b && b.a > 0) n.style.setProperty(`border-${["top", "right", "bottom", "left"][i]}-color`, hsla(invert(b)), "important");
    });
    if (gradient) n.style.setProperty("background-image", "none", "important");
    n.style.setProperty("box-shadow", "none", "important");
  });
  document.documentElement.style.background = "#ffffff";
  document.body.style.setProperty("background", "#ffffff", "important");
  document.body.style.setProperty("color", "#0f172a", "important");

  /* ---------- 10. Print layout rules ---------- */
  document.head.appendChild(el(`<style>
    @page { size: A4; margin: 12mm 10mm 14mm; }
    html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    * { animation: none !important; transition: none !important; }
    .print-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
    #printMuscles .print-grid, .print-protos .print-grid { grid-template-columns: 1fr 1fr; }
    .print-card, .kb-card, .kb-mini, .case-card, tr, li, figure { break-inside: avoid; }
    /* point cards are longer than a page: each starts on its own page and may continue */
    #printPoints .print-card { break-inside: auto; break-before: page; }
    #printPoints .print-card:first-child { break-before: auto; }
    #printPoints .print-card .kb-card, #printPoints .print-card > div { break-inside: auto; }
    h2, h3, .kb-h3 { break-after: avoid; }
    #atlas, #printPoints, #printMuscles, #pointsTable, #methods, #diagnosis, #videosSection, #cases, #technique, #glossary, #review, #videos, #foundations { break-before: page; }
    .print-protos { max-width: 80rem; margin: 0 auto 16px; padding: 0 1rem; }
    .print-toc { columns: 2; column-gap: 28px; padding-inline-start: 18px; list-style: decimal; font-size: 13px; line-height: 1.9; }
    .print-toc a { color: #0f5f5a; text-decoration: none; }
    a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 9px; color: #475569; direction: ltr; unicode-bidi: isolate; word-break: break-all; }
    .shadow-xl, .shadow-2xl, .shadow-lg, .shadow-md, .shadow { box-shadow: none !important; }
    #cheekSvg { max-height: none !important; }
  </style>`));
})(window.__BUILD_DATE__ || new Date().toISOString().slice(0, 10));
