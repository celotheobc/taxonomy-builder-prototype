# Taxonomy Builder — Prototype Brief

> **Audience:** Engineers and designers working on the Taxonomy Builder offline prototype.  
> **Source:** Forked from Perspective Builder shell; domain logic replaced with taxonomy V1 placeholders.

---

## 1. What this prototype is

Taxonomy Builder explores how users **split an object type into subtypes** using **existing attribute values**. The taxonomy asset is **generated behind the scenes** when the split is saved. In V1, editing happens from the **object type detail page**, not from a standalone taxonomy editor.

**Placeholder scenario (V1):**

| Item | Value |
|------|--------|
| Object type | **BSEG** |
| Split attribute | **Posting item type** |
| Generated subtypes | Invoice, Payment, Credit Memo |
| Generated taxonomy asset | `BSEG · Posting item type` (read-only metadata) |

This is an **offline standalone app**: React 19 + Vite + CSS Modules + mock data in [`src/data/mockTaxonomyData.js`](src/data/mockTaxonomyData.js). Not wired to Celonis APIs.

---

## 2. V1 product scope

**In scope**

- Studio shell: header, L0/L1 nav, workspace tabs
- Object type detail work area with subtype split placeholder
- Right inspector (Overview / Inspect)
- Bottom panel (Generated subtypes / Taxonomy asset / Source values)
- Read-only display of generated taxonomy asset as supporting metadata
- Single working experience: open **BSEG** from L1 or cover page

**User story**

Users split an object type into subtypes based on distinct values from an existing attribute. The platform generates a taxonomy asset automatically. The user configures the split from the object type page.

---

## 3. Reused from Perspective Builder

| Layer | Location |
|-------|----------|
| Studio header | `src/pages/v3/shell/StudioHeader.jsx` |
| Studio tab bar | `src/pages/v3/shell/StudioTabBar.jsx` |
| L1 nav styling | `src/pages/v3/shell/StudioL1Nav.module.css` |
| L0 nav pattern | `src/pages/taxonomy/shell/StudioL0Nav.jsx` |
| Editor layout pattern | `src/pages/v2/layout/AssetEditorLayout.module.css` |
| Resize handles | `src/pages/v1_5/layout/ResizeHandle.jsx` |
| Panel dimensions hook | `src/pages/v5/layout/usePanelDimensionsV5.js` |
| Panel tab styling | `src/pages/v5/components/PanelTabs.module.css` |
| Inspector / bottom panel CSS | `src/pages/v5/inspector/RightInspector.module.css`, `src/pages/v1_5/panels/BottomPanel.module.css` |
| App shell layout CSS | `src/pages/v3/PerspectiveBuilderV3.module.css` |
| Global styles | `src/styles/global.css` |

**New taxonomy-specific entry points**

- `src/pages/taxonomy/TaxonomyBuilderApp.jsx`
- `src/pages/taxonomy/TaxonomyRefineView.jsx`
- `src/pages/taxonomy/inspector/TaxonomyRightInspector.jsx`
- `src/pages/taxonomy/panels/TaxonomyBottomPanel.jsx`
- `src/data/mockTaxonomyData.js`

---

## 4. Removed or not wired (Perspective-specific)

The fork still contains unused Perspective Builder files on disk, but **App.jsx only loads the taxonomy experience**. The following are **not used**:

- Graph builder (`ConfigurationModule`, `PerspectiveGraph`, `@xyflow/react` usage in UI)
- Cycle resolution, scissors on edges, connection path building
- PQL preview / consequences panels
- Progressive builder hooks (`useProgressiveBuilder`, etc.)
- v1–v7 version museum and cover version list
- Demo tour
- Inventory placement A/B experiment
- Context model browser, process detail views
- Perspective-specific mock data flows

These can be deleted in a later cleanup pass once the taxonomy shell is stable.

---

## 5. Known exclusions (out of scope for now)

- CASE WHEN logic
- SQL expression builder
- Messy value normalisation (e.g. Spain / ES / España → Spain)
- Multiple subtype levels (unless trivial to show visually)
- Relationships between subtypes
- Full consumption experience downstream of the generated taxonomy

---

## 6. Running locally

```bash
cd TaxonomyBuilder
npm install
npm run dev
```

Open the cover page → **Open** → BSEG object type detail with panels.

---

## 7. Next likely steps

1. Interactive split attribute picker (still on object type page)
2. Editable subtype labels before save
3. Save action that “generates” taxonomy asset with timestamp
4. Delete dead Perspective Builder folders from `src/pages/v1` … `v7`
5. Replace placeholder center content with real split UX when spec is ready
