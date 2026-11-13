#!/usr/bin/env node
/* ==========================================================================
   Offline edition builder
   --------------------------------------------------------------------------
   Produces, from a checkout of the published site (the `main` branch):
     offline/cheek-acupuncture-atlas.html  – one self-contained, interactive file
     offline/cheek-acupuncture-atlas.pdf   – fully expanded document (A4)

   Usage (from this folder):
     npm install                          # tailwindcss (Playwright is pre-installed)
     node build.js --src <checkout of main> --out <output folder>

   What it does:
     1. Compiles the Tailwind classes the site uses into static CSS (the live
        page loads Tailwind's runtime from a CDN, which does not work offline).
     2. Inlines that CSS, the Heebo/Inter fonts, the data files and scripts into
        index.html; images are already embedded in the page.
     3. Opens the result in Chromium, runs print-transform.js and prints to PDF.
   ========================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1]]);
  return acc;
}, []));
if (!args.src) {
  console.error("Usage: node build.js --src <checkout of the live site (main branch)> [--out <folder>]");
  process.exit(2);
}
const SRC = path.resolve(args.src);
const OUT = path.resolve(args.out || "../../offline");
const HERE = __dirname;
const NAME = "cheek-acupuncture-atlas";
const BUILD_DATE = new Date().toISOString().slice(0, 10);

fs.mkdirSync(OUT, { recursive: true });
const read = (p) => fs.readFileSync(p, "utf8");

/* ---------- 1. Tailwind → static CSS ---------- */
function compileTailwind(screens) {
  const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "tw-"));
  const cfg = path.join(tmp, "tailwind.config.js");
  const input = path.join(tmp, "in.css");
  const output = path.join(tmp, "out.css");
  const content = [
    path.join(SRC, "index.html"),
    path.join(SRC, "js/**/*.js"),
    path.join(SRC, "data/**/*.js"),
    path.join(HERE, "print-transform.js"),
  ];
  fs.writeFileSync(cfg, `module.exports = { content: ${JSON.stringify(content)}, theme: ${screens ? `{ screens: ${JSON.stringify(screens)}, extend: {} }` : "{ extend: {} }"}, plugins: [] };`);
  fs.writeFileSync(input, "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");
  const bin = path.join(HERE, "node_modules/.bin/tailwindcss");
  execFileSync(bin, ["-c", cfg, "-i", input, "-o", output, "--minify"], { stdio: "pipe" });
  const css = read(output);
  fs.rmSync(tmp, { recursive: true, force: true });
  return css;
}

/* ---------- 2. Fonts → data URIs ---------- */
function fontCss() {
  const dir = path.join(HERE, "fonts");
  return read(path.join(dir, "fonts.css")).replace(/url\(([^)]+)\)/g, (_, f) => {
    const b64 = fs.readFileSync(path.join(dir, f.trim())).toString("base64");
    return `url(data:font/woff2;base64,${b64})`;
  });
}

/* ---------- 3. Assemble the single-file HTML ---------- */
// variant "screen": the offline HTML edition (Tailwind's default breakpoints)
// variant "print":  the page the PDF is rendered from. A4 gives a 718 px wide
//                   media width, so `md` is lowered to 700 px to keep the tablet
//                   layout on paper (media queries ignore CSS zoom).
const PRINT_SCREENS = { sm: "560px", md: "700px", lg: "1024px", xl: "1280px", "2xl": "1536px" };

function assemble(variant) {
  let html = read(path.join(SRC, "index.html"));
  const safeScript = (js) => js.replace(/<\/script/gi, "<\\/script");

  const removed = [];
  const drop = (re, label) => { if (re.test(html)) { html = html.replace(re, ""); removed.push(label); } };
  drop(/\s*<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, "tailwind CDN");
  drop(/\s*<link[^>]+fonts\.googleapis\.com[^>]*>/g, "Google Fonts link");
  drop(/\s*<link rel="preconnect"[^>]*>/g, "preconnect");

  const styles = `<style>/* fonts (embedded) */\n${fontCss()}\n</style>\n<style>/* Tailwind (compiled for offline use) */\n${compileTailwind(variant === "print" ? PRINT_SCREENS : null)}\n</style>`;
  html = html.replace(/<style>/, `${styles}\n  <style>`);

  html = html.replace(/<script src="((?:data|js)\/[^"]+)"><\/script>/g, (_, rel) =>
    `<script>/* ${rel} */\n${safeScript(read(path.join(SRC, rel)))}\n</script>`);

  if (variant === "print") html = html.replace(/\(max-width:\s*767px\)/g, "(max-width: 699px)");

  const leftover = html.match(/<(?:script|link)[^>]+(?:src|href)="(?!data:|#)[^"]+"/g) || [];
  const banner = `<div dir="rtl" style="background:#0b3b38;color:#d1fae5;font:600 12px/1.5 Heebo,sans-serif;padding:6px 14px;text-align:center">גרסה לא מקוונת של אטלס דיקור הלחי · נוצרה ב-${BUILD_DATE} · הכל עובד בלי אינטרנט חוץ מסרטוני YouTube</div>`;
  if (variant === "screen") html = html.replace(/<body([^>]*)>/, `<body$1>\n${banner}`);
  return { html, removed, leftover };
}

function buildHtml() {
  const { html, removed, leftover } = assemble("screen");
  const file = path.join(OUT, `${NAME}.html`);
  fs.writeFileSync(file, html);
  return { file, removed, leftover };
}

/* ---------- 4. PDF ---------- */
async function buildPdf() {
  const tmpDir = fs.mkdtempSync(path.join(require("os").tmpdir(), "atlas-pdf-"));
  const htmlFile = path.join(tmpDir, "print.html");
  fs.writeFileSync(htmlFile, assemble("print").html);
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  // Print at scale 1 (Chromium shifts right-to-left pages when `scale` < 1) and
  // shrink with CSS zoom instead: A4 printable width 190mm ≈ 718 CSS px; at zoom
  // 0.8 the page lays out at ≈ 898 px, so the site's tablet layout is used.
  const ZOOM = 0.8;
  const PRINT_W = Math.floor(((210 - 20) / 25.4) * 96);
  const page = await browser.newPage({ viewport: { width: PRINT_W, height: 1400 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route(/^https?:/, (r) => r.abort());          // prove it works with no network
  await page.goto("file://" + htmlFile, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate((d) => { window.__BUILD_DATE__ = d; }, BUILD_DATE);
  await page.addStyleTag({ content: `html { zoom: ${ZOOM}; }` });
  await page.addScriptTag({ path: path.join(HERE, "print-transform.js") });
  await page.waitForTimeout(300);

  const file = path.join(OUT, `${NAME}.pdf`);
  await page.pdf({
    path: file,
    format: "A4",
    printBackground: true,
    scale: 1,
    outline: true,
    tagged: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div dir="rtl" style="width:100%;font-size:8px;color:#64748b;padding:0 10mm;display:flex;justify-content:space-between;font-family:sans-serif">
        <span>אטלס דיקור לחי · 颊针 · Cheek Acupuncture</span>
        <span>עמוד <span class="pageNumber"></span> מתוך <span class="totalPages"></span></span></div>`,
    margin: { top: "12mm", bottom: "14mm", left: "10mm", right: "10mm" },
  });
  await browser.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
  return { file, errors };
}

(async () => {
  const h = buildHtml();
  console.log(`HTML  ${path.relative(process.cwd(), h.file)}  ${(fs.statSync(h.file).size / 1024).toFixed(0)} KB`);
  console.log(`      removed: ${h.removed.join(", ") || "-"}`);
  console.log(`      external refs left: ${h.leftover.length ? h.leftover.join(" | ") : "none"}`);
  const p = await buildPdf();
  console.log(`PDF   ${path.relative(process.cwd(), p.file)}  ${(fs.statSync(p.file).size / 1024).toFixed(0)} KB`);
  if (p.errors.length) { console.error("page errors:", p.errors); process.exitCode = 1; }
})();
