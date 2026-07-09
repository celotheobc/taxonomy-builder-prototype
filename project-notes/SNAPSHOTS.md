# Snapshots

Lightweight rollback points for major prototype iterations.

## Cover — Prototype picker

**Date:** 2026-06-11  
**Location:** [`src/pages/cover/PrototypeCover.jsx`](../src/pages/cover/PrototypeCover.jsx)

Entry point with cards for v1, v2, and v3. Default route on first visit.

---

## v1 — Graph-first prototype (archived)

**Date:** 2026-06-25  
**Label:** `v1-graph-first`  
**Location:** [`src/pages/v1/PerspectiveBuilderV1.jsx`](../src/pages/v1/PerspectiveBuilderV1.jsx)

Frozen copy of the original stacked asset-page layout.

**Access:** Cover → v1

---

## v1.5 — Asset layout exploration (archived)

**Date:** 2026-06-25  
**Label:** `v1.5-asset-layout`  
**Location:** [`src/pages/v1_5/`](../src/pages/v1_5/)

Intermediate IDE-like layout before simplification pass.

---

## v2 — Simplified graph-first builder

**Date:** 2026-06-11  
**Label:** `v2-simplified`  
**Location:** [`src/pages/v2/`](../src/pages/v2/)

Graph-primary editing with unified suggestions, contextual inspector, bottom inventory.

**Access:** Cover → v2

---

## v3 — Create from Context Model selection (new)

**Date:** 2026-06-11  
**Label:** `v3-context-selection`  
**Location:** [`src/pages/v3/`](../src/pages/v3/)

Two-stage creation route:

1. **Select from Context Model** — browse wider graph, basket selection, process seeding
2. **Refine Perspective** — reuses v2 builder with initial objects/events

**Access:** Cover → v3

**Demo A:** Start from process → Order to Cash → Create Perspective → resolve cycle if needed

**Demo B:** Manual select Customer, Sales Order, Delivery, Delivery Item → Create Perspective
