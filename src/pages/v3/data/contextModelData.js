import { eventSources, objects, relationships } from '../../../data/mockData';

/** Context Model canvas nodes — broader than a single Perspective */
export const CONTEXT_OBJECT_IDS = [
  'customer',
  'sales-order',
  'sales-order-item',
  'delivery',
  'delivery-item',
  'invoice',
  'invoice-item',
  'product',
  'material',
  'plant',
  'vendor-hub',
  'returns-processing',
];

export const CONTEXT_EVENT_IDS = [
  'create-sales-order',
  'change-sales-order',
  'create-delivery',
  'post-goods-issue',
  'create-invoice',
  'clear-invoice',
  'return-created',
];

export const CONTEXT_PROCESSES = [
  { id: 'order-to-cash', name: 'Order to Cash' },
  { id: 'procure-to-pay', name: 'Procure to Pay' },
  { id: 'returns-management', name: 'Returns Management' },
];

/** Process → seed selection for Perspective creation */
export const PROCESS_SEEDS = {
  'order-to-cash': {
    objects: ['customer', 'sales-order', 'delivery', 'delivery-item', 'invoice'],
    events: [
      'create-sales-order',
      'create-delivery',
      'post-goods-issue',
      'create-invoice',
    ],
  },
  'procure-to-pay': {
    objects: ['material', 'plant', 'vendor-hub', 'product'],
    events: ['create-delivery', 'post-goods-issue'],
  },
  'returns-management': {
    objects: ['customer', 'returns-processing', 'delivery-item', 'invoice'],
    events: ['return-created', 'clear-invoice'],
  },
};

/** Manual layout positions for the Context Model graph (legacy — prefer computeContextModelPositions) */
export const CONTEXT_NODE_POSITIONS = {
  customer: { x: 120, y: 200 },
  'sales-order': { x: 280, y: 160 },
  'sales-order-item': { x: 440, y: 200 },
  delivery: { x: 280, y: 320 },
  'delivery-item': { x: 440, y: 320 },
  invoice: { x: 600, y: 200 },
  'invoice-item': { x: 600, y: 320 },
  product: { x: 440, y: 80 },
  material: { x: 760, y: 80 },
  plant: { x: 760, y: 200 },
  'vendor-hub': { x: 920, y: 140 },
  'returns-processing': { x: 120, y: 380 },
  'create-sales-order': { x: 200, y: 60 },
  'change-sales-order': { x: 340, y: 40 },
  'create-delivery': { x: 200, y: 420 },
  'post-goods-issue': { x: 360, y: 440 },
  'create-invoice': { x: 520, y: 60 },
  'clear-invoice': { x: 680, y: 40 },
  'return-created': { x: 60, y: 300 },
  'order-to-cash': { x: 40, y: 520 },
  'procure-to-pay': { x: 320, y: 540 },
  'returns-management': { x: 600, y: 520 },
};

export function getContextObjectName(id) {
  if (id === 'vendor-hub') return 'Accounts Hub';
  return objects.find((o) => o.id === id)?.name ?? id;
}

export function getContextEventName(id) {
  return eventSources.find((e) => e.id === id)?.name ?? id;
}

export function countSuggestedRelationships(objectIds) {
  const set = new Set(objectIds);
  return relationships.filter((r) => set.has(r.source) && set.has(r.target)).length;
}

export function getSuggestedRelationshipIds(objectIds) {
  const set = new Set(objectIds);
  return relationships
    .filter((r) => set.has(r.source) && set.has(r.target))
    .map((r) => r.id);
}

function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

/** Human-readable CM selection summary for the action bar */
export function formatSelectionSummary(objectCount, eventCount) {
  const total = objectCount + eventCount;
  if (total === 0) {
    return '0 selected';
  }

  const parts = [];
  if (objectCount > 0) {
    parts.push(
      `${objectCount} ${pluralize(objectCount, 'object', 'objects')}`,
    );
  }
  if (eventCount > 0) {
    parts.push(`${eventCount} ${pluralize(eventCount, 'event', 'events')}`);
  }

  if (parts.length === 1) {
    return `${parts[0]} selected`;
  }
  return `${parts[0]} and ${parts[1]} selected`;
}
