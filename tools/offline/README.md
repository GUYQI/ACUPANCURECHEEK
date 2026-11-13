# Offline edition: HTML + PDF

Builds two offline files from the published site (the `main` branch, as served at
<https://guyqi.github.io/ACUPANCURECHEEK/>):

| File | What it is |
| --- | --- |
| `offline/cheek-acupuncture-atlas.html` | The whole site in one file: CSS, the Heebo font, images, data and scripts are all embedded. Open it in any browser without internet. Everything works except the YouTube videos. |
| `offline/cheek-acupuncture-atlas.pdf` | An A4 document with all content expanded: a card for each of the 16 points and the 7 muscles, the protocols, all cases from the book, the glossary and sources. It has a light colour scheme, a table of contents, and bookmarks for every section, point and muscle. |

## Rebuild after the site changes

```bash
git worktree add /tmp/atlas-main origin/main   # a checkout of the live site
cd tools/offline
npm install                                    # tailwindcss 3 (Playwright/Chromium must already be installed)
npm run build -- /tmp/atlas-main
```

## How it works

1. **CSS.** The live page loads Tailwind's runtime from a CDN, which fails offline. `build.js` compiles the classes the site actually uses into static CSS.
2. **Single file.** The CSS, the Heebo font (`fonts/`, SIL OFL), `data/*.js` and `js/*.js` are inlined into `index.html`. The images are already embedded in the page.
3. **PDF.** Chromium opens the result with all network requests blocked, which also verifies the offline build. Then `print-transform.js`:
   - clones the atlas card for every point, muscle and protocol;
   - opens all collapsible sections and shows every case;
   - removes screen-only controls and adds a table of contents;
   - converts the dark theme to a light one (inverts lightness, keeps hue). The anatomical map keeps its original colours.

   It rearranges and recolours existing content only.

`print-transform.js` relies on the element IDs of the live page (`pointInspectorCard`, `muscleInspectorCard`, `protocolCard`, `casesList`, …). If those change, update the script.
