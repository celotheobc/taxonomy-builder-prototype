# Changelog

Major iterations of the Perspective Builder offline prototype.

---

## 2026-06-11 — v3 Create from Context Model selection

**What changed**
- Added **prototype cover page** with cards for v1, v2, and v3
- New **v3** two-stage flow: Context Model browser → refine in existing graph-first builder
- Stage 1: simplified Context Model graph, selection mode, Perspective selection basket, process seeding
- Stage 2: reuses v2 builder shell with pre-populated objects and events
- v3 bottom panel omits Metrics tab (Objects, Relationships, Event Sources, Issues, Agent Context)
- Added `return-created` event to mock data; `useProgressiveBuilder` accepts initial included sets

**Why**
- Explore “shopping basket” creation: select from the wider model, then refine on the graph

**Files / areas touched**
- `src/pages/cover/` — prototype cover
- `src/pages/v3/` — context browser, selection panel, refine view
- `src/App.jsx` — cover + v3 routing
- `src/data/mockData.js` — Return Created event

---

## 2026-06-11 — Version consolidation

**What changed**
- Promoted simplified prototype (formerly v3) to **v2** — now the default
- Archived asset-layout iteration as **v1.5** at `src/pages/v1_5/` (not in nav)
- Side nav shows **v1** and **v2** only
- Session storage: saved `v3` or legacy `v2` values open current v2

---

## 2026-06-11 — Simplified interaction model (shipped as v2)

**What changed**
- Added v3 route (default): graph-primary editing, inspector explains, bottom panel inventories
- v2 archived unchanged — switch via left-nav version picker (v1 / v2 / v3)
- Canvas: combined **Show suggestions** + type filters (replaces Discovery + “Show only included”)
- Canvas: removed Auto layout and bottom HUD in v3
- Canvas: **+ Add** button with clearer search-and-add intent (distinct from ghost suggestions)
- Inspector: perspective view is metadata-only; object view drops Domain, Available to add, Set expansion hub
- Inspector: included relationships are clickable — select and highlight on graph
- Selecting an included object auto-sets expansion context (ghost suggestions update)
- Bottom tabs renamed: Included Objects / Relationships / Event Sources / Metrics

**Why**
- Reduce duplicate controls and terminology; make the graph the single editing surface

**Files / areas touched**
- `src/pages/v3/` — new page, inspector, bottom panel, layout
- `src/components/graph/CanvasSuggestionsControls.jsx` — unified suggestion visibility
- `src/components/graph/PerspectiveGraph.jsx` — `canvasUiVariant` prop
- `src/components/configuration/ConfigurationModule.jsx` — v3 canvas wiring
- `src/App.jsx` — v3 routing (default)

---

## 2026-06-25 — Asset layout exploration (archived as v1.5)

**What changed**
- Archived v1 as [`src/pages/v1/PerspectiveBuilderV1.jsx`](../src/pages/v1/PerspectiveBuilderV1.jsx)
- Added v2 route: **Perspective Builder v2 — Asset layout exploration**
- New IDE-like layout: main graph work surface, collapsible right inspector, collapsible bottom tabbed panel
- Graph-first interactions preserved from v1 (progressive build, discover toggles, ghosts, bridging, cycle scissors)
- Selection model links graph ↔ right inspector ↔ bottom panel tables
- Tables moved from stacked page into bottom panel tabs
- Agent Context moved to bottom panel tab
- Subtle v1/v2 navigation in app shell

**Why**
- Workshop "555" explored IDE/Figma-style asset page with contextual inspector and output panel
- Goal: keep resonant graph editing; change information architecture around it

**Files / areas touched**
- `src/App.jsx` — version routing
- `src/pages/v1/` — archived v1 page
- `src/pages/v2/` — new layout, inspector, bottom panel
- `src/hooks/useProgressiveBuilder.js` — remove entity helpers
- `src/hooks/useGraphBuilderContext.js` — shared graph context
- `src/components/graph/PerspectiveGraph.jsx` — selection callbacks, fill height
- `src/utils/perspectiveEntities.js` — metric rows

**Known issues**
- v2 uses global discover-toggles mode only (no contextual / cycle-demo tabs yet)
- Panel resize is basic (collapse toggle + CSS resize)
- Remove-from-perspective actions are prototype-level (no API persistence)

---

## Earlier — v1 graph-first prototype

**What changed**
- Graph-first Perspective configuration on stacked Semantic Types asset page
- Progressive expansion, disconnected insert, cycle resolution on edges
- Table header + insert buttons, graph height tuning

**Location:** Preserved in `src/pages/v1/`
