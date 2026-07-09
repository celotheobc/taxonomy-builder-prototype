# Perspective Builder Prototype

Interactive React prototype exploring a **graph-first** Celonis Perspective configuration experience inside the standard Semantic Types asset page framework.

## Play online

**https://celotheobc.github.io/perspective-builder-prototype/**

(Deploys automatically from `main` via GitHub Pages.)

## Important: do not open `index.html` directly

Double-clicking `index.html` will show a **blank page**. The app uses React and must be served by a local dev server.

### Easiest way (macOS)

**Double-click `Start Prototype.command`** in Finder.

- First run installs dependencies automatically.
- Your browser opens to `http://localhost:5173`.
- Keep the Terminal window open while using the prototype.

If macOS blocks the file: **Right-click → Open → Open**.

See also `HOW_TO_RUN.txt`.

### Terminal

```bash
cd "/Users/theobonhamcarter/Documents/1. Design/Cursor Projects/PerspectiveBuilder"
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser (not the HTML file).

**Requires [Node.js](https://nodejs.org/)** installed on your machine.

## Two experiences

Use the purple **Prototype experience** bar at the top:

1. **Route A — Progressive Builder**
   - Empty state → pick a seed object (try **Sales Order**)
   - Expand via **+** on ghost neighbours
   - Search **Currency Conversion** to add a disconnected object
   - Toggle **Show only included**

2. **Route B — Resolve Route Ambiguity**
   - Pre-loaded graph with Customer → Delivery Item route conflict
   - Switch **Pattern A** (Keep this route) vs **Pattern B** (✂ graph pruning)
   - Expand **Advanced details** for technical fallback

## Stack

- React 19 + Vite
- `@xyflow/react` for the graph canvas
- CSS Modules
- Mock data in `src/data/mockData.js`

## Reference images

See `ReferenceImages/` for current asset page, MakeGrid graph, historical builder, and cycle resolution context.
