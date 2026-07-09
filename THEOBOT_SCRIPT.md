# TheoBot — Tour Guide Script & Behaviour

> Offline reference for editing copy and flow.  
> **Live copy:** `src/components/demoTour/demoTourSteps.js`  
> **Completion logic:** `src/components/demoTour/useDemoTourProgress.js`

---

## Product context (sharing / framing)

The prototype now supports two entry paths:

- **Build from scratch** — start with a seed object and progressively construct a perspective using graph suggestions, cycle resolution and disconnected path insertion.
- **Start from existing context** — begin in the Context Model, select a set of objects/events relevant to the problem space, and create a new Perspective from that scoped selection.

The graph-first interaction model remains the same in both cases. The graph acts as the primary editing surface, while the right panel remains contextual to the current selection and the bottom section acts as an inventory of included entities and relationships.

**TheoBot** explains not just how to use the UI, but why certain concepts exist (e.g. why Perspectives require cycle resolution, why they act as scoped lenses onto the Context Model, etc.). The intention is to make the conceptual model easier to understand for someone encountering Perspectives for the first time.

Perspectives shouldn't feel like an isolated asset type. They feel much more natural when presented as a way of creating a focused working context from a larger model, process, or business problem space.

Open question: whether the “start from existing context/process” path should become the primary onboarding experience, with the empty canvas remaining as an expert workflow.

---

## What TheoBot is

**TheoBot** is an in-prototype **tour guide** for **v3** of the Perspective Builder. It is not a chatbot — it is a **persistent checklist companion** that:

- Lives as your avatar in the **bottom-left Studio nav**
- Opens a **checklist panel** above the nav avatar (anchored bottom-left, clear of the Select assets button)
- Tracks **two demo routes**: **Build from scratch** and **Context Model**
- **Auto-checks steps** as the user performs real actions in the UI
- Shows **progress %** inside the open panel

---

## How it works (mechanics)

| Element | Behaviour |
|--------|-----------|
| **Trigger** | Click TheoBot avatar in L0 nav (bottom left) |
| **Panel** | Opens above the avatar, anchored bottom-left; closes with × |
| **Routes** | Tabs: **Build from scratch** · **Context Model** |
| **Steps** | Ordered list; current step highlighted; completed steps show ✓ |
| **Progress** | `%` badge + bar in panel header |
| **Completion** | Steps tick automatically when app state matches |
| **Scope** | v3 only |

---

## UI chrome (fixed strings)

| Location | Copy |
|----------|------|
| Panel eyebrow | Tour guide |
| Panel title | TheoBot |
| Route tabs | Build from scratch · Context Model |
| Footer hint | TheoBot checks off steps as you complete actions in the prototype. |
| All-done button | Mark route complete |

---

## Route A — Build from scratch (17 steps)

| # | Step ID | Copy |
|---|---------|------|
| 1 | `intro` | This is the Context Model. From here there are two ways to create a new Perspective: start from scratch, or to choose the O+Es from the CM graph. |
| 2 | `create-perspective` | To start from scratch, locate Perspectives in the navigation tree and click the + icon to create an empty Perspective. |
| 3 | `tab-opened` | Good. We now have an empty Perspective. Let's build it up one step at a time. |
| 4 | `seed-sales-order` | Choose a starting object. Add Sales Order by clicking the suggested chip, or search for it directly. |
| 5 | `ghosts-explained` | Sales Order has been added. The faded nodes suggest other semantic types that can be connected to it in this Perspective. These can be hidden using the top right toggle. |
| 6 | `inspector-contextual` | The panel on the right follows your selection. Try clicking Sales Order on the graph or in the Objects tab below. |
| 7 | `canvas-focus` | Click back onto the canvas to clear the selection and return to the Perspective itself. |
| 8 | `add-customer` | Add the Customer Object type by using the suggested connection on the canvas. |
| 9 | `add-delivery-item` | Next, add Delivery Item. |
| 10 | `add-delivery` | Now add Delivery. This introduces a cycle, which we'll need to resolve. |
| 11 | `resolve-cycle` | Perspectives require a single valid path between entities. Hover the options in the right panel to preview the outcome, then remove one relationship. |
| 12 | `add-disconnected` | We're back in editing mode. Click + Add to browse all available object types, then choose Accounts Hub. |
| 13 | `vendor-hub-path` | Accounts Hub can be connected in several ways. Choose a path that makes sense for this Perspective. If it introduces a cycle, resolve it as before. |
| 14 | `event-discovery` | In Show suggestions, turn off Objects and turn on Event Sources. |
| 15 | `add-events` | Add an Event Source to see it appear on the canvas. |
| 16 | `inventory-tabs` | Open the Included Objects tab beneath the graph. Click an object to highlight it on the canvas. Then try Events and Relationships as well. |
| 17 | `finish` | That's the complete build-from-scratch workflow: start with a scope, add context, resolve ambiguity, and refine as needed. |

---

## Route B — Context Model (7 steps)

| # | Step ID | Copy |
|---|---------|------|
| 1 | `cm-intro` | Sometimes it's easier to start by exploring what's already available in the Context Model. This route explores that approach. |
| 2 | `cm-select-assets` | Click Select assets at the bottom left of the graph to begin creating a scoped selection. |
| 3 | `cm-choose-assets` | Select whichever Objects and Events are relevant to the Perspective you'd like to create. |
| 4 | `cm-add-to-perspective` | Once you've made your selection, click Add to perspective. |
| 5 | `cm-new-perspective` | Choose New perspective to create a Perspective from your selected assets. |
| 6 | `cm-tab-opened` | A new Perspective opens in its own tab. From here, refinement works exactly the same as in the build-from-scratch flow. |
| 7 | `cm-finish` | That's the Context Model workflow: start with an existing scope, then refine it using the graph. |

---

## Code map

| What | File |
|------|------|
| Step copy | `src/components/demoTour/demoTourSteps.js` |
| Completion logic | `src/components/demoTour/useDemoTourProgress.js` |
| Panel UI | `src/components/demoTour/DemoTourPopover.jsx` |
| Panel position | `src/components/demoTour/DemoTourPopover.module.css` |
| v3 integration | `src/pages/v3/PerspectiveBuilderV3.jsx` |
| L0 nav trigger | `src/pages/v3/shell/StudioL0Nav.jsx` |
