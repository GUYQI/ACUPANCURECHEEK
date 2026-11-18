/* =====================================================================
   Knowledge layer UI — renders data/book-content.js + data/book-cases.js
   into the atlas inspector and the educational sections.
   Depends on globals from js/atlas-data.js and js/atlas.js.
   ===================================================================== */
(function () {
  "use strict";
  const BOOK = window.CA_BOOK;
  const CASES = window.CA_BOOK_CASES || [];

  // ---------------------------------------------------------------- helpers
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ptByCode = (code) => cheekPoints.find((p) => p.code === code);
  const muscleById = (id) => cheekMuscles.find((m) => m.id === id);
  const ptNum = (code) => parseInt(String(code).split("-")[1], 10);
  const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;

  function src(page, extra) {
    if (!page || !BOOK) return "";
    return `<span class="src-ref" title="${esc(BOOK.meta.title)} · ${esc(BOOK.meta.author)}">${extra ? esc(extra) + " · " : ""}עמ' ${esc(page)}</span>`;
  }
  function chip(code) {
    const pt = ptByCode(code);
    if (!pt) return "";
    return `<button type="button" data-pt="${code}" class="pt-chip" title="פתח את ${code} באטלס"><i style="background:${pt.color}"></i><span class="code">${code}</span><span>${esc(pt.nameHe.split(" (")[0])}</span></button>`;
  }
  const chips = (codes) => `<div class="chips">${(codes || []).slice().sort((a, b) => ptNum(a) - ptNum(b)).map(chip).join("")}</div>`;
  function muscleChip(id) {
    const m = muscleById(id);
    if (!m) return "";
    return `<button type="button" data-muscle="${id}" class="muscle-chip" title="פתח במפת השרירים"><i style="background:${m.color}"></i>${esc(m.nameHe.replace(/^\d+\.\s*/, ""))}</button>`;
  }
  function acc(title, body, open) {
    return `<details class="acc"${open ? " open" : ""}><summary>${title}</summary><div class="acc-body">${body}</div></details>`;
  }
  const warn = (html, asButton) => asButton
    ? `<button type="button" data-review="1" class="callout">${icon("warn")}<span>${html}</span></button>`
    : `<div class="callout">${icon("warn")}<span>${html}</span></div>`;

  // Glossary auto-linking (first occurrence per text block)
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
    if (!BOOK) return html;
    GLOSS_PATTERNS.forEach(([id, re]) => {
      const g = BOOK.glossary.find((x) => x.id === id);
      if (!g) return;
      const m = html.match(new RegExp(re.source.replace(/"/g, "&quot;")));
      if (!m) return;
      const before = html.slice(0, m.index);
      if (before.lastIndexOf("<") > before.lastIndexOf(">")) return;
      html = before + `<a href="#g-${id}" class="gloss-link" data-gloss="${id}" title="${esc(g.def)}">${m[0]}</a>` + html.slice(m.index + m[0].length);
    });
    return html;
  }

  // ---------------------------------------------------------------- navigation
  const wide = () => window.matchMedia("(min-width: 1100px)").matches;
  const scrollToEl = (el) => el && el.scrollIntoView({ behavior: "smooth", block: "start" });
  function goToPoint(code) {
    if (!ptByCode(code)) return;
    if (currentMode === "muscles") setProtocol("all");
    selectPoint(code);
    scrollToEl(wide() ? $("atlas") : $("pointInspectorCard"));
  }
  function goToMuscle(id) {
    if (!muscleById(id)) return;
    selectMuscle(id);
    scrollToEl(wide() ? $("atlas") : $("muscleInspectorCard"));
  }
  function flash(el) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
  function goToGloss(id) {
    const search = $("glossSearch");
    if (search && search.value) { search.value = ""; renderGlossary(); }
    const el = $("g-" + id);
    if (!el) return;
    scrollToEl(el); flash(el);
  }
  window.CA_goToPoint = goToPoint;

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-pt],[data-muscle],[data-gloss],[data-case-filter-pt],[data-review],[data-open-case]");
    if (!t) return;
    e.preventDefault();
    if (t.dataset.pt) goToPoint(t.dataset.pt);
    else if (t.dataset.muscle) goToMuscle(t.dataset.muscle);
    else if (t.dataset.gloss) goToGloss(t.dataset.gloss);
    else if (t.dataset.caseFilterPt) filterCasesByPoint(t.dataset.caseFilterPt);
    else if (t.dataset.review) scrollToEl($("review"));
    else if (t.dataset.openCase) openCase(t.dataset.openCase);
  });

  if (!BOOK) return;

  // ---------------------------------------------------------------- data joins
  function musclesForPoint(code) {
    return Object.keys(BOOK.muscles).map((id) => {
      const m = BOOK.muscles[id];
      return { id, m, inRel: (m.points || []).includes(code), inDeep: (m.deepOf || []).includes(code) };
    }).filter((x) => x.inRel || x.inDeep);
  }
  const casesForPoint = (code) => CASES.filter((c) => c.points.includes(code));
  const discrepanciesFor = (code) => BOOK.discrepancies.filter((d) => d.pts.includes(code));

  // ---------------------------------------------------------------- atlas: point panel
  function renderPointBook(code) {
    const host = $("bookPointPanel");
    const b = BOOK.points[code];
    if (!host) return;
    if (!b) { host.innerHTML = ""; return; }
    const disc = discrepanciesFor(code), ms = musclesForPoint(code), cs = casesForPoint(code);
    let html = `<div class="bp-head"><b>לפי ספר המקור: ${esc(b.nameHe)} <span lang="zh">${esc(b.cn)}</span></b>${src(b.page, "איור " + b.figure)}</div>`;
    if (disc.length) html += warn(`${disc.length === 1 ? "קיים פער" : `קיימים ${disc.length} פערים`} בין תיאור האתר לספר בנקודה זו (${esc(disc.map((d) => d.topic).join(" · "))}) – לפירוט`, true);
    html += acc("מיקום סטנדרטי (לפי סימנים גרמיים)", `<p>${gloss(b.location)}</p><p class="xs muted" style="margin-top:.35rem">${esc(b.group)} · ${src(b.page)}</p>`, true);
    html += acc("מבנה אנטומי בשכבות", `<p><strong>שכבה שטחית:</strong> ${esc(b.superficial)}</p><p><strong>שכבה עמוקה:</strong> ${esc(b.deep)}</p><p class="xs muted" style="margin-top:.35rem">טבלה 2-1-1 (מחקר אנטומי) · ${src("24, " + b.page)}</p>`);
    html += acc(`התוויות עיקריות לפי הספר (${b.indications.length})`, `<div class="chips">${b.indications.map((i) => `<span class="tag">${esc(i)}</span>`).join("")}</div><p class="xs muted" style="margin-top:.45rem">טבלה 3-5-1 · ${src(b.page)}</p>`);
    if (ms.length) html += acc("שרירים ומבנים קשורים", ms.map(({ id, m, inRel }) => `<div style="margin-bottom:.55rem">${muscleChip(id)}<p class="small" style="margin-top:.3rem">${inRel ? esc(m.relation) : "מופיע במבנה העמוק של הנקודה."} ${src(inRel ? m.page : b.page)}</p></div>`).join(""));
    if (b.notes && b.notes.length) html += acc("קשרים לנקודות אחרות והערות המחבר", b.notes.map((n) => `<div style="margin-bottom:.6rem"><p>${gloss(n.text)} ${src(n.page)}</p>${n.pts ? `<div style="margin-top:.35rem">${chips(n.pts)}</div>` : ""}</div>`).join(""));
    if (cs.length) {
      const list = cs.slice(0, 6).map((c) => `<li><a href="#case-${esc(c.figure)}" data-open-case="${esc(c.figure)}">${esc(c.title)}</a> <span class="xs muted">(${esc(c.layerName)}, עמ' ${c.page})</span></li>`).join("");
      html += acc(`מקרים קליניים בספר שבהם נבחרה הנקודה (${cs.length})`, `<ul class="list">${list}</ul><button type="button" data-case-filter-pt="${code}" class="btn btn-ghost btn-sm" style="margin-top:.4rem">הצג את כל ${cs.length} המקרים במאגר ${icon("arrow")}</button>`);
    }
    host.innerHTML = html;
  }

  // ---------------------------------------------------------------- atlas: muscle panel
  function renderMuscleBook() {
    const host = $("bookMusclePanel");
    if (!host) return;
    const m = BOOK.muscles[selectedMuscleId];
    const site = muscleById(selectedMuscleId);
    if (!m) { host.innerHTML = ""; return; }
    const siteSet = new Set(site ? site.relatedPoints : []);
    const same = siteSet.size === m.points.length && m.points.every((x) => siteSet.has(x));
    let html = `<div class="bp-head"><b>לפי ספר המקור: ${esc(m.bookName)}</b>${src(m.page, m.figure ? "איור " + m.figure : "")}</div>`;
    html += `<p class="small" style="margin-bottom:.6rem">${esc(m.relation)}</p>`;
    html += `<span class="label">נקודות הקשורות לשריר לפי הספר:</span><div style="margin:.35rem 0 .6rem">${chips(m.points)}</div>`;
    if (m.deepOf && m.deepOf.length) html += `<span class="label">מופיע ב"מבנה העמוק" של הנקודות (טבלה 2-1-1):</span><div style="margin:.35rem 0 .6rem">${chips(m.deepOf)}</div>`;
    if (!same) html += warn(`השיוך באתר (${esc([...siteSet].join(", ") || "–")}) שונה מהשיוך בספר – לפירוט`, true);
    if (m.anatomy) html += acc("תיאור השריר בספר", `<p>${esc(m.anatomy)}</p>`);
    host.innerHTML = html;
  }

  // ---------------------------------------------------------------- muscles index section
  function renderMusclesIndex() {
    const host = $("musclesIndex");
    if (!host) return;
    const ordered = cheekMuscles.slice().sort((a, b) => parseInt(a.nameHe, 10) - parseInt(b.nameHe, 10));
    host.innerHTML = ordered.map((m) => {
      const bm = BOOK.muscles[m.id];
      const num = parseInt(m.nameHe, 10);
      return `<article class="card muscle-card reveal">
        <div class="mc-top"><span class="mc-sw" style="background:${m.color}">${num}</span>
          <div><h3>${esc(m.nameHe.replace(/^\d+\.\s*/, ""))}</h3><div class="en" lang="en">${esc(m.nameEn)}</div><span class="badge" style="margin-top:.35rem">${esc(m.badge)}</span></div></div>
        <div>
          ${acc("תחל ואחז (מאיפה לאיפה השריר עובר)", `<p>${esc(m.anatomy)}</p>`, true)}
          ${acc("איך להקפיץ ולמשש אותו בקליניקה", `<p>${esc(m.palpation)}</p>`)}
          ${acc("נקודות הדיקור שעל השריר ובגבולותיו", `<p>${esc(m.pointsDesc)}</p><div style="margin-top:.5rem">${chips(m.relatedPoints)}</div>`)}
          ${bm ? acc("לפי ספר המקור", `<p>${esc(bm.relation)} ${src(bm.page)}</p><div style="margin-top:.5rem">${chips(bm.points)}</div>`) : ""}
        </div>
        <div class="mc-foot"><span class="xs muted">${m.relatedPoints.length} נקודות קשורות</span><button type="button" class="btn btn-secondary btn-sm" data-muscle="${m.id}">הצג במפה</button></div>
      </article>`;
    }).join("");
  }

  // ---------------------------------------------------------------- foundations
  function renderFoundations() {
    const host = $("foundationsBody");
    if (!host) return;
    const tagBadge = (t) => (t.includes("ביו") ? "badge-sky" : t.includes("המחבר") ? "badge-amber" : "badge-rose");
    host.innerHTML = `
      <div class="grid found-top">
        <article class="card reveal">
          <div class="card-head"><h3>מהו דיקור הלחי</h3>${src(BOOK.definition.page)}</div>
          <p>${gloss(BOOK.definition.text)}</p>
          <div style="margin-top:.6rem">${acc("סיפור הגילוי (1991)", `<p>${esc(BOOK.discovery.text)} ${src(BOOK.discovery.page)}</p>`)}</div>
        </article>
        <article class="card flat reveal">
          <h3>מקרא: סוגי הידע בפרק זה</h3>
          <ul class="list" style="list-style:none;padding:0;gap:.7rem">
            <li><span class="badge badge-rose">רפואה סינית קלאסית</span><br><span class="small muted">מושגים ומקורות מהקלאסיקות (נֵי-ג'ינג וכו').</span></li>
            <li><span class="badge badge-sky">אנטומיה ביו-רפואית</span><br><span class="small muted">ידע אנטומי מקובל.</span></li>
            <li><span class="badge badge-amber">תאוריית המחבר</span><br><span class="small muted">הסברים והשערות של מפתח השיטה – אינם עובדה מדעית מבוססת.</span></li>
          </ul>
        </article>
      </div>
      <div class="sub-head"><h3>שישה יסודות תאורטיים</h3>${src("10–13")}</div>
      <div class="grid g-3 sm-2">
        ${BOOK.theories.map((t) => `<article class="card reveal"><div class="card-head"><h4>${esc(t.title)}</h4><span class="badge ${tagBadge(t.tag)}">${esc(t.tag)}</span></div><p class="small">${gloss(t.text)}</p><div style="margin-top:.6rem">${src(t.page)}</div></article>`).join("")}
      </div>
      <div class="sub-head"><h3>שלושת רובדי ההתוויות</h3>${src(BOOK.layersNote.page)}</div>
      <div class="grid g-3">
        ${BOOK.layers.map((l, i) => `<article class="card reveal" style="border-top:3px solid ${l.color}"><span class="label">רובד ${i + 1}</span><h4 style="margin:.2rem 0 .4rem">${esc(l.title)}</h4><p class="small">${esc(l.text)}</p><div style="margin-top:.75rem">${chips(l.pts)}</div></article>`).join("")}
      </div>
      <p class="small muted" style="margin-top:1rem">${esc(BOOK.layersNote.text)}</p>`;
  }

  // ---------------------------------------------------------------- methods
  function renderMethods() {
    const host = $("methodsBody");
    if (!host) return;
    const P = BOOK.pain;
    host.innerHTML = `
      <div class="grid g-2">
        <article class="card reveal">
          <div class="card-head"><h3>עקרונות יישום הנקודות</h3>${src("50–51")}</div>
          <ul class="list">${BOOK.application.map((a) => `<li><p>${gloss(a.text)} ${src(a.page)}</p>${a.pts ? `<div style="margin-top:.4rem">${chips(a.pts)}</div>` : ""}</li>`).join("")}</ul>
        </article>
        <article class="card reveal">
          <div class="card-head"><h3>שמונה שיטות לצירוף נקודות</h3>${src(BOOK.selectionPage)}</div>
          <div class="grid auto-tiles">${BOOK.selection.map((s, i) => `<div class="tile"><h4><span class="code" style="color:var(--sage)">${i + 1}.</span> ${esc(s.name)}</h4><p>${gloss(s.example)}</p>${s.pts.length ? `<div style="margin-top:.45rem">${chips(s.pts)}</div>` : ""}</div>`).join("")}</div>
        </article>
      </div>
      <article class="card reveal" style="margin-top:20px">
        <div class="card-head"><h3>שלוש תקופות הכאב ועקרונות הטיפול</h3>${src(P.page)}</div>
        <p class="small muted" style="margin-bottom:.8rem">${esc(P.intro)}</p>
        <div class="inner-table"><table class="table stack compact"><thead><tr><th>תקופה</th><th>מנגנון</th><th>מאפיינים</th><th>עיקרון טיפול</th><th>לפי הספר</th></tr></thead><tbody>
          ${P.stages.map((s) => `<tr><td data-label="תקופה"><strong>${esc(s.stage)}</strong></td><td data-label="מנגנון">${esc(s.core)}</td><td data-label="מאפיינים">${esc(s.signs)}</td><td data-label="עיקרון טיפול" style="color:var(--primary-700);font-weight:600">${esc(s.principle)}</td><td data-label="לפי הספר">${gloss(s.effect)}</td></tr>`).join("")}
        </tbody></table></div>
      </article>
      <div class="grid g-2" style="margin-top:20px">
        <article class="card reveal"><div class="card-head"><h3>שיטות דיקור מיוחדות</h3>${src(BOOK.special.page)}</div><ul class="list">${BOOK.special.items.map((t) => `<li>${gloss(t)}</li>`).join("")}</ul></article>
        <article class="card reveal"><div class="card-head"><h3>עקרונות הטיפול</h3>${src(BOOK.principles.page)}</div><div class="grid" style="--gap:.6rem">${BOOK.principles.items.map((p) => `<div class="tile"><h4>${esc(p.title)}</h4><p>${gloss(p.text)}</p></div>`).join("")}</div></article>
      </div>`;
  }

  // ---------------------------------------------------------------- diagnosis
  function abdomenSvg() {
    // Conceptual diagram (book figs. 7-2-2 and 7-2-3): functional, not anatomical positions.
    return `<svg viewBox="0 0 345 300" direction="ltr" role="img" aria-label="תרשים מושגי של חמשת הזאנג והמחמם המשולש בבטן">
      <defs><clipPath id="abdClip"><ellipse cx="160" cy="150" rx="120" ry="125"/></clipPath></defs>
      <g clip-path="url(#abdClip)">
        <rect x="0" y="0" width="345" height="105" fill="#DDF1E9"/>
        <rect x="0" y="105" width="345" height="90" fill="#C9E6DA"/>
        <rect x="0" y="195" width="345" height="110" fill="#B4D8C9"/>
      </g>
      <ellipse cx="160" cy="150" rx="120" ry="125" fill="none" stroke="#91B7A9" stroke-width="2"/>
      <line x1="40" y1="105" x2="280" y2="105" stroke="#91B7A9" stroke-dasharray="4 4"/>
      <line x1="40" y1="195" x2="280" y2="195" stroke="#91B7A9" stroke-dasharray="4 4"/>
      <circle cx="160" cy="150" r="4" fill="#647373"/>
      <g font-family="Heebo, sans-serif" font-size="13" font-weight="700" text-anchor="middle" fill="#202B2B">
        <text x="160" y="62">心 לב · אש</text>
        <text x="160" y="174">脾 טחול · אדמה</text>
        <text x="160" y="250">肾 כליה · מים</text>
        <text x="82" y="140">肺 ריאה</text><text x="82" y="156" fill="#647373" font-size="10" font-weight="500">(ימין המטופל)</text>
        <text x="238" y="140">肝 כבד</text><text x="238" y="156" fill="#647373" font-size="10" font-weight="500">(שמאל המטופל)</text>
      </g>
      <g font-family="Noto Sans SC, sans-serif" font-size="11" fill="#176B67" font-weight="600">
        <text x="300" y="60">上焦</text><text x="300" y="154">中焦</text><text x="300" y="248">下焦</text>
      </g>
      <text x="160" y="296" text-anchor="middle" font-family="Heebo, sans-serif" font-size="10" fill="#647373">מבט מלפנים על המטופל · מיקום תפקודי ולא אנטומי</text>
    </svg>`;
  }
  function renderDiagnosis() {
    const host = $("diagnosisBody");
    if (!host) return;
    const D = BOOK.diagnosis, A = D.abdomen;
    host.innerHTML = `
      <article class="card reveal">
        <div class="card-head"><h3>אבחון שרירים – הבסיס לרובד ההולוגרפי</h3>${src(D.muscleIntro.page)}</div>
        <p>${gloss(D.muscleIntro.text)}</p>
        <div class="grid g-4" style="--gap:.6rem;margin-top:1rem">${D.muscleGroups.map((g) => `<div class="tile"><div class="row between" style="margin-bottom:.4rem"><h4 style="margin:0">${esc(g.name)}</h4>${src(g.page)}</div>${chips(g.pts)}</div>`).join("")}</div>
        <p class="xs muted" style="margin-top:.8rem">${esc(D.muscleGroupsNote)}</p>
      </article>
      <div class="grid g-2" style="margin-top:20px">
        <article class="card reveal abd">
          <div class="card-head"><h3>מפת הבטן: חמשת הזאנג והמחמם המשולש</h3>${src("142–143", "איורים 7-2-2, 7-2-3")}</div>
          ${abdomenSvg()}
          <p class="small muted" style="margin-top:.8rem">${esc(A.fiveZang.text)}</p>
          <p class="small muted" style="margin-top:.4rem">${esc(A.sanjiao.text)}</p>
          <div style="margin-top:.5rem">${chips(["CA-2", "CA-3", "CA-4"])}</div>
        </article>
        <article class="card reveal">
          <div class="card-head"><h3>אבחון הבטן בדיקור הלחי</h3>${src(A.page)}</div>
          <p style="margin-bottom:.5rem">${gloss(A.why)}</p>
          ${acc("1 · הציר המרכזי והערכת הצ'י המקורי", `<p>${esc(A.axis.text)} ${src(A.axis.page)}</p>`, true)}
          ${acc("2 · סדר הבדיקה ושיטת המישוש", `<p>${esc(A.order.text)} ${src(A.order.page)}</p><p>${esc(A.method.text)} ${src(A.method.page)}</p>`)}
          ${acc("3 · שמונת הממצאים בבטן", `<table class="table compact"><tbody>${A.signs.map((s) => `<tr><td style="white-space:nowrap;font-weight:700;color:var(--primary-700)">${esc(s.k)}</td><td>${gloss(s.v)}</td></tr>`).join("")}</tbody></table><div style="margin-top:.4rem">${src("145")}</div>`)}
          ${acc("4 · דרישות ביצוע", `<ol class="list">${A.requirements.map((r) => `<li>${esc(r)}</li>`).join("")}</ol><div style="margin-top:.4rem">${src("147–148")}</div>`)}
        </article>
      </div>`;
  }

  // ---------------------------------------------------------------- technique (book)
  function renderTechniqueBook() {
    const host = $("techniqueBook");
    if (!host) return;
    const N = BOOK.needling, C = BOOK.contraindications;
    host.innerHTML = `
      <article class="card tint">
        <div class="card-head"><h3>מכשירים וביצוע לפי ספר המקור</h3>${src(N.page)}</div>
        <dl class="grid" style="--gap:.6rem">${N.items.map((i) => `<div class="kv"><dt>${esc(i.k)}</dt><dd>${gloss(i.v)}</dd></div>`).join("")}</dl>
        <p class="small muted" style="margin-top:.8rem">${esc(N.skin)} ${src("154")}</p>
      </article>
      <article class="card" style="border-color:var(--danger-border)">
        <div class="card-head"><h3>התוויות נגד לפי ספר המקור</h3>${src(C.page)}</div>
        <ol class="list">${C.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>
        <div class="callout danger" style="margin-top:.9rem">${icon("warn")}<span><strong>פרק 10 – הבטחת הבטיחות:</strong> ${esc(C.safety.text)} ${src(C.safety.page)}</span></div>
      </article>`;
  }

  // ---------------------------------------------------------------- cervical protocol card (from protocolConfigs)
  function renderCervical() {
    const host = $("cervicalProtocol");
    const c = typeof protocolConfigs !== "undefined" && protocolConfigs.cervical;
    if (!host || !c) return;
    const pts = cheekPoints.filter((p) => p.protocols.includes("cervical")).map((p) => p.code);
    host.innerHTML = `
      <div class="p-head"><div><span class="badge badge-teal">פרוטוקול מפה</span><h3>${esc(c.title)}</h3></div>
        <button type="button" class="btn btn-secondary btn-sm" data-highlight="cervical">הדגש נקודות במפה למעלה</button></div>
      <p class="muted">${esc(c.desc)}</p>
      <div class="grid g-3" style="--gap:.75rem">
        <div class="tile"><span class="label">סדר בחירת הנקודות המדויק:</span><p style="margin-top:.3rem">${esc(c.pointsList)}</p></div>
        <div class="tile"><span class="label">צד הדיקור (חד-צדדי מול דו-צדדי):</span><p style="margin-top:.3rem">${esc(c.sideRule)}</p></div>
        <div class="tile"><span class="label">בדיקת אימות מיידית (אבחנת בטן/תנועה):</span><p style="margin-top:.3rem">${esc(c.verification)}</p></div>
      </div>
      ${chips(pts)}`;
  }
  function renderProtoChips() {
    document.querySelectorAll("[data-proto-points]").forEach((el) => {
      const key = el.dataset.protoPoints;
      el.innerHTML = `<span class="label" style="width:100%">נקודות הפרוטוקול באטלס:</span>` + cheekPoints.filter((p) => p.protocols.includes(key)).map((p) => chip(p.code)).join("");
    });
  }

  // ---------------------------------------------------------------- case library
  const PAGE = 12;
  const caseState = { layer: "all", region: "all", pt: "all", q: "", shown: PAGE };
  function renderCaseFilters() {
    const layerSel = $("caseLayer"), regionSel = $("caseRegion"), ptSel = $("casePoint");
    if (!layerSel) return;
    const regions = [...new Set(CASES.filter((c) => c.region).map((c) => c.region))];
    layerSel.innerHTML = `<option value="all">כל הרבדים</option>` + [["holo", "הרובד ההולוגרפי"], ["sanjiao", "מחלות המחמם המשולש"], ["psych", "מחלות גוף-נפש"]].map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
    regionSel.innerHTML = `<option value="all">כל האזורים</option>` + regions.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join("");
    ptSel.innerHTML = `<option value="all">כל הנקודות</option>` + cheekPoints.map((p) => `<option value="${p.code}">${p.code} – ${esc(p.nameHe.split(" (")[0])} (${casesForPoint(p.code).length})</option>`).join("");
    const reset = () => { caseState.shown = PAGE; renderCases(); };
    layerSel.onchange = () => { caseState.layer = layerSel.value; reset(); };
    regionSel.onchange = () => { caseState.region = regionSel.value; reset(); };
    ptSel.onchange = () => { caseState.pt = ptSel.value; reset(); };
    $("caseSearch").oninput = (e) => { caseState.q = e.target.value.trim(); reset(); };
    $("caseReset").onclick = () => {
      Object.assign(caseState, { layer: "all", region: "all", pt: "all", q: "", shown: PAGE });
      layerSel.value = regionSel.value = ptSel.value = "all"; $("caseSearch").value = ""; renderCases();
    };
    $("casesMore").onclick = () => { caseState.shown += PAGE; renderCases(); };
  }
  function filteredCases() {
    const q = caseState.q;
    return CASES.filter((c) =>
      (caseState.layer === "all" || c.layer === caseState.layer) &&
      (caseState.region === "all" || c.region === caseState.region) &&
      (caseState.pt === "all" || c.points.includes(caseState.pt)) &&
      (!q || c.title.includes(q) || c.text.includes(q)));
  }
  function renderCases() {
    const host = $("casesList");
    if (!host) return;
    const list = filteredCases();
    const shown = list.slice(0, caseState.shown);
    $("casesCount").textContent = `${list.length} מתוך ${CASES.length} מקרים`;
    $("casesMore").hidden = shown.length >= list.length;
    if (!$("casesMore").hidden) $("casesMore").textContent = `הצג מקרים נוספים (${list.length - shown.length})`;
    const flags = (c) => {
      const out = [];
      if (c.figure === "11-1-7-4") out.push("המקרה עוסק במטופלת בהריון, אף שהספר מונה הריון בין התוויות הנגד (עמ' 156, 190).");
      if (c.figure === "11-1-8-2") out.push("בטקסט נכתב \"נקודת העצה (CA-13)\"; לפי פרק 3 העצה היא CA-8 והירך CA-13.");
      return out.map((f) => warn(esc(f))).join("");
    };
    const layerBadge = (l) => (l === "holo" ? "badge-rose" : l === "sanjiao" ? "badge-amber" : "badge-violet");
    host.innerHTML = shown.length ? shown.map((c) => `
      <article id="case-${esc(c.figure)}" class="card case-card">
        <div class="row"><span class="badge ${layerBadge(c.layer)}">${esc(c.layerName)}</span>${c.region ? `<span class="badge">${esc(c.region)}</span>` : ""}</div>
        <h4>${esc(c.title)}</h4>
        ${c.diagnosis ? `<p class="small muted"><strong>אבחנה:</strong> ${esc(c.diagnosis)}</p>` : ""}
        <p class="tr"><strong>טיפול ותוצאה:</strong> ${esc(c.treatment)}</p>
        ${chips(c.points)}
        ${flags(c)}
        ${acc("תיאור המקרה המלא", `<p>${esc(c.text)}</p>`)}
        <div class="meta">${src(c.page, "איור " + c.figure)}</div>
      </article>`).join("") : `<p class="muted">לא נמצאו מקרים התואמים לסינון.</p>`;
  }
  function filterCasesByPoint(code) {
    Object.assign(caseState, { pt: code, layer: "all", region: "all", q: "", shown: PAGE });
    if ($("casePoint")) { $("casePoint").value = code; $("caseLayer").value = "all"; $("caseRegion").value = "all"; $("caseSearch").value = ""; }
    renderCases();
    scrollToEl($("cases"));
  }
  function openCase(fig) {
    let el = $("case-" + fig);
    if (!el) {
      Object.assign(caseState, { layer: "all", region: "all", pt: "all", q: "" });
      if ($("casePoint")) { $("casePoint").value = $("caseLayer").value = $("caseRegion").value = "all"; $("caseSearch").value = ""; }
      const idx = filteredCases().findIndex((c) => c.figure === fig);
      caseState.shown = Math.max(PAGE, idx + 1);
      renderCases();
      el = $("case-" + fig);
    }
    if (el) { const d = el.querySelector("details"); if (d) d.open = true; scrollToEl(el); flash(el); }
  }

  // ---------------------------------------------------------------- glossary
  function renderGlossary() {
    const host = $("glossaryList");
    if (!host) return;
    const q = ($("glossSearch") && $("glossSearch").value.trim()) || "";
    const items = BOOK.glossary.filter((g) => !q || g.term.includes(q) || g.cn.includes(q) || g.def.includes(q));
    host.innerHTML = items.map((g) => `
      <div id="g-${g.id}" class="tile gloss-item">
        <dt><span>${esc(g.term)}</span><span class="cn" lang="zh">${esc(g.cn)}</span></dt>
        <dd>${esc(g.def)}</dd>
        ${src(g.page)}
      </div>`).join("") || `<p class="muted">אין מונחים תואמים.</p>`;
  }

  // ---------------------------------------------------------------- review
  function renderReview() {
    const host = $("reviewList");
    if (!host) return;
    const lv = { high: ["גבוהה", "badge-rose"], medium: ["בינונית", "badge-amber"], low: ["נמוכה", "badge-sky"] };
    host.innerHTML = BOOK.discrepancies.map((d) => `
      <article class="card review-card">
        <div class="card-head"><h4>${esc(d.topic)}</h4><span class="badge ${lv[d.level][1]}">עדיפות ${lv[d.level][0]}</span></div>
        <dl class="rv">
          ${d.site !== "—" ? `<dt>באתר</dt><dd>${esc(d.site.replace(/^באתר[^:]*:\s*/, ""))}</dd>` : ""}
          <dt>בספר</dt><dd>${esc(d.book.replace(/^בספר:?\s*/, ""))}</dd>
          <dt>המלצה</dt><dd style="color:var(--primary-700)">${esc(d.action)}</dd>
        </dl>
        ${d.pts.length ? `<div style="margin-top:.7rem">${chips(d.pts)}</div>` : ""}
      </article>`).join("");
  }

  // ---------------------------------------------------------------- hook into the atlas
  const _upd = window.updatePointInspectorText;
  window.updatePointInspectorText = function (code) { _upd(code); renderPointBook(code); };
  const _mus = window.renderMusclesUI;
  window.renderMusclesUI = function () { _mus(); renderMuscleBook(); };

  function init() {
    renderFoundations();
    renderMusclesIndex();
    renderMethods();
    renderDiagnosis();
    renderTechniqueBook();
    renderCervical();
    renderProtoChips();
    renderCaseFilters();
    renderCases();
    renderGlossary();
    renderReview();
    if ($("glossSearch")) $("glossSearch").oninput = renderGlossary;
    if ($("casesIntro")) $("casesIntro").innerHTML = `${esc(BOOK.casesIntro.text)} ${src(BOOK.casesIntro.page)}`;
    renderPointBook(selectedPointCode);
    renderMuscleBook();
    document.dispatchEvent(new CustomEvent("ca:content-ready"));
    if (location.hash && /^#(case-|g-)/.test(location.hash)) {
      const id = location.hash.slice(1);
      setTimeout(() => (id.startsWith("case-") ? openCase(id.slice(5)) : goToGloss(id.slice(2))), 150);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
