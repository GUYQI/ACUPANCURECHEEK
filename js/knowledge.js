/* =====================================================================
   Knowledge layer UI — renders data/book-content.js + data/book-cases.js
   into the existing atlas and the new educational sections.
   Depends on globals from the inline atlas script: cheekPoints, cheekMuscles,
   selectPoint, selectMuscle, setProtocol, updatePointInspectorText, renderMusclesUI,
   renderStudyTable, selectedMuscleId.
   ===================================================================== */
(function () {
  "use strict";
  const BOOK = window.CA_BOOK;
  const CASES = window.CA_BOOK_CASES || [];
  if (!BOOK) return;

  // ---------------------------------------------------------------- helpers
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ptByCode = (code) => cheekPoints.find((p) => p.code === code);
  const muscleById = (id) => cheekMuscles.find((m) => m.id === id);
  const ptNum = (code) => parseInt(String(code).split("-")[1], 10);

  function src(page, extra) {
    if (!page) return "";
    return `<span class="src-ref" title="${esc(BOOK.meta.title)} · ${esc(BOOK.meta.author)}">📖 ${extra ? esc(extra) + " · " : ""}עמ' ${esc(page)}</span>`;
  }

  function chip(code, opts) {
    const pt = ptByCode(code);
    if (!pt) return "";
    const dark = pt.color === "#facc15";
    const label = opts && opts.short ? code : `${code} ${esc(pt.nameHe.split(" (")[0])}`;
    return `<button type="button" data-pt="${code}" class="pt-chip ${dark ? "text-slate-950" : "text-white"}" style="background:${pt.color}" title="פתח את ${code} באטלס">${label}</button>`;
  }
  const chips = (codes, opts) => (codes || []).slice().sort((a, b) => ptNum(a) - ptNum(b)).map((c) => chip(c, opts)).join("");

  function muscleChip(id) {
    const m = muscleById(id);
    if (!m) return "";
    return `<button type="button" data-muscle="${id}" class="muscle-chip" style="border-color:${m.color};color:${m.color}" title="פתח במפת השרירים"><span class="w-2 h-2 rounded-full inline-block" style="background:${m.color}"></span>${esc(m.nameHe.replace(/^\d+\.\s*/, ""))}</button>`;
  }

  // Glossary auto-linking (first occurrence per text block, plain text only)
  const GLOSS_PATTERNS = [
    ["microneedle", /מערכות המיקרו-דיקור|מערכות מיקרו-דיקור|מיקרו-דיקור/],
    ["dasanjiao", /המחמם המשולש הגדול/], ["qijie", /דרכי הצ'י/],
    ["holoelement", /יחידה הולוגרפית|העובר ההולוגרפי|עובר הולוגרפי/], ["xuequ", /אזורי נקודות|אזור נקודה/],
    ["dingwei", /נקודות מיקום|נקודת מיקום/], ["badian", /נקודות מטרה|נקודת מטרה|נקודת יעד|נקודת היעד/],
    ["somatization", /סומטיזציה/], ["fuzhen", /אבחון הבטן|אבחון בטן/], ["yinxing", /תחושת מחט סמויה/],
    ["feizhen", /דיקור מעופף/], ["chengjiang", /צ'נג-ג'יאנג/], ["deqi", /הגעת הצ'י|קבלת הצ'י/],
    ["qituan", /גוש צ'י/], ["miaoci", /מיאו-צ'י/], ["suture", /התפר הרקתי-זיגומטי/], ["pi", /ה"פי"|"פי"/]
  ];
  function gloss(text) {
    let html = esc(text);
    const used = new Set();
    GLOSS_PATTERNS.forEach(([id, re]) => {
      if (used.has(id)) return;
      const g = BOOK.glossary.find((x) => x.id === id);
      if (!g) return;
      const rx = new RegExp(re.source.replace(/"/g, "&quot;"));
      const m = html.match(rx);
      if (!m) return;
      // do not link inside an existing tag
      const before = html.slice(0, m.index);
      if (before.lastIndexOf("<") > before.lastIndexOf(">")) return;
      used.add(id);
      html = before + `<a href="#g-${id}" class="gloss-link" data-gloss="${id}" title="${esc(g.def)}">${m[0]}</a>` + html.slice(m.index + m[0].length);
    });
    return html;
  }

  function details(title, body, open, accent) {
    return `<details class="kb-details"${open ? " open" : ""}><summary><span class="${accent || "text-sky-300"}">${title}</span><span class="kb-caret">▾</span></summary><div class="kb-body">${body}</div></details>`;
  }

  // ---------------------------------------------------------------- navigation
  function scrollToEl(el) {
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function goToPoint(code) {
    if (!ptByCode(code)) return;
    if (typeof currentMode !== "undefined" && currentMode === "muscles") setProtocol("all");
    selectPoint(code);
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    scrollToEl(wide ? $("atlas") : $("pointInspectorCard"));
  }
  function goToMuscle(id) {
    if (!muscleById(id)) return;
    selectMuscle(id);
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    scrollToEl(wide ? $("atlas") : $("muscleInspectorCard"));
  }
  function goToGloss(id) {
    const el = $("g-" + id);
    if (!el) return;
    const search = $("glossSearch");
    if (search && search.value) { search.value = ""; renderGlossary(); }
    scrollToEl(el);
    el.classList.add("kb-flash");
    setTimeout(() => el.classList.remove("kb-flash"), 1600);
  }

  document.addEventListener("click", (e) => {
    const p = e.target.closest("[data-pt]");
    if (p) { e.preventDefault(); goToPoint(p.getAttribute("data-pt")); return; }
    const m = e.target.closest("[data-muscle]");
    if (m) { e.preventDefault(); goToMuscle(m.getAttribute("data-muscle")); return; }
    const g = e.target.closest("[data-gloss]");
    if (g) { e.preventDefault(); goToGloss(g.getAttribute("data-gloss")); return; }
    const c = e.target.closest("[data-case-filter-pt]");
    if (c) { e.preventDefault(); filterCasesByPoint(c.getAttribute("data-case-filter-pt")); return; }
    const r = e.target.closest("[data-review]");
    if (r) { e.preventDefault(); scrollToEl($("review")); }
  });

  // ---------------------------------------------------------------- data joins
  function musclesForPoint(code) {
    const out = [];
    Object.keys(BOOK.muscles).forEach((id) => {
      const m = BOOK.muscles[id];
      const inRel = (m.points || []).includes(code);
      const inDeep = (m.deepOf || []).includes(code);
      if (inRel || inDeep) out.push({ id, m, inRel, inDeep });
    });
    return out;
  }
  const casesForPoint = (code) => CASES.filter((c) => c.points.includes(code));
  const discrepanciesFor = (code) => BOOK.discrepancies.filter((d) => d.pts.includes(code));

  // ---------------------------------------------------------------- atlas: point panel
  function renderPointBook(code) {
    const host = $("bookPointPanel");
    const b = BOOK.points[code];
    if (!host) return;
    if (!b) { host.innerHTML = ""; return; }

    const disc = discrepanciesFor(code);
    const ms = musclesForPoint(code);
    const cs = casesForPoint(code);

    let html = `<div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">📖 לפי ספר המקור: ${esc(b.nameHe)} <span class="text-amber-400/90">${esc(b.cn)}</span></div>
        ${src(b.page, "איור " + b.figure)}
      </div>`;
    if (disc.length) {
      html += `<button type="button" data-review="1" class="kb-warn w-full text-right">⚠️ ${disc.length === 1 ? "קיים פער" : `קיימים ${disc.length} פערים`} בין תיאור האתר לספר בנקודה זו (${esc(disc.map((d) => d.topic).join(" · "))}) – לחצו לפירוט</button>`;
    }
    html += details("📐 מיקום סטנדרטי (לפי סימנים גרמיים)", `<p class="text-slate-100 font-medium">${gloss(b.location)}</p><p class="text-slate-500 mt-1">${esc(b.group)} · ${src(b.page)}</p>`, true);
    html += details("🔬 מבנה אנטומי בשכבות", `<p><strong class="text-slate-200">שכבה שטחית:</strong> ${esc(b.superficial)}</p><p class="mt-1"><strong class="text-slate-200">שכבה עמוקה:</strong> ${esc(b.deep)}</p><p class="text-slate-500 mt-1">טבלה 2-1-1 (מחקר אנטומי) · ${src("24, " + b.page)}</p>`);
    html += details(`🩺 התוויות עיקריות לפי הספר (${b.indications.length})`, `<div class="flex flex-wrap gap-1">${b.indications.map((i) => `<span class="kb-tag">${esc(i)}</span>`).join("")}</div><p class="text-slate-500 mt-1.5">טבלה 3-5-1 · ${src(b.page)}</p>`);
    if (ms.length) {
      html += details("💪 שרירים ומבנים קשורים", ms.map(({ id, m, inRel, inDeep }) =>
        `<div class="mb-1.5">${muscleChip(id)} <span class="text-slate-400">${inRel ? esc(m.relation) : "מופיע במבנה העמוק של הנקודה."}</span> ${src(inRel ? m.page : b.page)}</div>`).join(""));
    }
    if (b.notes && b.notes.length) {
      html += details("🔗 קשרים לנקודות אחרות והערות המחבר", b.notes.map((n) => `<div class="mb-1.5"><p>${gloss(n.text)} ${src(n.page)}</p>${n.pts ? `<div class="flex flex-wrap gap-1 mt-1">${chips(n.pts, { short: true })}</div>` : ""}</div>`).join(""));
    }
    if (cs.length) {
      const list = cs.slice(0, 6).map((c) => `<li><a href="#case-${esc(c.figure)}" class="text-sky-300 hover:text-white underline-offset-2 hover:underline" data-open-case="${esc(c.figure)}">${esc(c.title)}</a> <span class="text-slate-500">(${esc(c.layerName)}, עמ' ${c.page})</span></li>`).join("");
      html += details(`📚 מקרים קליניים בספר שבהם נבחרה הנקודה (${cs.length})`, `<ul class="list-disc pr-4 space-y-0.5">${list}</ul><button type="button" data-case-filter-pt="${code}" class="mt-2 text-amber-300 hover:text-white font-bold">← הצג את כל ${cs.length} המקרים במאגר</button>`);
    }
    host.innerHTML = html;
  }

  // ---------------------------------------------------------------- atlas: muscle panel
  function renderMuscleBook() {
    const host = $("bookMusclePanel");
    if (!host || typeof selectedMuscleId === "undefined") return;
    const m = BOOK.muscles[selectedMuscleId];
    const site = muscleById(selectedMuscleId);
    if (!m) { host.innerHTML = ""; return; }
    const siteSet = new Set(site ? site.relatedPoints : []);
    const bookSet = new Set(m.points);
    const same = siteSet.size === bookSet.size && [...siteSet].every((x) => bookSet.has(x));
    let html = `<div class="flex items-center justify-between gap-2 flex-wrap"><div class="text-xs font-extrabold text-amber-300">📖 לפי ספר המקור: ${esc(m.bookName)}</div>${src(m.page, m.figure ? "איור " + m.figure : "")}</div>`;
    html += `<p class="text-slate-200 mt-1.5">${esc(m.relation)}</p>`;
    html += `<div class="mt-2"><div class="text-[11px] font-bold text-slate-400 mb-1">נקודות הקשורות לשריר לפי הספר:</div><div class="flex flex-wrap gap-1">${chips(m.points, { short: false })}</div></div>`;
    if (m.deepOf && m.deepOf.length) {
      html += `<div class="mt-2"><div class="text-[11px] font-bold text-slate-400 mb-1">מופיע ב"מבנה העמוק" של הנקודות (טבלה 2-1-1):</div><div class="flex flex-wrap gap-1">${chips(m.deepOf, { short: true })}</div></div>`;
    }
    if (!same) {
      html += `<button type="button" data-review="1" class="kb-warn w-full text-right mt-2">⚠️ השיוך באתר (${esc([...siteSet].join(", ") || "–")}) שונה מהשיוך בספר – לפירוט</button>`;
    }
    if (m.anatomy) html += details("🦴 תיאור השריר בספר", `<p>${esc(m.anatomy)}</p>`);
    host.innerHTML = html;
  }

  // ---------------------------------------------------------------- foundations section
  function renderFoundations() {
    const host = $("foundationsBody");
    if (!host) return;
    const tagColor = (t) => (t.includes("ביו") ? "kb-badge-sky" : t.includes("המחבר") ? "kb-badge-amber" : "kb-badge-rose");
    host.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="kb-card lg:col-span-2">
          <h3 class="kb-h3">מהו דיקור הלחי</h3>
          <p>${gloss(BOOK.definition.text)} ${src(BOOK.definition.page)}</p>
          ${details("סיפור הגילוי (1991)", `<p>${esc(BOOK.discovery.text)} ${src(BOOK.discovery.page)}</p>`)}
        </div>
        <div class="kb-card">
          <h3 class="kb-h3">מקרא: סוגי הידע בפרק זה</h3>
          <ul class="space-y-1.5 text-xs">
            <li><span class="kb-badge kb-badge-rose">רפואה סינית קלאסית</span> מושגים ומקורות מהקלאסיקות (נֵי-ג'ינג וכו').</li>
            <li><span class="kb-badge kb-badge-sky">אנטומיה ביו-רפואית</span> ידע אנטומי מקובל.</li>
            <li><span class="kb-badge kb-badge-amber">תאוריית המחבר</span> הסברים והשערות של מפתח השיטה – אינם עובדה מדעית מבוססת.</li>
          </ul>
        </div>
      </div>
      <h3 class="kb-h3 mt-5">שישה יסודות תאורטיים ${src("10–13")}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        ${BOOK.theories.map((t) => `<div class="kb-card">
          <div class="flex items-start justify-between gap-2 mb-1.5"><h4 class="font-bold text-white text-sm">${esc(t.title)}</h4><span class="kb-badge ${tagColor(t.tag)}">${esc(t.tag)}</span></div>
          <p class="text-xs leading-relaxed">${gloss(t.text)}</p><div class="mt-1.5">${src(t.page)}</div></div>`).join("")}
      </div>
      <h3 class="kb-h3 mt-5">שלושת רובדי ההתוויות ${src(BOOK.layersNote.page)}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${BOOK.layers.map((l, i) => `<div class="kb-card" style="border-top:3px solid ${l.color}">
          <div class="text-[11px] font-bold text-slate-400">רובד ${i + 1}</div><h4 class="font-bold text-white text-sm mb-1">${esc(l.title)}</h4>
          <p class="text-xs leading-relaxed">${esc(l.text)}</p><div class="flex flex-wrap gap-1 mt-2">${chips(l.pts, { short: true })}</div></div>`).join("")}
      </div>
      <p class="text-xs text-slate-400 mt-2">${esc(BOOK.layersNote.text)}</p>`;
  }

  // ---------------------------------------------------------------- methods section
  function renderMethods() {
    const host = $("methodsBody");
    if (!host) return;
    const P = BOOK.pain;
    host.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="kb-card">
          <h3 class="kb-h3">עקרונות יישום הנקודות ${src("50–51")}</h3>
          <ul class="space-y-2 text-xs leading-relaxed">${BOOK.application.map((a) => `<li class="flex gap-2"><span class="text-amber-400 mt-0.5">◆</span><div>${gloss(a.text)} ${src(a.page)}${a.pts ? `<div class="flex flex-wrap gap-1 mt-1">${chips(a.pts, { short: true })}</div>` : ""}</div></li>`).join("")}</ul>
        </div>
        <div class="kb-card">
          <h3 class="kb-h3">שמונה שיטות לצירוף נקודות ${src(BOOK.selectionPage)}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${BOOK.selection.map((s, i) => `<div class="kb-mini"><div class="font-bold text-white text-xs mb-0.5">${i + 1}. ${esc(s.name)}</div><p class="text-[11px] text-slate-300 leading-relaxed">${gloss(s.example)}</p>${s.pts.length ? `<div class="flex flex-wrap gap-1 mt-1">${chips(s.pts, { short: true })}</div>` : ""}</div>`).join("")}</div>
        </div>
      </div>
      <div class="kb-card mt-4">
        <h3 class="kb-h3">שלוש תקופות הכאב ועקרונות הטיפול ${src(P.page)}</h3>
        <p class="text-xs text-slate-400 mb-2">${esc(P.intro)}</p>
        <div class="overflow-x-auto"><table class="kb-table kb-stack"><thead><tr><th>תקופה</th><th>מנגנון</th><th>מאפיינים</th><th>עיקרון טיפול</th><th>לפי הספר</th></tr></thead><tbody>
          ${P.stages.map((s) => `<tr><td data-label="תקופה" class="font-bold text-white">${esc(s.stage)}</td><td data-label="מנגנון">${esc(s.core)}</td><td data-label="מאפיינים">${esc(s.signs)}</td><td data-label="עיקרון טיפול" class="text-emerald-300">${esc(s.principle)}</td><td data-label="לפי הספר">${gloss(s.effect)}</td></tr>`).join("")}
        </tbody></table></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div class="kb-card">
          <h3 class="kb-h3">שיטות דיקור מיוחדות ${src(BOOK.special.page)}</h3>
          <ul class="list-disc pr-4 space-y-1.5 text-xs leading-relaxed">${BOOK.special.items.map((t) => `<li>${gloss(t)}</li>`).join("")}</ul>
        </div>
        <div class="kb-card">
          <h3 class="kb-h3">עקרונות הטיפול ${src(BOOK.principles.page)}</h3>
          ${BOOK.principles.items.map((p) => `<div class="kb-mini mb-2"><div class="font-bold text-white text-xs mb-0.5">${esc(p.title)}</div><p class="text-[11px] text-slate-300 leading-relaxed">${gloss(p.text)}</p></div>`).join("")}
        </div>
      </div>`;
  }

  // ---------------------------------------------------------------- diagnosis section
  function abdomenSvg() {
    // Conceptual diagram (book figs. 7-2-2 and 7-2-3): functional, not anatomical positions.
    return `<svg viewBox="0 0 345 300" direction="ltr" class="w-full max-w-sm mx-auto" role="img" aria-label="תרשים מושגי של חמשת הזאנג והמחמם המשולש בבטן">
      <defs><clipPath id="abdClip"><ellipse cx="160" cy="150" rx="120" ry="125"/></clipPath></defs>
      <g clip-path="url(#abdClip)">
        <rect x="0" y="0" width="320" height="105" fill="#facc15" fill-opacity="0.10"/>
        <rect x="0" y="105" width="320" height="90" fill="#facc15" fill-opacity="0.18"/>
        <rect x="0" y="195" width="320" height="110" fill="#facc15" fill-opacity="0.28"/>
      </g>
      <ellipse cx="160" cy="150" rx="120" ry="125" fill="none" stroke="#475569" stroke-width="2"/>
      <line x1="40" y1="105" x2="280" y2="105" stroke="#64748b" stroke-dasharray="4 4"/>
      <line x1="40" y1="195" x2="280" y2="195" stroke="#64748b" stroke-dasharray="4 4"/>
      <circle cx="160" cy="150" r="5" fill="#94a3b8"/>
      <g font-family="Heebo, sans-serif" font-size="13" font-weight="700" text-anchor="middle">
        <text x="160" y="62" fill="#f87171">心 לב · אש</text>
        <text x="160" y="174" fill="#fbbf24">脾 טחול · אדמה</text>
        <text x="160" y="250" fill="#60a5fa">肾 כליה · מים</text>
        <text x="82" y="140" fill="#e2e8f0">肺 ריאה</text><text x="82" y="156" fill="#94a3b8" font-size="10">(ימין המטופל)</text>
        <text x="238" y="140" fill="#4ade80">肝 כבד</text><text x="238" y="156" fill="#94a3b8" font-size="10">(שמאל המטופל)</text>
      </g>
      <g font-family="Heebo, sans-serif" font-size="10" fill="#fde68a" text-anchor="start">
        <text x="300" y="60">上焦</text><text x="300" y="154">中焦</text><text x="300" y="248">下焦</text>
      </g>
      <text x="160" y="296" text-anchor="middle" font-family="Heebo, sans-serif" font-size="10" fill="#64748b">מבט מלפנים על המטופל · מיקום תפקודי ולא אנטומי</text>
    </svg>`;
  }
  function renderDiagnosis() {
    const host = $("diagnosisBody");
    if (!host) return;
    const D = BOOK.diagnosis, A = D.abdomen;
    host.innerHTML = `
      <div class="kb-card">
        <h3 class="kb-h3">אבחון שרירים – הבסיס לרובד ההולוגרפי ${src(D.muscleIntro.page)}</h3>
        <p class="text-xs leading-relaxed">${gloss(D.muscleIntro.text)}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">${D.muscleGroups.map((g) => `<div class="kb-mini flex flex-col gap-1"><div class="flex items-center justify-between"><span class="font-bold text-white text-xs">${esc(g.name)}</span>${src(g.page)}</div><div class="flex flex-wrap gap-1">${chips(g.pts, { short: true })}</div></div>`).join("")}</div>
        <p class="text-[11px] text-slate-500 mt-2">${esc(D.muscleGroupsNote)}</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
        <div class="kb-card lg:col-span-2">
          <h3 class="kb-h3">מפת הבטן: חמשת הזאנג והמחמם המשולש ${src("142–143", "איורים 7-2-2, 7-2-3")}</h3>
          ${abdomenSvg()}
          <p class="text-[11px] text-slate-400 mt-2">${esc(A.fiveZang.text)}</p>
          <p class="text-[11px] text-slate-400 mt-1">${esc(A.sanjiao.text)} <span class="inline-flex gap-1 align-middle">${chips(["CA-2", "CA-3", "CA-4"], { short: true })}</span></p>
        </div>
        <div class="kb-card lg:col-span-3">
          <h3 class="kb-h3">אבחון הבטן בדיקור הלחי ${src(A.page)}</h3>
          <p class="text-xs leading-relaxed">${gloss(A.why)}</p>
          ${details("① הציר המרכזי והערכת הצ'י המקורי", `<p>${esc(A.axis.text)} ${src(A.axis.page)}</p>`, true)}
          ${details("② סדר הבדיקה ושיטת המישוש", `<p>${esc(A.order.text)} ${src(A.order.page)}</p><p class="mt-1">${esc(A.method.text)} ${src(A.method.page)}</p>`)}
          ${details("③ שמונת הממצאים בבטן", `<div class="overflow-x-auto"><table class="kb-table"><tbody>${A.signs.map((s) => `<tr><td class="font-bold text-amber-300 whitespace-nowrap">${esc(s.k)}</td><td>${gloss(s.v)}</td></tr>`).join("")}</tbody></table></div><div class="mt-1">${src("145")}</div>`)}
          ${details("④ דרישות ביצוע", `<ol class="list-decimal pr-4 space-y-1">${A.requirements.map((r) => `<li>${esc(r)}</li>`).join("")}</ol><div class="mt-1">${src("147–148")}</div>`)}
        </div>
      </div>`;
  }

  // ---------------------------------------------------------------- technique enrichment
  function renderTechniqueBook() {
    const host = $("techniqueBook");
    if (!host) return;
    const N = BOOK.needling, C = BOOK.contraindications;
    host.innerHTML = `
      <div class="kb-card">
        <h3 class="kb-h3">מכשירים וביצוע לפי ספר המקור ${src(N.page)}</h3>
        <dl class="space-y-1.5 text-xs leading-relaxed">${N.items.map((i) => `<div><dt class="inline font-bold text-white">${esc(i.k)}: </dt><dd class="inline">${gloss(i.v)}</dd></div>`).join("")}</dl>
        <p class="text-[11px] text-slate-400 mt-2">${esc(N.skin)} ${src("154")}</p>
      </div>
      <div class="kb-card border-rose-500/40">
        <h3 class="kb-h3 text-rose-300">התוויות נגד לפי ספר המקור ${src(C.page)}</h3>
        <ol class="list-decimal pr-4 space-y-1 text-xs leading-relaxed">${C.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>
        <p class="text-[11px] text-slate-400 mt-2"><strong class="text-slate-300">פרק 10 – הבטחת הבטיחות:</strong> ${esc(C.safety.text)} ${src(C.safety.page)}</p>
      </div>`;
  }

  // ---------------------------------------------------------------- case library
  const caseState = { layer: "all", region: "all", pt: "all", q: "" };
  function renderCaseFilters() {
    const regions = [...new Set(CASES.filter((c) => c.region).map((c) => c.region))];
    const layerSel = $("caseLayer"), regionSel = $("caseRegion"), ptSel = $("casePoint");
    if (!layerSel) return;
    layerSel.innerHTML = `<option value="all">כל הרבדים</option>` + [["holo", "הרובד ההולוגרפי"], ["sanjiao", "מחלות המחמם המשולש"], ["psych", "מחלות גוף-נפש"]].map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
    regionSel.innerHTML = `<option value="all">כל האזורים</option>` + regions.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join("");
    ptSel.innerHTML = `<option value="all">כל הנקודות</option>` + cheekPoints.map((p) => `<option value="${p.code}">${p.code} – ${esc(p.nameHe.split(" (")[0])} (${casesForPoint(p.code).length})</option>`).join("");
    layerSel.onchange = () => { caseState.layer = layerSel.value; renderCases(); };
    regionSel.onchange = () => { caseState.region = regionSel.value; renderCases(); };
    ptSel.onchange = () => { caseState.pt = ptSel.value; renderCases(); };
    $("caseSearch").oninput = (e) => { caseState.q = e.target.value.trim(); renderCases(); };
    $("caseReset").onclick = () => {
      Object.assign(caseState, { layer: "all", region: "all", pt: "all", q: "" });
      layerSel.value = regionSel.value = ptSel.value = "all"; $("caseSearch").value = ""; renderCases();
    };
  }
  function renderCases() {
    const host = $("casesList");
    if (!host) return;
    const q = caseState.q;
    const list = CASES.filter((c) =>
      (caseState.layer === "all" || c.layer === caseState.layer) &&
      (caseState.region === "all" || c.region === caseState.region) &&
      (caseState.pt === "all" || c.points.includes(caseState.pt)) &&
      (!q || c.title.includes(q) || c.text.includes(q)));
    $("casesCount").textContent = `${list.length} מתוך ${CASES.length} מקרים`;
    const flags = (c) => {
      const out = [];
      if (c.figure === "11-1-7-4") out.push("המקרה עוסק במטופלת בהריון, אף שהספר מונה הריון בין התוויות הנגד (עמ' 156, 190).");
      if (c.figure === "11-1-8-2") out.push("בטקסט נכתב \"נקודת העצה (CA-13)\"; לפי פרק 3 העצה היא CA-8 והירך CA-13.");
      return out.map((f) => `<div class="kb-warn mt-2">⚠️ ${esc(f)}</div>`).join("");
    };
    host.innerHTML = list.length ? list.map((c) => `
      <article id="case-${esc(c.figure)}" class="kb-card case-card">
        <div class="flex items-start justify-between gap-2">
          <h4 class="font-bold text-white text-sm leading-snug">${esc(c.title)}</h4>
          <span class="kb-badge ${c.layer === "holo" ? "kb-badge-rose" : c.layer === "sanjiao" ? "kb-badge-amber" : "kb-badge-violet"} shrink-0">${esc(c.layerName)}${c.region ? " · " + esc(c.region) : ""}</span>
        </div>
        ${c.diagnosis ? `<p class="text-[11px] text-slate-400 mt-1"><strong class="text-slate-300">אבחנה:</strong> ${esc(c.diagnosis)}</p>` : ""}
        <p class="text-xs text-slate-200 mt-1.5 leading-relaxed"><strong class="text-amber-300">טיפול ותוצאה:</strong> ${esc(c.treatment)}</p>
        <div class="flex flex-wrap gap-1 mt-2">${chips(c.points, { short: true })}</div>
        ${flags(c)}
        <details class="kb-details mt-2"><summary><span class="text-sky-300">תיאור המקרה המלא</span><span class="kb-caret">▾</span></summary><div class="kb-body"><p>${esc(c.text)}</p></div></details>
        <div class="mt-2">${src(c.page, "איור " + c.figure)}</div>
      </article>`).join("") : `<p class="text-sm text-slate-400">לא נמצאו מקרים התואמים לסינון.</p>`;
  }
  function filterCasesByPoint(code) {
    caseState.pt = code; caseState.layer = "all"; caseState.region = "all"; caseState.q = "";
    if ($("casePoint")) { $("casePoint").value = code; $("caseLayer").value = "all"; $("caseRegion").value = "all"; $("caseSearch").value = ""; }
    renderCases();
    scrollToEl($("cases"));
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-open-case]");
    if (!a) return;
    e.preventDefault();
    const fig = a.getAttribute("data-open-case");
    if (!$("case-" + fig)) { $("caseReset").click(); }
    const el = $("case-" + fig);
    if (el) { const d = el.querySelector("details"); if (d) d.open = true; scrollToEl(el); el.classList.add("kb-flash"); setTimeout(() => el.classList.remove("kb-flash"), 1600); }
  });

  // ---------------------------------------------------------------- glossary
  function renderGlossary() {
    const host = $("glossaryList");
    if (!host) return;
    const q = ($("glossSearch") && $("glossSearch").value.trim()) || "";
    const items = BOOK.glossary.filter((g) => !q || g.term.includes(q) || g.cn.includes(q) || g.def.includes(q));
    host.innerHTML = items.map((g) => `
      <div id="g-${g.id}" class="kb-mini">
        <div class="flex items-baseline justify-between gap-2"><dt class="font-bold text-white text-sm">${esc(g.term)}</dt><span class="text-amber-400 font-bold text-sm">${esc(g.cn)}</span></div>
        <dd class="text-xs text-slate-300 leading-relaxed mt-0.5">${esc(g.def)}</dd>
        <div class="mt-1">${src(g.page)}</div>
      </div>`).join("") || `<p class="text-sm text-slate-400">אין מונחים תואמים.</p>`;
  }

  // ---------------------------------------------------------------- review / discrepancies
  function renderReview() {
    const host = $("reviewList");
    if (!host) return;
    const lv = { high: ["גבוהה", "kb-badge-rose"], medium: ["בינונית", "kb-badge-amber"], low: ["נמוכה", "kb-badge-sky"] };
    host.innerHTML = BOOK.discrepancies.map((d) => `
      <div class="kb-card">
        <div class="flex items-start justify-between gap-2 mb-1.5"><h4 class="font-bold text-white text-sm">${esc(d.topic)}</h4><span class="kb-badge ${lv[d.level][1]} shrink-0">עדיפות ${lv[d.level][0]}</span></div>
        ${d.site !== "—" ? `<p class="text-xs"><strong class="text-sky-300">באתר:</strong> ${esc(d.site.replace(/^באתר[^:]*:\s*/, ""))}</p>` : ""}
        <p class="text-xs mt-1"><strong class="text-amber-300">בספר:</strong> ${esc(d.book.replace(/^בספר:?\s*/, ""))}</p>
        <p class="text-xs mt-1 text-emerald-300"><strong>המלצה:</strong> ${esc(d.action)}</p>
        ${d.pts.length ? `<div class="flex flex-wrap gap-1 mt-2">${chips(d.pts, { short: true })}</div>` : ""}
      </div>`).join("");
  }

  // ---------------------------------------------------------------- points table: book wording toggle
  function enhanceStudyTable() {
    const toggle = $("tableBookToggle");
    if (!toggle) return;
    const show = toggle.checked;
    document.querySelectorAll("#studyTableBody tr").forEach((tr, i) => {
      const pt = cheekPoints[i];
      if (!pt) return;
      const b = BOOK.points[pt.code];
      const loc = tr.querySelector('td[data-label="מיקום"]');
      const ind = tr.querySelector('td[data-label="התוויות"]');
      tr.querySelectorAll(".book-line").forEach((n) => n.remove());
      if (!show || !b) return;
      loc.insertAdjacentHTML("beforeend", `<div class="book-line">📖 ${esc(b.location)} <span class="text-slate-500">(עמ' ${esc(b.page)})</span></div>`);
      ind.insertAdjacentHTML("beforeend", `<div class="book-line">📖 ${esc(b.indications.join(", "))}</div>`);
    });
  }

  // ---------------------------------------------------------------- hook into the existing atlas
  const _upd = window.updatePointInspectorText;
  window.updatePointInspectorText = function (code) { _upd(code); renderPointBook(code); };
  const _mus = window.renderMusclesUI;
  window.renderMusclesUI = function () { _mus(); renderMuscleBook(); };
  const _tbl = window.renderStudyTable;
  if (_tbl) window.renderStudyTable = function () { _tbl(); enhanceStudyTable(); };

  function init() {
    renderFoundations();
    renderMethods();
    renderDiagnosis();
    renderTechniqueBook();
    renderCaseFilters();
    renderCases();
    renderGlossary();
    renderReview();
    if ($("glossSearch")) $("glossSearch").oninput = renderGlossary;
    if ($("tableBookToggle")) $("tableBookToggle").onchange = enhanceStudyTable;
    if ($("casesIntro")) $("casesIntro").innerHTML = `${esc(BOOK.casesIntro.text)} ${src(BOOK.casesIntro.page)}`;
    renderPointBook(typeof selectedPointCode !== "undefined" ? selectedPointCode : "CA-4");
    renderMuscleBook();
    enhanceStudyTable();
    if (location.hash && /^#(case-|g-)/.test(location.hash)) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => scrollToEl(el), 200);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
