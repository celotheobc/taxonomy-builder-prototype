export const TOUR_ROUTES = {
  SCRATCH: 'scratch',
  CONTEXT: 'context',
};

export const SCRATCH_STEPS = [
  {
    id: 'intro',
    text: 'This is the Context Model. From here there are two ways to create a new Perspective: start from scratch, or to choose the O+Es from the CM graph.',
  },
  {
    id: 'create-perspective',
    text: 'To start from scratch, locate Perspectives in the navigation tree and click the + icon to create an empty Perspective.',
  },
  {
    id: 'tab-opened',
    text: "Good. We now have an empty Perspective. Let's build it up one step at a time.",
  },
  {
    id: 'seed-sales-order',
    text: 'Choose a starting object. Add Sales Order by clicking the suggested chip, or search for it directly.',
  },
  {
    id: 'ghosts-explained',
    text: 'Sales Order has been added. The faded nodes suggest other semantic types that can be connected to it in this Perspective. These can be hidden using the top right toggle.',
  },
  {
    id: 'inspector-contextual',
    text: 'The panel on the right follows your selection. Try clicking Sales Order on the graph or in the Objects tab below.',
  },
  {
    id: 'canvas-focus',
    text: 'Click back onto the canvas to clear the selection and return to the Perspective itself.',
  },
  {
    id: 'add-customer',
    text: 'Add the Customer Object type by using the suggested connection on the canvas.',
  },
  {
    id: 'add-delivery-item',
    text: 'Next, add Delivery Item.',
  },
  {
    id: 'add-delivery',
    text: "Now add Delivery. This introduces a cycle, which we'll need to resolve.",
  },
  {
    id: 'resolve-cycle',
    text: 'Perspectives require a single valid path between entities. Hover the options in the right panel to preview the outcome, then remove one relationship.',
  },
  {
    id: 'add-disconnected',
    text: "We're back in editing mode. Click + Add to browse all available object types, then choose Accounts Hub.",
  },
  {
    id: 'vendor-hub-path',
    text: 'Accounts Hub can be connected in several ways. Choose a path that makes sense for this Perspective. If it introduces a cycle, resolve it as before.',
  },
  {
    id: 'event-discovery',
    text: 'In Show suggestions, turn off Objects and turn on Event Sources.',
  },
  {
    id: 'add-events',
    text: 'Add an Event Source to see it appear on the canvas.',
  },
  {
    id: 'inventory-tabs',
    text: 'Open the Included Objects tab beneath the graph. Click an object to highlight it on the canvas. Then try Events and Relationships as well.',
  },
  {
    id: 'finish',
    text: "That's the complete build-from-scratch workflow: start with a scope, add context, resolve ambiguity, and refine as needed.",
  },
];

export const CONTEXT_STEPS = [
  {
    id: 'cm-intro',
    text: "Sometimes it's easier to start by exploring what's already available in the Context Model. This route explores that approach.",
  },
  {
    id: 'cm-select-assets',
    text: 'Click Select assets at the bottom left of the graph to begin creating a scoped selection.',
  },
  {
    id: 'cm-choose-assets',
    text: "Select whichever Objects and Events are relevant to the Perspective you'd like to create.",
  },
  {
    id: 'cm-add-to-perspective',
    text: "Once you've made your selection, click Add to perspective.",
  },
  {
    id: 'cm-new-perspective',
    text: 'Choose New perspective to create a Perspective from your selected assets.',
  },
  {
    id: 'cm-tab-opened',
    text: 'A new Perspective opens in its own tab. From here, refinement works exactly the same as in the build-from-scratch flow.',
  },
  {
    id: 'cm-finish',
    text: "That's the Context Model workflow: start with an existing scope, then refine it using the graph.",
  },
];
