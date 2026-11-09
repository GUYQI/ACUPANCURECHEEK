/* =====================================================================
   Interactive atlas — point/muscle selection, protocol modes, layers,
   zoom & pan, 16-point table. Data lives in js/atlas-data.js.
   Function names are kept from the original inline script (other
   modules and inline handlers in the SVG call them as globals).
   ===================================================================== */

let currentMode = "points";
let currentProtocol = "all";
let selectedMuscleId = "masseter";
let selectedPointCode = "CA-4";

const SVG_NS = "http://www.w3.org/2000/svg";
const $id = (id) => document.getElementById(id);
const escHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const stripEmoji = (s) => String(s).replace(/^[\u{1F300}-\u{1FAFF}☀-➿️\s]+/u, "");
const onLight = (color) => color === "#facc15";
const shortHe = (pt) => pt.nameHe.split(" (")[0];
const NARROW_MQ = window.matchMedia("(max-width: 639px)");
const isNarrow = () => NARROW_MQ.matches;

function codeBadge(pt, extra) {
  return `<span class="code-badge${onLight(pt.color) ? " on-light" : ""}${extra ? " " + extra : ""}" style="background:${pt.color}">${pt.code}</span>`;
}

/* ---------- study table (Table 1) ---------- */
function studyUseHtml(use) {
  if (!use || use.length === 0) return '<span class="muted">–</span>';
  return use.map((u) => `<span class="badge ${u === "P1" ? "badge-sky" : "badge-teal"}" style="margin-inline-end:.25rem">${u}</span>`).join("");
}

function pointMatches(pt, q, group) {
  if (group && group !== "all" && pt.category !== group) return false;
  if (!q) return true;
  const s = studyTable[pt.code] || {};
  const book = window.CA_BOOK && window.CA_BOOK.points[pt.code];
  const hay = [pt.code, pt.code.replace("-", ""), pt.nameHe, pt.nameEn, pt.nameCn, pt.pinyin, pt.category, pt.location, pt.indications, s.loc, s.ind, book ? book.location + " " + book.indications.join(" ") : ""].join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).every((t) => hay.includes(t));
}

function renderStudyTable() {
  const body = $id("studyTableBody");
  const cards = $id("pointCards");
  if (!body) return;
  const q = ($id("pointSearch") && $id("pointSearch").value.trim()) || "";
  const group = ($id("pointGroup") && $id("pointGroup").value) || "all";
  const showBook = !!($id("tableBookToggle") && $id("tableBookToggle").checked && window.CA_BOOK);
  const list = cheekPoints.filter((pt) => pointMatches(pt, q, group));
  const bookLoc = (pt) => (showBook && window.CA_BOOK.points[pt.code] ? `<div class="book-line">${escHtml(window.CA_BOOK.points[pt.code].location)} <span class="muted">(עמ' ${escHtml(window.CA_BOOK.points[pt.code].page)})</span></div>` : "");
  const bookInd = (pt) => (showBook && window.CA_BOOK.points[pt.code] ? `<div class="book-line">${escHtml(window.CA_BOOK.points[pt.code].indications.join(", "))}</div>` : "");

  body.innerHTML = "";
  list.forEach((pt) => {
    const s = studyTable[pt.code];
    const tr = document.createElement("tr");
    const isSel = pt.code === selectedPointCode;
    tr.className = "clickable" + (isSel ? " selected" : "");
    tr.tabIndex = 0;
    tr.setAttribute("aria-selected", isSel ? "true" : "false");
    tr.setAttribute("aria-label", `${pt.code} ${shortHe(pt)} – הצג באטלס`);
    const open = () => { selectPoint(pt.code); $id("atlas").scrollIntoView({ behavior: "smooth" }); };
    tr.onclick = open;
    tr.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } };
    tr.innerHTML = `
      <td data-label="קוד">${codeBadge(pt)}</td>
      <td data-label="שם הנקודה" class="pt-name"><b>${escHtml(pt.nameHe)}</b><span class="cn" lang="zh">${escHtml(pt.nameCn)}</span> <span class="xs muted" lang="en">${escHtml(pt.pinyin)}</span></td>
      <td data-label="מיקום">${escHtml(s.loc)}${bookLoc(pt)}</td>
      <td data-label="התוויות">${escHtml(s.ind)}${bookInd(pt)}</td>
      <td data-label="בשימוש בדיווח (מטופלים)">${studyUseHtml(s.use)}</td>`;
    body.appendChild(tr);
  });
  if (!list.length) body.innerHTML = `<tr><td colspan="5" class="muted" style="text-align:center;padding:2rem">לא נמצאו נקודות התואמות לחיפוש.</td></tr>`;

  if (cards) {
    const openState = new Set([...cards.querySelectorAll("details[open]")].map((d) => d.dataset.code));
    cards.innerHTML = list.map((pt) => {
      const s = studyTable[pt.code];
      const isSel = pt.code === selectedPointCode;
      return `<details class="pt-card${isSel ? " selected" : ""}" data-code="${pt.code}"${openState.has(pt.code) ? " open" : ""}>
        <summary>${codeBadge(pt)}<span class="pc-title"><b>${escHtml(pt.nameHe)}</b><small><span lang="zh">${escHtml(pt.nameCn)}</span> · <span lang="en">${escHtml(pt.pinyin)}</span></small></span></summary>
        <div class="pc-body">
          <div class="kv"><dt>מיקום</dt><dd>${escHtml(s.loc)}${bookLoc(pt)}</dd></div>
          <div class="kv"><dt>התוויות</dt><dd>${escHtml(s.ind)}${bookInd(pt)}</dd></div>
          <div class="row between"><div class="kv"><dt>בשימוש בדיווח (מטופלים)</dt><dd>${studyUseHtml(s.use)}</dd></div>
          <button type="button" class="btn btn-secondary btn-sm" data-pt="${pt.code}">הצג באטלס</button></div>
        </div></details>`;
    }).join("") || `<p class="muted">לא נמצאו נקודות התואמות לחיפוש.</p>`;
  }
  const count = $id("pointCount");
  if (count) count.textContent = list.length === cheekPoints.length ? `${list.length} נקודות` : `${list.length} מתוך ${cheekPoints.length} נקודות`;
}

/* ---------- muscles ---------- */
function renderMusclesUI() {
  const musclesGrid = $id("musclesGridList");
  musclesGrid.innerHTML = "";
  const activeMuscle = cheekMuscles.find((m) => m.id === selectedMuscleId) || cheekMuscles[0];

  cheekMuscles.forEach((m) => {
    const el = $id(`muscle-${m.id}`);
    if (el) {
      const path = el.querySelector("path");
      if (m.id === selectedMuscleId && currentMode === "muscles") {
        path.setAttribute("fill-opacity", "0.58");
        path.setAttribute("stroke-width", "3.2");
        path.setAttribute("stroke", "#ffffff");
        el.setAttribute("filter", "url(#muscleGlow)");
      } else {
        path.setAttribute("fill-opacity", currentMode === "muscles" ? "0.26" : "0.18");
        path.setAttribute("stroke-width", "1.6");
        path.setAttribute("stroke", m.color);
        el.removeAttribute("filter");
      }
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "muscle-btn";
    btn.onclick = () => selectMuscle(m.id);
    btn.setAttribute("aria-pressed", m.id === selectedMuscleId && currentMode === "muscles" ? "true" : "false");
    btn.innerHTML = `<span>${escHtml(m.nameHe)}</span><i style="background:${m.color}"></i>`;
    musclesGrid.appendChild(btn);
  });

  const badge = $id("muscleBadge");
  badge.textContent = activeMuscle.badge;
  badge.style.background = activeMuscle.color + "1f";
  badge.style.borderColor = activeMuscle.color + "66";
  badge.style.color = "#202B2B";

  $id("muscleNameHe").textContent = activeMuscle.nameHe;
  $id("muscleNameEn").textContent = activeMuscle.nameEn;
  $id("muscleAnatomy").textContent = activeMuscle.anatomy;
  $id("musclePalpation").textContent = activeMuscle.palpation;
  $id("musclePointsDesc").textContent = activeMuscle.pointsDesc;

  const chipsContainer = $id("musclePointChips");
  chipsContainer.innerHTML = "";
  activeMuscle.relatedPoints.forEach((ptCode) => {
    const pt = cheekPoints.find((p) => p.code === ptCode);
    if (!pt) return;
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "pt-chip";
    chip.onclick = () => {
      selectPoint(pt.code);
      $id("pointInspectorCard").scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    chip.innerHTML = `<i style="background:${pt.color}"></i><span>${pt.code}: ${escHtml(shortHe(pt))}</span>`;
    chipsContainer.appendChild(chip);
  });
}

/* ---------- points (SVG + quick grid) ---------- */
function renderPoints() {
  const svgGroup = $id("pointsLayer");
  const calloutGroup = $id("calloutLinesGroup");
  const gridContainer = $id("pointsGridList");
  const hadFocus = document.activeElement && document.activeElement.closest && document.activeElement.closest(".point-node");
  svgGroup.innerHTML = "";
  calloutGroup.innerHTML = "";
  gridContainer.innerHTML = "";

  const activeMuscle = cheekMuscles.find((m) => m.id === selectedMuscleId);

  cheekPoints.forEach((pt) => {
    let isHighlighted = true;
    if (currentMode === "muscles" && activeMuscle) isHighlighted = activeMuscle.relatedPoints.includes(pt.code);
    else if (currentProtocol !== "all") isHighlighted = pt.protocols.includes(currentProtocol);

    const isSelected = pt.code === selectedPointCode;
    const opacity = isHighlighted || isSelected ? "1" : "0.28";
    const heShort = shortHe(pt);

    // 1. callout line + label
    const cg = document.createElementNS(SVG_NS, "g");
    cg.setAttribute("class", "callout-group");
    cg.setAttribute("opacity", opacity);
    cg.onclick = (e) => { e.stopPropagation(); selectPoint(pt.code); };

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", pt.x);
    line.setAttribute("y1", pt.y);
    if (pt.callout.type === "left" || pt.callout.type === "right") {
      line.setAttribute("x2", pt.callout.lineEndX);
      line.setAttribute("y2", pt.y);
    } else {
      line.setAttribute("x2", pt.x);
      line.setAttribute("y2", pt.callout.lineEndY);
    }
    line.setAttribute("stroke", isSelected ? "#ffffff" : "#111827");
    line.setAttribute("stroke-width", isSelected ? "2.2" : "1.35");
    cg.appendChild(line);

    const labelText = document.createElementNS(SVG_NS, "text");
    labelText.setAttribute("y", pt.callout.textY);
    labelText.setAttribute("font-size", isSelected ? "15" : "13.5");
    labelText.setAttribute("font-weight", isSelected ? "800" : "700");
    labelText.setAttribute("fill", isSelected ? "#fef08a" : "#0f172a");
    labelText.setAttribute("direction", "ltr");
    labelText.setAttribute("font-family", "Heebo, Inter, sans-serif");
    labelText.setAttribute("x", pt.callout.textX);
    if (pt.callout.type === "left") {
      labelText.setAttribute("text-anchor", "end");
      labelText.textContent = `${heShort} • ${pt.nameEn}`;
    } else if (pt.callout.type === "right") {
      labelText.setAttribute("text-anchor", "start");
      labelText.textContent = `${pt.nameEn} • ${heShort}`;
    } else {
      labelText.setAttribute("text-anchor", "middle");
      labelText.textContent = `${pt.nameEn} (${heShort})`;
    }
    cg.appendChild(labelText);
    if (!isNarrow()) calloutGroup.appendChild(cg);

    // 2. interactive dot (keyboard accessible)
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "point-node");
    g.setAttribute("opacity", opacity);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("data-code", pt.code);
    g.setAttribute("aria-pressed", isSelected ? "true" : "false");
    g.setAttribute("aria-label", `${pt.code} ${pt.nameHe}`);
    g.onclick = (e) => { e.stopPropagation(); selectPoint(pt.code); };
    g.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectPoint(pt.code); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); stepPoint(1, true); }
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); stepPoint(-1, true); }
    };
    const title = document.createElementNS(SVG_NS, "title");
    title.textContent = `${pt.code} · ${pt.nameHe}`;
    g.appendChild(title);

    const baseRadius = pt.isLarge ? 11.2 : 7.2;
    const activeRadius = isSelected ? baseRadius + 3 : baseRadius;

    // generous invisible hit-area for touch
    const hit = document.createElementNS(SVG_NS, "circle");
    hit.setAttribute("cx", pt.x);
    hit.setAttribute("cy", pt.y);
    hit.setAttribute("r", 18);
    hit.setAttribute("fill", "transparent");
    g.appendChild(hit);

    if (isHighlighted || isSelected) {
      const pulse = document.createElementNS(SVG_NS, "circle");
      pulse.setAttribute("cx", pt.x);
      pulse.setAttribute("cy", pt.y);
      pulse.setAttribute("r", activeRadius + 4);
      pulse.setAttribute("fill", "none");
      pulse.setAttribute("stroke", isSelected ? "#ffffff" : pt.color);
      pulse.setAttribute("stroke-width", isSelected ? "2.6" : "1.8");
      pulse.setAttribute("class", "pulse-ring");
      g.appendChild(pulse);
    }

    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", pt.x);
    circle.setAttribute("cy", pt.y);
    circle.setAttribute("r", activeRadius);
    circle.setAttribute("fill", pt.color);
    circle.setAttribute("stroke", isSelected ? "#ffffff" : pt.strokeColor);
    circle.setAttribute("stroke-width", isSelected ? "3" : "1.5");
    circle.setAttribute("class", "main-dot");
    if (isSelected) circle.setAttribute("filter", "url(#glow)");
    g.appendChild(circle);
    if (isNarrow()) {
      // phones: the long callout labels fall outside the cheek view, so label the dot itself
      const tag = document.createElementNS(SVG_NS, "text");
      tag.setAttribute("x", pt.x + activeRadius + 4);
      tag.setAttribute("y", pt.y + 5);
      tag.setAttribute("font-size", isSelected ? "15" : "13");
      tag.setAttribute("font-weight", "800");
      tag.setAttribute("font-family", "Inter, Heebo, sans-serif");
      tag.setAttribute("direction", "ltr");
      tag.setAttribute("fill", isSelected ? "#fef08a" : "#ffffff");
      tag.setAttribute("stroke", "#13221d");
      tag.setAttribute("stroke-width", "3");
      tag.setAttribute("paint-order", "stroke");
      tag.setAttribute("pointer-events", "none");
      tag.textContent = pt.code.replace("CA-", "");
      g.appendChild(tag);
    }
    svgGroup.appendChild(g);

    // 3. quick-select grid button
    const btn = document.createElement("button");
    btn.type = "button";
    btn.onclick = () => selectPoint(pt.code);
    btn.className = "quick-btn" + (isSelected ? " sel" : isHighlighted ? "" : " dim");
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
    btn.setAttribute("aria-label", `${pt.code} ${heShort}`);
    btn.innerHTML = `<span>${escHtml(heShort)}</span>${codeBadge(pt)}`;
    gridContainer.appendChild(btn);
  });

  if (hadFocus) {
    const again = svgGroup.querySelector(`[data-code="${selectedPointCode}"]`);
    if (again) again.focus({ preventScroll: true });
  }
  renderStudyTable();
}

function selectMuscle(muscleId) {
  selectedMuscleId = muscleId;
  currentMode = "muscles";
  updateTopButtonsUI();
  const muscle = cheekMuscles.find((m) => m.id === muscleId);
  if (muscle && muscle.relatedPoints.length > 0) {
    selectedPointCode = muscle.relatedPoints[0];
    updatePointInspectorText(selectedPointCode);
  }
  $id("protocolCard").hidden = true;
  renderMusclesUI();
  renderPoints();
}

function updatePointInspectorText(code) {
  const pt = cheekPoints.find((p) => p.code === code);
  if (!pt) return;
  const codeEl = $id("detailCode");
  codeEl.textContent = pt.code;
  codeEl.style.background = pt.color;
  codeEl.classList.toggle("on-light", onLight(pt.color));

  $id("detailCategoryBadge").textContent = pt.category;
  $id("detailNameHe").textContent = pt.nameHe;
  $id("detailNameCn").textContent = pt.nameCn;
  $id("detailPinyin").textContent = pt.pinyin;
  $id("detailLocation").textContent = pt.location;
  $id("detailPalpation").textContent = pt.palpation;
  $id("detailNeedle").textContent = pt.needle;
  $id("detailSideTime").textContent = pt.sideTime;
  $id("detailIndications").textContent = pt.indications;

  const s = studyTable[pt.code];
  $id("detailStudyLocation").textContent = s ? s.loc : "–";
  $id("detailStudyIndications").textContent = s ? s.ind : "–";
  $id("detailStudyUse").innerHTML = studyUseHtml(s ? s.use : []);

  const idx = cheekPoints.indexOf(pt);
  const pos = $id("pointPos");
  if (pos) pos.textContent = `${idx + 1} / ${cheekPoints.length}`;
}

function selectPoint(code) {
  selectedPointCode = code;
  updatePointInspectorText(code);
  renderPoints();
}

function stepPoint(dir, focusMap) {
  const i = cheekPoints.findIndex((p) => p.code === selectedPointCode);
  const next = cheekPoints[(i + dir + cheekPoints.length) % cheekPoints.length];
  selectPoint(next.code);
  if (focusMap) {
    const el = document.querySelector(`#pointsLayer [data-code="${next.code}"]`);
    if (el) el.focus({ preventScroll: true });
  }
}

function setMode(mode) {
  if (mode === "muscles") {
    currentMode = "muscles";
    currentProtocol = "all";
    $id("protocolCard").hidden = true;
    updateTopButtonsUI();
    renderMusclesUI();
    renderPoints();
  }
}

function setProtocol(protoKey) {
  currentMode = "points";
  currentProtocol = protoKey;
  updateTopButtonsUI();
  const protoCard = $id("protocolCard");
  const config = protocolConfigs[protoKey];
  if (config) {
    protoCard.hidden = false;
    $id("protoTitle").textContent = stripEmoji(config.title);
    $id("protoDesc").textContent = config.desc;
    $id("protoPointsList").textContent = config.pointsList;
    $id("protoSideRule").textContent = config.sideRule;
    $id("protoVerification").textContent = config.verification;
    selectedPointCode = config.defaultPoint;
    updatePointInspectorText(selectedPointCode);
  } else {
    protoCard.hidden = true;
  }
  renderMusclesUI();
  renderPoints();
}

function updateTopButtonsUI() {
  document.querySelectorAll(".mode-btn").forEach((btn) => btn.setAttribute("aria-pressed", "false"));
  const active = currentMode === "muscles" ? $id("mode-muscles") : $id(`proto-${currentProtocol}`);
  if (active) active.setAttribute("aria-pressed", "true");
}

function toggleLayer(layerId) {
  const layer = $id(layerId);
  if (!layer) return;
  const isHidden = layer.style.display === "none";
  layer.style.display = isHidden ? "block" : "none";
  const btn = document.querySelector(`.layer-toggle[data-layer="${layerId}"]`);
  if (btn) btn.setAttribute("aria-pressed", isHidden ? "true" : "false");
}

/* ---------- zoom & pan ---------- */
const AtlasZoom = (() => {
  const FULL = { x: 0, y: 0, w: 1000, h: 828 };
  // phones: frame the cheek (all 16 points) instead of the whole head
  const CHEEK = { x: 300, y: 285, w: 400, h: 400 };
  let BASE = isNarrow() ? { ...CHEEK } : { ...FULL };
  const MIN_W = 200;
  let vb = { ...BASE };
  let svg, canvas, pill;
  const pointers = new Map();
  let drag = null, pinch = null, moved = false;

  const apply = () => {
    svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    const scale = BASE.w / vb.w;
    pill.textContent = `${Math.round(scale * 100)}%`;
    canvas.style.touchAction = scale > 1.01 ? "none" : "pan-y";
    $id("zoomOut").disabled = scale <= 1.01;
    $id("zoomReset").disabled = scale <= 1.01;
    $id("zoomIn").disabled = vb.w <= MIN_W + 1;
  };
  const clamp = () => {
    vb.w = Math.min(BASE.w, Math.max(MIN_W, vb.w));
    vb.h = vb.w * (BASE.h / BASE.w);
    vb.x = Math.min(FULL.w - vb.w, Math.max(0, vb.x));
    vb.y = Math.min(FULL.h - vb.h, Math.max(0, vb.y));
  };
  const toSvg = (clientX, clientY) => {
    const r = svg.getBoundingClientRect();
    return { x: vb.x + ((clientX - r.left) / r.width) * vb.w, y: vb.y + ((clientY - r.top) / r.height) * vb.h };
  };
  const zoomAt = (factor, cx, cy) => {
    const nw = Math.min(BASE.w, Math.max(MIN_W, vb.w / factor));
    const k = nw / vb.w;
    vb.x = cx - (cx - vb.x) * k;
    vb.y = cy - (cy - vb.y) * k;
    vb.w = nw;
    clamp();
    apply();
  };
  const center = () => ({ x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 });
  const focusPoint = () => {
    const pt = cheekPoints.find((p) => p.code === selectedPointCode);
    return pt && vb.w === BASE.w ? { x: pt.x, y: pt.y } : center();
  };

  function init() {
    svg = $id("cheekSvg"); canvas = $id("atlasCanvas"); pill = $id("zoomPill");
    NARROW_MQ.addEventListener("change", () => {
      BASE = isNarrow() ? { ...CHEEK } : { ...FULL };
      vb = { ...BASE };
      apply();
      renderPoints();
    });
    if (!svg || !canvas) return;
    $id("zoomIn").onclick = () => { const c = focusPoint(); zoomAt(1.5, c.x, c.y); };
    $id("zoomOut").onclick = () => { const c = center(); zoomAt(1 / 1.5, c.x, c.y); };
    $id("zoomReset").onclick = () => { vb = { ...BASE }; apply(); };

    canvas.addEventListener("wheel", (e) => {
      if (!(e.ctrlKey || e.metaKey)) return; // keep normal page scrolling
      e.preventDefault();
      const p = toSvg(e.clientX, e.clientY);
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y);
    }, { passive: false });

    canvas.addEventListener("pointerdown", (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = false;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), w: vb.w };
        drag = null;
      } else if (vb.w < BASE.w) {
        drag = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y };
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const mid = toSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
        const target = pinch.w * (pinch.d / d);
        zoomAt(vb.w / target, mid.x, mid.y);
        moved = true;
        return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      if (!moved) { moved = true; canvas.setPointerCapture(e.pointerId); canvas.classList.add("panning"); }
      const r = svg.getBoundingClientRect();
      vb.x = drag.vx - (dx / r.width) * vb.w;
      vb.y = drag.vy - (dy / r.height) * vb.h;
      clamp();
      apply();
    });
    const end = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) { drag = null; canvas.classList.remove("panning"); }
    };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    // a drag must not count as a click on a point / muscle
    canvas.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    apply();
  }
  return { init };
})();

/* ---------- wiring ---------- */
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".mode-btn").forEach((b) => {
    b.addEventListener("click", () => (b.dataset.mode === "muscles" ? setMode("muscles") : setProtocol(b.dataset.mode)));
  });
  document.querySelectorAll("[data-mode-btn]").forEach((b) => b.addEventListener("click", () => setProtocol(b.dataset.modeBtn)));
  document.querySelectorAll(".layer-toggle").forEach((b) => b.addEventListener("click", () => toggleLayer(b.dataset.layer)));
  $id("prevPoint").onclick = () => stepPoint(-1);
  $id("nextPoint").onclick = () => stepPoint(1);

  const groupSel = $id("pointGroup");
  if (groupSel) {
    const cats = [...new Set(cheekPoints.map((p) => p.category))];
    groupSel.innerHTML = `<option value="all">כל הקבוצות</option>` + cats.map((c) => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join("");
    groupSel.onchange = renderStudyTable;
  }
  if ($id("pointSearch")) $id("pointSearch").addEventListener("input", renderStudyTable);
  if ($id("tableBookToggle")) $id("tableBookToggle").addEventListener("change", renderStudyTable);

  AtlasZoom.init();
  updatePointInspectorText("CA-4");
  renderMusclesUI();
  setProtocol("all");
});
