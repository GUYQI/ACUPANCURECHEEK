/* ==========================================================================
   Cheek Acupuncture Atlas — application logic
   Depends on data.js (cheekMuscles, cheekPoints, studyTable, studyTableEn,
   protocolConfigs). No framework, no build step.
   ========================================================================== */
"use strict";

(() => {
  const SVGNS = "http://www.w3.org/2000/svg";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = () => (reducedMotion() ? "auto" : "smooth");

  const svgEl = (tag, attrs = {}) => {
    const node = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  };

  /* ---------- Groups (derived from the existing CA numbering & legend) ---------- */
  const groupOf = (code) => {
    const n = Number(code.replace("CA-", ""));
    if (n === 1) return "head";
    if (n <= 4) return "sanjiao";
    if (n <= 8) return "spine";
    if (n <= 12) return "upper";
    return "lower";
  };
  const shortName = (pt) => pt.nameHe.split(" (")[0];
  const pointByCode = (code) => cheekPoints.find((p) => p.code === code);
  const muscleById = (id) => cheekMuscles.find((m) => m.id === id);

  /* ---------- State ---------- */
  const state = {
    mode: "points",        // "points" | "muscles"
    protocol: "all",       // key of protocolConfigs
    muscle: "masseter",
    point: "CA-4",
    panel: "point",        // inspector tab
    search: "",
    group: "all",
    usedOnly: false,
    lang: "he",
  };

  const isHighlighted = (pt) => {
    if (state.mode === "muscles") {
      const m = muscleById(state.muscle);
      return m ? m.relatedPoints.includes(pt.code) : true;
    }
    if (state.protocol !== "all") return pt.protocols.includes(state.protocol);
    return true;
  };

  const useBadges = (use) =>
    !use || use.length === 0
      ? '<span class="muted-dash" aria-label="לא שימשה בדיווח">–</span>'
      : use.map((u) => `<span class="p-badge p-badge--${u.toLowerCase()}">${u}</span>`).join("");

  /* ======================================================================
     HERO — authentic model image + the 16 calibrated points
     ====================================================================== */
  function renderHero() {
    const g = $("#heroPoints");
    if (!g) return;
    cheekPoints.forEach((pt) => {
      g.appendChild(svgEl("circle", {
        cx: pt.x, cy: pt.y, r: pt.isLarge ? 8.5 : 6,
        fill: pt.color, stroke: pt.strokeColor, "stroke-width": 1.6, class: "hero-point",
      }));
    });
  }

  /* ======================================================================
     ATLAS — SVG points & callouts (built once, updated in place)
     ====================================================================== */
  const nodes = {}; // code -> { cg, line, label, g, pulse, circle, ring }

  function buildAtlasPoints() {
    const pointsLayer = $("#pointsLayer");
    const calloutGroup = $("#calloutLinesGroup");

    cheekPoints.forEach((pt) => {
      // Callout line + label (positions exactly as in the original map)
      const cg = svgEl("g", { class: "callout-group" });
      const line = svgEl("line", { x1: pt.x, y1: pt.y });
      if (pt.callout.type === "left" || pt.callout.type === "right") {
        line.setAttribute("x2", pt.callout.lineEndX);
        line.setAttribute("y2", pt.y);
      } else {
        line.setAttribute("x2", pt.x);
        line.setAttribute("y2", pt.callout.lineEndY);
      }
      const label = svgEl("text", { x: pt.callout.textX, y: pt.callout.textY, direction: "ltr" });
      const he = shortName(pt);
      if (pt.callout.type === "left") {
        label.setAttribute("text-anchor", "end");
        label.textContent = `${he} • ${pt.nameEn}`;
      } else if (pt.callout.type === "right") {
        label.setAttribute("text-anchor", "start");
        label.textContent = `${pt.nameEn} • ${he}`;
      } else {
        label.setAttribute("text-anchor", "middle");
        label.textContent = `${pt.nameEn} (${he})`;
      }
      cg.append(line, label);
      cg.addEventListener("click", () => selectPoint(pt.code, { from: "map" }));
      calloutGroup.appendChild(cg);

      // Interactive point
      const g = svgEl("g", {
        class: "point-node",
        role: "button",
        tabindex: "-1",
        "data-code": pt.code,
        "aria-label": `${pt.code} ${pt.nameHe} – ${pt.category}`,
      });
      const r = pt.isLarge ? 11.2 : 7.2;
      const hit = svgEl("circle", { cx: pt.x, cy: pt.y, r: 18, class: "hit" });
      const ring = svgEl("circle", { cx: pt.x, cy: pt.y, r: r + 9, fill: "none", stroke: "#ffffff", "stroke-width": 2.5, "stroke-dasharray": "3 3", class: "focus-ring" });
      const pulse = svgEl("circle", { cx: pt.x, cy: pt.y, fill: "none", class: "pulse-ring" });
      const circle = svgEl("circle", { cx: pt.x, cy: pt.y, r, fill: pt.color, class: "main-dot" });
      g.append(hit, pulse, circle, ring);
      g.addEventListener("click", () => selectPoint(pt.code, { from: "map" }));
      pointsLayer.appendChild(g);

      nodes[pt.code] = { cg, line, label, g, pulse, circle, baseR: r };
    });

    // Roving keyboard navigation across points
    pointsLayer.addEventListener("keydown", (e) => {
      const keys = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 };
      if (e.key in keys) {
        e.preventDefault();
        stepPoint(keys[e.key], { focus: true });
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        selectPoint(e.key === "Home" ? cheekPoints[0].code : cheekPoints[cheekPoints.length - 1].code, { focus: true, from: "map" });
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const code = e.target.closest(".point-node")?.dataset.code;
        if (code) selectPoint(code, { from: "map" });
      }
    });
  }

  function updateAtlasPoints() {
    cheekPoints.forEach((pt) => {
      const n = nodes[pt.code];
      const sel = pt.code === state.point;
      const hl = isHighlighted(pt);
      const opacity = hl || sel ? "1" : "0.28";
      const r = sel ? n.baseR + 3 : n.baseR;

      n.cg.setAttribute("opacity", opacity);
      n.line.setAttribute("stroke", sel ? "#ffffff" : "#111827");
      n.line.setAttribute("stroke-width", sel ? "2.2" : "1.35");
      n.label.setAttribute("font-size", sel ? "15" : "13.5");
      n.label.setAttribute("font-weight", sel ? "800" : "700");
      n.label.setAttribute("fill", sel ? "#fef08a" : "#0f172a");

      n.g.setAttribute("opacity", opacity);
      n.g.setAttribute("tabindex", sel ? "0" : "-1");
      n.g.setAttribute("aria-pressed", String(sel));
      n.circle.setAttribute("r", r);
      n.circle.setAttribute("stroke", sel ? "#ffffff" : pt.strokeColor);
      n.circle.setAttribute("stroke-width", sel ? "3" : "1.5");
      if (sel) n.circle.setAttribute("filter", "url(#glow)");
      else n.circle.removeAttribute("filter");

      // Pulse only the selected point (restrained motion)
      n.pulse.style.display = sel ? "" : "none";
      n.pulse.setAttribute("r", r + 4);
      n.pulse.setAttribute("stroke", "#ffffff");
      n.pulse.setAttribute("stroke-width", "2.6");
    });
    // Keep the selected point on top of its neighbours
    const selNode = nodes[state.point];
    if (selNode) selNode.g.parentNode.appendChild(selNode.g);
  }

  function initMuscleShapes() {
    cheekMuscles.forEach((m) => {
      const el = document.getElementById(`muscle-${m.id}`);
      if (!el) return;
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", `שריר: ${m.nameHe}`);
      el.addEventListener("click", () => selectMuscle(m.id));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectMuscle(m.id); }
      });
    });
  }

  function updateMuscleShapes() {
    cheekMuscles.forEach((m) => {
      const el = document.getElementById(`muscle-${m.id}`);
      if (!el) return;
      const path = el.querySelector("path");
      const active = m.id === state.muscle && state.mode === "muscles";
      el.setAttribute("aria-pressed", String(active));
      if (active) {
        path.setAttribute("fill-opacity", "0.58");
        path.setAttribute("stroke-width", "3.2");
        path.setAttribute("stroke", "#ffffff");
        el.setAttribute("filter", "url(#muscleGlow)");
      } else {
        path.setAttribute("fill-opacity", state.mode === "muscles" ? "0.26" : "0.18");
        path.setAttribute("stroke-width", "1.6");
        path.setAttribute("stroke", m.color);
        el.removeAttribute("filter");
      }
    });
  }

  /* ======================================================================
     INSPECTOR PANEL
     ====================================================================== */
  function renderPointPanel() {
    const pt = pointByCode(state.point);
    if (!pt) return;
    const idx = cheekPoints.indexOf(pt);

    const code = $("#detailCode");
    code.textContent = pt.code;
    code.style.setProperty("--dot", pt.color);

    $("#detailCategoryBadge").textContent = pt.category;
    $("#detailNameHe").textContent = pt.nameHe;
    $("#detailNameCn").textContent = pt.nameCn;
    $("#detailPinyin").textContent = pt.pinyin;
    $("#detailLocation").textContent = pt.location;
    $("#detailPalpation").textContent = pt.palpation;
    $("#detailNeedle").textContent = pt.needle;
    $("#detailSideTime").textContent = pt.sideTime;
    $("#detailIndications").textContent = pt.indications;

    const s = studyTable[pt.code];
    $("#detailStudyLocation").textContent = s ? s.loc : "–";
    $("#detailStudyIndications").textContent = s ? s.ind : "–";
    $("#detailStudyUse").innerHTML = useBadges(s ? s.use : []);

    $("#pointPos").textContent = `${idx + 1} / ${cheekPoints.length}`;
  }

  function buildQuickGrid() {
    const grid = $("#pointsGridList");
    cheekPoints.forEach((pt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quick-btn";
      btn.dataset.code = pt.code;
      btn.innerHTML = `<span class="code-badge" style="--dot:${pt.color}">${pt.code}</span><span class="quick-btn__name">${esc(shortName(pt))}</span>`;
      btn.setAttribute("aria-label", `${pt.code} ${shortName(pt)}`);
      btn.addEventListener("click", () => selectPoint(pt.code));
      grid.appendChild(btn);
    });
  }

  function updateQuickGrid() {
    $$("#pointsGridList .quick-btn").forEach((btn) => {
      const pt = pointByCode(btn.dataset.code);
      btn.setAttribute("aria-pressed", String(pt.code === state.point));
      btn.classList.toggle("is-dim", !isHighlighted(pt) && pt.code !== state.point);
    });
  }

  function pointChip(code) {
    const pt = pointByCode(code);
    if (!pt) return null;
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "point-chip";
    chip.innerHTML = `<i class="dot" style="--dot:${pt.color}"></i><span class="code">${pt.code}</span><span>${esc(shortName(pt))}</span>`;
    chip.addEventListener("click", () => {
      selectPoint(pt.code);
      if (!isInView($("#atlas"))) scrollToAtlas();
    });
    return chip;
  }

  function buildMuscleList() {
    const list = $("#musclesGridList");
    cheekMuscles.forEach((m) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "muscle-btn";
      btn.dataset.muscle = m.id;
      btn.innerHTML = `<span class="swatch" style="--sw:${m.color}"></span><span>${esc(m.nameHe)}</span>`;
      btn.addEventListener("click", () => selectMuscle(m.id));
      list.appendChild(btn);
    });
  }

  function renderMusclePanel() {
    const m = muscleById(state.muscle) || cheekMuscles[0];
    $("#muscleBadge").textContent = m.badge;
    $("#muscleSwatch").style.setProperty("--sw", m.color);
    $("#muscleNameHe").textContent = m.nameHe;
    $("#muscleNameEn").textContent = m.nameEn;
    $("#muscleAnatomy").textContent = m.anatomy;
    $("#musclePalpation").textContent = m.palpation;
    $("#musclePointsDesc").textContent = m.pointsDesc;
    const chips = $("#musclePointChips");
    chips.replaceChildren(...m.relatedPoints.map(pointChip).filter(Boolean));
    $$("#musclesGridList .muscle-btn").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.muscle === m.id && state.mode === "muscles")));
  }

  function renderProtocolBanner() {
    const card = $("#protocolCard");
    const config = state.mode === "points" ? protocolConfigs[state.protocol] : null;
    if (!config) { card.hidden = true; return; }
    card.hidden = false;
    $("#protoTitle").textContent = config.title;
    $("#protoDesc").textContent = config.desc;
    $("#protoPointsList").textContent = config.pointsList;
    $("#protoSideRule").textContent = config.sideRule;
    $("#protoVerification").textContent = config.verification;
  }

  function setPanel(tab) {
    state.panel = tab;
    ["point", "muscle"].forEach((t) => {
      const btn = $(`#tab-${t}`);
      const on = t === tab;
      btn.setAttribute("aria-selected", String(on));
      btn.tabIndex = on ? 0 : -1;
      $(`#panel-${t}`).hidden = !on;
    });
  }

  function renderModeButtons() {
    $$(".atlas-toolbar .segmented__btn").forEach((btn) => {
      const on = btn.dataset.mode
        ? state.mode === "muscles"
        : state.mode === "points" && btn.dataset.protocol === state.protocol;
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  /* ======================================================================
     MUSCLES SECTION
     ====================================================================== */
  function buildMuscleCards() {
    const wrap = $("#muscleCards");
    cheekMuscles.forEach((m) => {
      const card = document.createElement("article");
      card.className = "muscle-card";
      card.dataset.muscle = m.id;
      card.style.setProperty("--sw", m.color);
      card.innerHTML = `
        <header class="muscle-card__head">
          <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><span class="swatch" style="--sw:${m.color}"></span><span class="tag">${esc(m.badge)}</span></div>
          <h3>${esc(m.nameHe)}</h3>
          <div class="muscle-card__en" lang="en">${esc(m.nameEn)}</div>
        </header>
        <div class="muscle-card__body">
          <div><span class="info-label">תחל ואחז (מאיפה לאיפה השריר עובר)</span><p class="info-text">${esc(m.anatomy)}</p></div>
          <div><span class="info-label">איך להקפיץ ולמשש אותו בקליניקה</span><p class="info-text">${esc(m.palpation)}</p></div>
          <div><span class="info-label">נקודות הדיקור שעל השריר ובגבולותיו</span><p class="info-text">${esc(m.pointsDesc)}</p></div>
        </div>
        <footer class="muscle-card__foot">
          <div class="chip-row"></div>
          <button type="button" class="btn btn--sm">הצג באטלס</button>
        </footer>`;
      const chips = $(".chip-row", card);
      m.relatedPoints.map(pointChip).filter(Boolean).forEach((c) => chips.appendChild(c));
      $(".muscle-card__foot .btn", card).addEventListener("click", () => {
        selectMuscle(m.id);
        scrollToAtlas();
      });
      wrap.appendChild(card);
    });
  }

  function updateMuscleCards() {
    $$("#muscleCards .muscle-card").forEach((c) =>
      c.classList.toggle("is-active", state.mode === "muscles" && c.dataset.muscle === state.muscle));
  }

  /* ======================================================================
     POINTS DATA (search, filters, table + mobile cards, HE / EN)
     ====================================================================== */
  const normalize = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  const compactCode = (s) => normalize(s).replace(/[^a-z0-9]/g, "");

  const searchIndex = Object.fromEntries(cheekPoints.map((pt) => {
    const s = studyTable[pt.code] || {};
    const en = studyTableEn[pt.code] || [];
    return [pt.code, normalize([pt.code, pt.nameHe, pt.nameCn, pt.pinyin, pt.nameEn, pt.category, pt.location, pt.indications, s.loc, s.ind, ...en].join(" "))];
  }));

  function matches(pt) {
    if (state.group !== "all" && groupOf(pt.code) !== state.group) return false;
    if (state.usedOnly && !(studyTable[pt.code]?.use?.length)) return false;
    const q = normalize(state.search.trim());
    if (!q) return true;
    const qc = compactCode(q);
    if (/^ca\d{1,2}$/.test(qc)) return compactCode(pt.code) === qc;   // exact code lookup: "ca4", "CA-4"
    if (/^\d{1,2}$/.test(qc)) return compactCode(pt.code) === `ca${qc}`; // just the number
    return q.split(/\s+/).every((term) => searchIndex[pt.code].includes(term));
  }

  const chevron = '<svg class="point-card__chev" aria-hidden="true"><use href="#i-chevron-down"/></svg>';

  function buildTables() {
    const heBody = $("#studyTableBody");
    const enBody = $("#enTableBody");
    const heCards = $("#studyCards");
    const enCards = $("#enCards");

    cheekPoints.forEach((pt) => {
      const s = studyTable[pt.code];
      const [enName, orient, apps] = studyTableEn[pt.code];
      const code = `<span class="code-badge" style="--dot:${pt.color}">${pt.code}</span>`;
      const go = () => { selectPoint(pt.code); scrollToAtlas(); };

      // Hebrew row
      const tr = document.createElement("tr");
      tr.dataset.code = pt.code;
      tr.innerHTML = `
        <td class="cell-code">${code}</td>
        <td class="cell-name"><strong>${esc(pt.nameHe)}</strong><span class="cjk" lang="zh">${esc(pt.nameCn)}</span> <span class="pinyin">${esc(pt.pinyin)}</span></td>
        <td>${esc(s.loc)}</td>
        <td>${esc(s.ind)}</td>
        <td class="cell-use">${useBadges(s.use)}</td>`;
      tr.addEventListener("click", go);
      heBody.appendChild(tr);

      // English row
      const etr = document.createElement("tr");
      etr.dataset.code = pt.code;
      etr.innerHTML = `
        <td class="cell-name"><strong>${esc(enName)}</strong><span class="pinyin">(${pt.code})</span></td>
        <td>${esc(orient)}</td>
        <td>${esc(apps)}</td>`;
      etr.addEventListener("click", go);
      enBody.appendChild(etr);

      // Hebrew mobile card
      const hc = document.createElement("details");
      hc.className = "point-card";
      hc.dataset.code = pt.code;
      hc.innerHTML = `
        <summary>${code}<span class="point-card__name"><strong>${esc(pt.nameHe)}</strong><span><span lang="zh">${esc(pt.nameCn)}</span> · ${esc(pt.pinyin)}</span></span>${chevron}</summary>
        <div class="point-card__body">
          <div><span class="info-label">מיקום</span><p class="info-text">${esc(s.loc)}</p></div>
          <div><span class="info-label">התוויות</span><p class="info-text">${esc(s.ind)}</p></div>
          <div><span class="info-label">בשימוש בדיווח (מטופלים)</span><div>${useBadges(s.use)}</div></div>
          <div><button type="button" class="btn btn--sm">הצג באטלס</button></div>
        </div>`;
      $(".btn", hc).addEventListener("click", go);
      heCards.appendChild(hc);

      // English mobile card
      const ec = document.createElement("details");
      ec.className = "point-card point-card--en";
      ec.dataset.code = pt.code;
      ec.innerHTML = `
        <summary>${code}<span class="point-card__name"><strong>${esc(enName)}</strong><span>${esc(pt.code)}</span></span>${chevron}</summary>
        <div class="point-card__body">
          <div><span class="info-label">Orientation</span><p class="info-text">${esc(orient)}</p></div>
          <div><span class="info-label">Applications</span><p class="info-text">${esc(apps)}</p></div>
          <div><button type="button" class="btn btn--sm">הצג באטלס</button></div>
        </div>`;
      $(".btn", ec).addEventListener("click", go);
      enCards.appendChild(ec);
    });
  }

  function updateTables() {
    let count = 0;
    cheekPoints.forEach((pt) => {
      const ok = matches(pt);
      if (ok) count++;
      $$(`[data-code="${pt.code}"]`, $("#points")).forEach((row) => {
        row.hidden = !ok;
        row.classList.toggle("is-selected", pt.code === state.point);
      });
    });
    $$("#points [data-empty]").forEach((e) => (e.hidden = count > 0));
    $$("#points .point-cards").forEach((c) => {
      let empty = c.querySelector(".empty-state");
      if (!empty) {
        empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "לא נמצאו נקודות התואמות לחיפוש.";
        c.appendChild(empty);
      }
      empty.hidden = count > 0;
    });
    $("#resultCount").textContent = count === cheekPoints.length ? `${count} נקודות` : `${count} מתוך ${cheekPoints.length} נקודות`;
  }

  function setLang(lang) {
    state.lang = lang;
    ["he", "en"].forEach((l) => {
      const tab = $(`#langTab-${l}`);
      const on = l === lang;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      $(`#tablePanel-${l}`).hidden = !on;
    });
  }

  /* ======================================================================
     PROTOCOL SECTION
     ====================================================================== */
  function buildProtocolSummaries() {
    $$("[data-protocol-summary]").forEach((box) => {
      const key = box.dataset.protocolSummary;
      const c = protocolConfigs[key];
      if (!c) return;
      const items = c.pointsList.split(" | ").map((s) => `<li>${esc(s)}</li>`).join("");
      box.innerHTML = `
        <span class="protocol-summary__eyebrow">סיכום הפרוטוקול באטלס</span>
        <h3>${esc(c.title)}</h3>
        <p class="protocol-summary__desc">${esc(c.desc)}</p>
        <dl>
          <dt>סדר בחירת הנקודות המדויק:</dt><dd><ol class="order-list">${items}</ol></dd>
          <dt>צד הדיקור (חד-צדדי מול דו-צדדי):</dt><dd>${esc(c.sideRule)}</dd>
          <dt>בדיקת אימות מיידית (אבחנת בטן/תנועה):</dt><dd>${esc(c.verification)}</dd>
        </dl>
        <button type="button" class="btn btn--primary">הדגש נקודות באטלס <svg aria-hidden="true"><use href="#i-arrow"/></svg></button>`;
      $(".btn", box).addEventListener("click", () => { setProtocol(key); scrollToAtlas(); });
    });
  }

  function initTablist(tablist, onSelect) {
    const tabs = $$('[role="tab"]', tablist);
    const activate = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      onSelect?.(tab);
    };
    tabs.forEach((t) => {
      t.addEventListener("click", () => activate(t));
      t.addEventListener("keydown", (e) => {
        const i = tabs.indexOf(t);
        // RTL: ArrowLeft moves forward
        const delta = { ArrowLeft: 1, ArrowRight: -1 }[e.key];
        if (delta) {
          e.preventDefault();
          activate(tabs[(i + delta + tabs.length) % tabs.length], true);
        } else if (e.key === "Home" || e.key === "End") {
          e.preventDefault();
          activate(tabs[e.key === "Home" ? 0 : tabs.length - 1], true);
        }
      });
    });
    return activate;
  }

  /* ======================================================================
     ACTIONS (preserve original semantics)
     ====================================================================== */
  function render() {
    updateAtlasPoints();
    updateMuscleShapes();
    renderPointPanel();
    updateQuickGrid();
    renderMusclePanel();
    renderProtocolBanner();
    renderModeButtons();
    updateMuscleCards();
    updateTables();
  }

  function selectPoint(code, opts = {}) {
    state.point = code;
    setPanel("point");
    render();
    if (opts.focus) nodes[code]?.g.focus({ preventScroll: true });
    if (view.zoomed()) centerOn(pointByCode(code));
  }

  function stepPoint(delta, opts = {}) {
    const i = cheekPoints.findIndex((p) => p.code === state.point);
    const next = cheekPoints[(i + delta + cheekPoints.length) % cheekPoints.length];
    selectPoint(next.code, opts);
  }

  function selectMuscle(id) {
    state.muscle = id;
    state.mode = "muscles";
    const m = muscleById(id);
    if (m && m.relatedPoints.length > 0) state.point = m.relatedPoints[0];
    setPanel("muscle");
    render();
  }

  function setMode(mode) {
    if (mode !== "muscles") return;
    state.mode = "muscles";
    state.protocol = "all";
    setPanel("muscle");
    render();
  }

  function setProtocol(key) {
    state.mode = "points";
    state.protocol = key;
    const config = protocolConfigs[key];
    if (config) state.point = config.defaultPoint;
    setPanel("point");
    render();
  }

  function toggleLayer(id, btn) {
    const layer = document.getElementById(id);
    if (!layer) return;
    const show = layer.style.display === "none";
    if (show && id === "origRefLayer") {
      const img = layer.querySelector("image[data-src]");
      if (img) { img.setAttribute("href", img.dataset.src); img.removeAttribute("data-src"); }
    }
    layer.style.display = show ? "" : "none";
    btn.setAttribute("aria-pressed", String(show));
  }

  /* ======================================================================
     ZOOM & PAN (viewBox based — keeps the 1:1 calibrated coordinates)
     ====================================================================== */
  const svg = $("#cheekSvg");
  const stage = $("#atlasStage");
  const IMG_W = 1000, IMG_H = 828, MIN_W = 170, MAX_W = 1080;

  const view = {
    cx: 500, cy: 414, w: 1000,
    defaults() {
      // Desktop: the whole calibrated map plus room for the right-hand callout labels.
      return stage.clientWidth < 640 ? { cx: 486, cy: 478, w: 400 } : { cx: 525, cy: 414, w: 1060 };
    },
    ratio() { return stage.clientHeight / stage.clientWidth || IMG_H / IMG_W; },
    zoomed() { return this.w < this.defaults().w - 1; },
  };

  function applyView() {
    view.w = Math.min(MAX_W, Math.max(MIN_W, view.w));
    view.cx = Math.min(IMG_W, Math.max(0, view.cx));
    view.cy = Math.min(IMG_H, Math.max(0, view.cy));
    const h = view.w * view.ratio();
    svg.setAttribute("viewBox", `${(view.cx - view.w / 2).toFixed(2)} ${(view.cy - h / 2).toFixed(2)} ${view.w.toFixed(2)} ${h.toFixed(2)}`);
    $("#zoomLevel").textContent = `${Math.round((view.defaults().w / view.w) * 100)}%`;
    $("#zoomIn").disabled = view.w <= MIN_W + 0.5;
    $("#zoomOut").disabled = view.w >= MAX_W - 0.5;
    stage.classList.toggle("is-zoomed", view.zoomed());
  }

  function resetView() { Object.assign(view, view.defaults()); applyView(); }

  function zoomBy(factor, anchor) {
    const newW = Math.min(MAX_W, Math.max(MIN_W, view.w / factor));
    if (anchor) {
      const k = newW / view.w;
      view.cx = anchor.x + (view.cx - anchor.x) * k;
      view.cy = anchor.y + (view.cy - anchor.y) * k;
    }
    view.w = newW;
    applyView();
  }

  function centerOn(pt) {
    if (!pt) return;
    view.cx = pt.x;
    view.cy = pt.y;
    applyView();
  }

  function clientToSvg(clientX, clientY) {
    const r = svg.getBoundingClientRect();
    const h = view.w * view.ratio();
    return {
      x: view.cx - view.w / 2 + ((clientX - r.left) / r.width) * view.w,
      y: view.cy - h / 2 + ((clientY - r.top) / r.height) * h,
    };
  }

  function initZoom() {
    $("#zoomIn").addEventListener("click", () => zoomBy(1.4));
    $("#zoomOut").addEventListener("click", () => zoomBy(1 / 1.4));
    $("#zoomReset").addEventListener("click", resetView);
    $("#zoomFocus").addEventListener("click", () => {
      const pt = pointByCode(state.point);
      if (view.w > 500) view.w = 420;
      centerOn(pt);
    });

    // Trackpad pinch / Ctrl + wheel
    stage.addEventListener("wheel", (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomBy(Math.exp(-e.deltaY * 0.01), clientToSvg(e.clientX, e.clientY));
    }, { passive: false });

    // Pointer drag (pan) + two-finger pinch
    const pointers = new Map();
    let start = null;        // { x, y, cx, cy }
    let pinch = null;        // { dist, w, mid }
    let moved = false;

    stage.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".stage-controls")) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = false;
      if (pointers.size === 1) {
        start = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy };
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), w: view.w, mid: clientToSvg((a.x + b.x) / 2, (a.y + b.y) / 2) };
      }
    });

    stage.addEventListener("pointermove", (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2 && pinch) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const targetW = pinch.w * (pinch.dist / dist);
        zoomBy(view.w / targetW, pinch.mid);
        moved = true;
        return;
      }
      if (!start || view.w >= MAX_W - 0.5) return;
      if (e.pointerType === "touch" && !view.zoomed()) return; // let the page scroll
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      if (!moved) { moved = true; stage.setPointerCapture(e.pointerId); stage.classList.add("is-dragging"); }
      const scale = view.w / stage.clientWidth;
      view.cx = start.cx - dx * scale;
      view.cy = start.cy - dy * scale;
      applyView();
    });

    const end = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) { start = null; stage.classList.remove("is-dragging"); }
    };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);

    // Swallow the click that ends a drag so it doesn't select a point
    stage.addEventListener("click", (e) => {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);

    let lastDefaultW = view.defaults().w;
    new ResizeObserver(() => {
      const d = view.defaults();
      if (d.w !== lastDefaultW) { lastDefaultW = d.w; Object.assign(view, d); }
      applyView();
    }).observe(stage);

    resetView();
  }

  /* ======================================================================
     NAVIGATION, SCROLL & GLOBAL UI
     ====================================================================== */
  function isInView(el) {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.3;
  }

  function scrollToAtlas() {
    const target = window.matchMedia("(max-width: 1023px)").matches ? $("#atlasStage") : $("#atlas");
    target.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }

  function initNav() {
    const nav = $("#siteNav");
    const btn = $("#menuBtn");
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "סגור תפריט" : "פתח תפריט");
      btn.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
    };
    btn.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    $$(".nav__link", nav).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); btn.focus(); }
    });
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });

    // Active section highlighting: the last section whose top has passed a
    // reading line just under the top bar (robust for very tall sections).
    const links = $$(".nav__link", nav);
    const byId = Object.fromEntries(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const owner = { technique: "protocols" }; // technique belongs to the protocols area
    const sections = $$("main > section[id]");
    let ticking = false;
    const updateActive = () => {
      ticking = false;
      const line = $("#topbar").offsetHeight + window.innerHeight * 0.25;
      let current = null;
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.id;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1].id;
      const id = owner[current] || current;
      links.forEach((a) => (a === byId[id] ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(updateActive); } }, { passive: true });
    window.addEventListener("resize", updateActive);
    updateActive();

    // Top bar border + back-to-top
    const topbar = $("#topbar");
    const toTop = $("#toTop");
    const onScroll = () => {
      const y = window.scrollY;
      topbar.classList.toggle("is-scrolled", y > 8);
      toTop.classList.toggle("is-visible", y > 900);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
      $(".brand").focus({ preventScroll: true });
    });
  }

  function initLayersPopover() {
    const btn = $("#layersBtn");
    const panel = $("#layersPanel");
    const setOpen = (open) => { panel.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", (e) => { e.stopPropagation(); setOpen(panel.hidden); });
    document.addEventListener("click", (e) => { if (!panel.hidden && !panel.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { setOpen(false); btn.focus(); } });
    $$(".switch[data-layer]", panel).forEach((sw) => sw.addEventListener("click", () => toggleLayer(sw.dataset.layer, sw)));
  }

  function initControls() {
    // Mode / protocol buttons (toolbar + banner "back to all")
    $$("[data-protocol]").forEach((b) => {
      if (b.closest("[data-protocol-summary]")) return;
      b.addEventListener("click", () => setProtocol(b.dataset.protocol));
    });
    $$("[data-mode]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));

    $("#prevPoint").addEventListener("click", () => stepPoint(-1));
    $("#nextPoint").addEventListener("click", () => stepPoint(1));

    initTablist($(".inspector__tabs"), (tab) => setPanel(tab.id.replace("tab-", "")));
    initTablist($('#protocols [role="tablist"]'));
    initTablist($('#points [role="tablist"]'), (tab) => setLang(tab.id.replace("langTab-", "")));

    // Search & filters
    const input = $("#pointSearch");
    input.addEventListener("input", () => { state.search = input.value; updateTables(); });
    input.addEventListener("keydown", (e) => { if (e.key === "Escape") { input.value = ""; state.search = ""; updateTables(); } });
    $$(".filters [data-group]").forEach((chip) => chip.addEventListener("click", () => {
      state.group = chip.dataset.group;
      $$(".filters [data-group]").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      updateTables();
    }));
    $("#usedOnly").addEventListener("click", (e) => {
      state.usedOnly = !state.usedOnly;
      e.currentTarget.setAttribute("aria-pressed", String(state.usedOnly));
      updateTables();
    });

    // Legacy deep links (#originalTable opens the English table)
    const onHash = () => {
      if (location.hash === "#originalTable") {
        const tab = $("#langTab-en");
        tab.click();
        $("#points").scrollIntoView({ behavior: "auto" });
      }
    };
    window.addEventListener("hashchange", onHash);
    onHash();
  }

  /* ---------- Expose original global API (used by older links/bookmarklets) ---------- */
  Object.assign(window, { selectPoint, selectMuscle, setMode, setProtocol });

  /* ---------- Video thumbnails: fall back to the branded placeholder if YouTube is unreachable ---------- */
  $$(".video-thumb img").forEach((img) => {
    const drop = () => img.remove();
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener("error", drop, { once: true });
  });

  /* ---------- Boot ---------- */
  renderHero();
  buildAtlasPoints();
  initMuscleShapes();
  buildQuickGrid();
  buildMuscleList();
  buildMuscleCards();
  buildTables();
  buildProtocolSummaries();
  initZoom();
  initNav();
  initLayersPopover();
  initControls();
  setProtocol("all");
})();
