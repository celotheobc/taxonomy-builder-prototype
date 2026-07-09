/**
 * Canonical Order-to-Cash progressive demo — single source of truth for the
 * walkthrough shown when sharing the prototype.
 *
 * Flow:
 * 1. Start with Sales Order (empty-state chip or search)
 * 2. Expand Customer, Delivery, Delivery Item via ghost nodes
 * 3. Four-edge delivery loop cycle → resolve in right panel
 * 4. Insert Accounts Hub → choose connection path in right panel
 */

import { objects, relationships } from './mockData';

/** Objects that form the delivery-loop cycle demo */
export const DEMO_CYCLE_QUARTET = [
  'customer',
  'sales-order',
  'delivery',
  'delivery-item',
];

/** Relationships active when the quartet is included (shortest loop edges) */
export const DEMO_CYCLE_EDGE_IDS = [
  'r-customer-so',
  'r-so-delivery',
  'r-delivery-di',
  'r-customer-di',
];

/** Ghost neighbours offered while building the quartet from Sales Order */
export const DEMO_QUARTET_GHOST_NEIGHBOURS = new Set([
  'customer',
  'delivery',
  'delivery-item',
]);

/** Hidden from ghost discovery until the delivery loop is resolved */
export const DEMO_GATED_UNTIL_CYCLE_RESOLVED = new Set([
  'invoice',
  'sales-order-item',
  'invoice-item',
  'product',
  'material',
  'plant',
  'returns-processing',
]);

/** Empty-state suggested chip(s) — step 1 of the demo */
export const DEMO_START_OBJECT_IDS = ['sales-order'];

/** Insert-only object for step 4 */
export const DEMO_VENDOR_HUB_ID = 'vendor-hub';

/**
 * Curated Accounts Hub bridge paths (≥2 hops). Shown after cycle resolution.
 * `createsCycle` marks the demo path that re-introduces ambiguity.
 */
export const DEMO_VENDOR_HUB_PATHS = [
  {
    id: 'path-vh-material',
    relIds: ['r-vh-material', 'r-material-di'],
    createsCycle: false,
  },
  {
    id: 'path-vh-plant',
    relIds: ['r-vh-plant', 'r-plant-delivery'],
    createsCycle: false,
  },
  {
    id: 'path-vh-product',
    relIds: ['r-vh-product', 'r-product-soi', 'r-soi-di'],
    createsCycle: false,
  },
  {
    id: 'path-vh-rp',
    relIds: ['r-vh-rp', 'r-rp-customer'],
    createsCycle: true,
  },
];

export function isDemoCycleQuartetComplete(includedObjects) {
  return DEMO_CYCLE_QUARTET.every((id) => includedObjects.has(id));
}

export function isDemoBuildingQuartet(includedObjects) {
  return (
    includedObjects.has('sales-order') && !isDemoCycleQuartetComplete(includedObjects)
  );
}

/**
 * Limit ghost-node suggestions so the progressive demo stays on the quartet path
 * until the delivery loop is resolved.
 */
export function filterDemoGhostNeighbourIds(
  neighbourIds,
  includedObjects,
  { cycleResolved },
) {
  if (cycleResolved) {
    return neighbourIds;
  }

  if (isDemoBuildingQuartet(includedObjects)) {
    return neighbourIds.filter((id) => DEMO_QUARTET_GHOST_NEIGHBOURS.has(id));
  }

  if (
    includedObjects.size === 1 &&
    includedObjects.has('sales-order')
  ) {
    return neighbourIds.filter((id) => DEMO_QUARTET_GHOST_NEIGHBOURS.has(id));
  }

  if (!cycleResolved) {
    return neighbourIds.filter((id) => !DEMO_GATED_UNTIL_CYCLE_RESOLVED.has(id));
  }

  return neighbourIds;
}

export function getDemoObjectName(objectId) {
  return objects.find((o) => o.id === objectId)?.name ?? objectId;
}
