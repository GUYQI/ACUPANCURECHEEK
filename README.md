# אטלס דיקור לחי · Cheek Acupuncture Atlas

Interactive Hebrew guide to cheek acupuncture (颊针 Jiá Zhēn) for TCM practitioners, served with GitHub Pages:
<https://guyqi.github.io/ACUPANCURECHEEK/>

## Structure

Static site with no build step and no dependencies. GitHub Pages serves the repository root as-is (`.nojekyll`).

| File | Purpose |
| --- | --- |
| `index.html` | Page markup and static content: principles, protocol steps, technique and safety, videos, sources. It also holds the calibrated SVG anatomy layers: contour, bones, the 7 muscles and the point tracks. |
| `assets/js/data.js` | Content data: `cheekPoints` (16 points with location, palpation, needle, indications and map coordinates), `cheekMuscles` (7), `studyTable` (Hebrew Table 1 with P1/P2 use), `studyTableEn` (original English Table 1), `protocolConfigs`. |
| `assets/js/app.js` | Behaviour. Builds the atlas points and callouts and handles point/muscle/protocol selection, zoom and pan, layers, keyboard navigation, table search and filters, tabs, and navigation. |
| `assets/css/styles.css` | Design system: colour/type/spacing tokens, then components, then sections. |
| `assets/img/` | The 3D head model and the reference image (1000×828, the coordinate space of the SVG map). |

To edit content, change `data.js` (points, muscles, tables) or the static sections in `index.html`. Map coordinates (`x`, `y`, `callout`) are calibrated to the 1000×828 images, so don't change them without re-checking alignment.

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8000
```
