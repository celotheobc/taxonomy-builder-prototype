import { getNodeCenter } from './graphEdgeLayout';
import { relationships } from '../data/mockData';
import { DEMO_CYCLE_QUARTET } from '../data/demoScenario';
import { ROUTE_AMBIGUITY_OBJECTS } from '../data/routeDetection';

/** Demo walkthrough: Customer → Sales Order → Delivery → Delivery Item */
const CHAIN = DEMO_CYCLE_QUARTET;

/** Cycle quartet — Customer TL, Delivery Item TR, Sales Order BL, Delivery BR */
const CYCLE_SQUARE = {
  customer: { x: 200, y: 248 },
  'delivery-item': { x: 560, y: 248 },
  'sales-order': { x: 200, y: 448 },
  delivery: { x: 560, y: 448 },
};
const ROUTE_RESOLVE_TOP_INSET = 88;
const CHAIN_Y = 268;
const CLUSTER_CENTER_X = 400;
const CHAIN_STEP = 96;
const EAST_COLUMN_GAP = 132;
const HUB_RING_DISTANCE = 108;
const CYCLE_GHOST_RADIUS = 104;
const VENDOR_HUB_LEFT_GAP = 300;

const NODE_LAYOUT = { width: 148, height: 108 };
const PENDING_NODE_LAYOUT = { width: 200, height: 148 };
const NODE_W = NODE_LAYOUT.width;
const NODE_H = NODE_LAYOUT.height;
const NODE_ORIGIN_X = 0.5;
const NODE_ORIGIN_Y = 0.34;
const NODE_MARGIN = 14;
/** Vertical gap between object cluster and event/metric lanes */
const ENRICHMENT_LANE_GAP = 88;
const ENRICHMENT_SIBLING_SPREAD = 44;

function nodeBounds(pos, layout = NODE_LAYOUT) {
  const w = layout.width;
  const h = layout.height;
  return {
    l: pos.x - w * NODE_ORIGIN_X,
    r: pos.x + w * (1 - NODE_ORIGIN_X),
    t: pos.y - h * NODE_ORIGIN_Y,
    b: pos.y + h * (1 - NODE_ORIGIN_Y),
  };
}

function resolveOverlaps(positions, ids, anchorId = null, nodeLayouts = {}) {
  const pos = Object.fromEntries(
    Object.entries(positions).map(([id, p]) => [id, { ...p }]),
  );
  const anchor = anchorId && pos[anchorId] ? { ...pos[anchorId] } : null;

  for (let iter = 0; iter < 36; iter += 1) {
    let moved = false;
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const a = ids[i];
        const b = ids[j];
        const ba = nodeBounds(pos[a], nodeLayouts[a] ?? NODE_LAYOUT);
        const bb = nodeBounds(pos[b], nodeLayouts[b] ?? NODE_LAYOUT);
        const overlapX = Math.min(ba.r, bb.r) - Math.max(ba.l, bb.l);
        const overlapY = Math.min(ba.b, bb.b) - Math.max(ba.t, bb.t);
        if (overlapX <= 0 || overlapY <= 0) continue;
        moved = true;
        const sepX = overlapX + NODE_MARGIN;
        const sepY = overlapY + NODE_MARGIN;
        if (sepX <= sepY) {
          const dir = pos[b].x >= pos[a].x ? 1 : -1;
          const half = sepX / 2;
          if (a !== anchorId) pos[a].x -= dir * half;
          if (b !== anchorId) pos[b].x += dir * half;
        } else {
          const dir = pos[b].y >= pos[a].y ? 1 : -1;
          const half = sepY / 2;
          if (a !== anchorId) pos[a].y -= dir * half;
          if (b !== anchorId) pos[b].y += dir * half;
        }
      }
    }
    if (anchor) pos[anchorId] = { ...anchor };
    if (!moved) break;
  }
  return pos;
}

const HUB_RING_DIAGONAL = {
  'sales-order-item': { x: -1, y: -1 },
  customer: { x: -1, y: 1 },
  delivery: { x: 1, y: -1 },
  invoice: { x: 1, y: 1 },
  'delivery-item': { x: 1.15, y: 0 },
  product: { x: -1.1, y: 0 },
  material: { x: 1.2, y: -0.55 },
  plant: { x: 0.15, y: 1.2 },
};

const CYCLE_GHOST_SLOTS = {
  plant: { dx: 0, dy: 0 },
  'sales-order-item': { dx: -0.92, dy: -0.28 },
  material: { dx: 0.22, dy: -0.92 },
  'invoice-item': { dx: 0.9, dy: 0.32 },
  invoice: { dx: -0.72, dy: 0.82 },
  product: { dx: -0.38, dy: -0.88 },
};

function hubRingOffset(objectId, hub) {
  const d = HUB_RING_DISTANCE;
  const slot = HUB_RING_DIAGONAL[objectId];
  if (!slot) return null;
  return { x: hub.x + slot.x * d, y: hub.y + slot.y * d };
}

function shouldUseHubRing(includedObjects) {
  const onChain = CHAIN.filter((id) => includedObjects.has(id));
  return onChain.length <= 1 && includedObjects.has('sales-order');
}

function shouldUseCycleSquare(includedObjects) {
  return ROUTE_AMBIGUITY_OBJECTS.every((id) => includedObjects.has(id));
}

function shouldUseVerticalStack(includedObjects) {
  if (shouldUseCycleSquare(includedObjects)) return false;
  const onChain = CHAIN.filter((id) => includedObjects.has(id));
  return (
    onChain.length === 2 &&
    includedObjects.has('customer') &&
    includedObjects.has('sales-order')
  );
}

function cycleSquareCentroid(positions, objectIncluded) {
  const pts = ROUTE_AMBIGUITY_OBJECTS.filter(
    (id) => objectIncluded.has(id) && positions[id],
  ).map((id) => positions[id]);
  if (!pts.length) return { x: CLUSTER_CENTER_X, y: CHAIN_Y };
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  };
}

function hashSlot(objectId) {
  const h = objectId.length * 17 + objectId.charCodeAt(0);
  const angle = ((h % 16) / 16) * Math.PI * 2;
  return { dx: Math.cos(angle), dy: Math.sin(angle) };
}

function cycleGhostPosition(objectId, positions, objectIncluded) {
  const c = cycleSquareCentroid(positions, objectIncluded);
  const slot = CYCLE_GHOST_SLOTS[objectId] ?? hashSlot(objectId);
  const r = slot.dx === 0 && slot.dy === 0 ? 0 : CYCLE_GHOST_RADIUS;
  return { x: c.x + slot.dx * r, y: c.y + slot.dy * r };
}

function pendingVendorHubPosition(positions, objectIncluded) {
  const ids = ROUTE_AMBIGUITY_OBJECTS.filter(
    (id) => objectIncluded.has(id) && positions[id],
  );
  if (!ids.length) return { x: 100, y: CHAIN_Y };
  let minX = Infinity;
  let sumY = 0;
  for (const id of ids) {
    minX = Math.min(minX, positions[id].x);
    sumY += positions[id].y;
  }
  return { x: minX - VENDOR_HUB_LEFT_GAP, y: sumY / ids.length };
}

function verticalStackGhostPosition(objectId, positions) {
  const cust = positions.customer;
  const so = positions['sales-order'];
  if (!cust || !so) return null;
  const eastX = Math.max(cust.x, so.x) + EAST_COLUMN_GAP;
  const slots = {
    'delivery-item': { x: eastX, y: cust.y },
    invoice: { x: eastX, y: so.y },
    'sales-order-item': { x: eastX, y: cust.y - 52 },
    delivery: { x: eastX + 52, y: (cust.y + so.y) / 2 },
    product: { x: eastX, y: cust.y - 48 },
  };
  return slots[objectId] ?? { x: eastX, y: (cust.y + so.y) / 2 };
}

function chainPosition(objectId, includedObjects) {
  const active = CHAIN.filter((id) => includedObjects.has(id));
  const idx = active.indexOf(objectId);
  if (idx < 0) return null;
  const span = Math.max(0, active.length - 1) * CHAIN_STEP;
  const startX = CLUSTER_CENTER_X - span / 2;
  return { x: startX + idx * CHAIN_STEP, y: CHAIN_Y };
}

function includedNeighbour(objectId, objectIncluded) {
  for (const r of relationships) {
    if (r.source === objectId && objectIncluded.has(r.target)) return r.target;
    if (r.target === objectId && objectIncluded.has(r.source)) return r.source;
  }
  return null;
}

function ghostPosition(objectId, objectIncluded, positions, layoutOptions = {}) {
  if (
    layoutOptions.pendingObjectId === 'vendor-hub' &&
    objectId === 'vendor-hub'
  ) {
    return pendingVendorHubPosition(positions, objectIncluded);
  }

  if (shouldUseCycleSquare(objectIncluded) && !objectIncluded.has(objectId)) {
    return cycleGhostPosition(objectId, positions, objectIncluded);
  }

  if (shouldUseVerticalStack(objectIncluded) && !objectIncluded.has(objectId)) {
    const east = verticalStackGhostPosition(objectId, positions);
    if (east) return east;
  }

  const hub = positions['sales-order'] ?? { x: CLUSTER_CENTER_X, y: CHAIN_Y };
  if (shouldUseHubRing(objectIncluded) && !objectIncluded.has(objectId)) {
    const ring = hubRingOffset(objectId, hub);
    if (ring) return ring;
  }

  const parent = includedNeighbour(objectId, objectIncluded);
  if (parent && positions[parent]) {
    const p = positions[parent];
    const c = cycleSquareCentroid(positions, objectIncluded);
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / len) * HUB_RING_DISTANCE, y: p.y + (dy / len) * HUB_RING_DISTANCE };
  }

  return { x: hub.x + 200, y: hub.y };
}

function applyVerticalStack(positions, objectIncluded) {
  const cx = CLUSTER_CENTER_X - 48;
  positions.customer = { x: cx, y: CHAIN_Y - CHAIN_STEP * 0.52 };
  positions['sales-order'] = { x: cx, y: CHAIN_Y + CHAIN_STEP * 0.52 };
}

function objectClusterBounds(positions, objectIncluded) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let count = 0;

  for (const id of objectIncluded) {
    const p = positions[id];
    if (!p) continue;
    const b = nodeBounds(p);
    minX = Math.min(minX, b.l);
    maxX = Math.max(maxX, b.r);
    minY = Math.min(minY, b.t);
    maxY = Math.max(maxY, b.b);
    count += 1;
  }

  if (!count) {
    return {
      minX: CLUSTER_CENTER_X - 80,
      maxX: CLUSTER_CENTER_X + 80,
      minY: CHAIN_Y - 60,
      maxY: CHAIN_Y + 60,
    };
  }

  return { minX, maxX, minY, maxY };
}

/** Events above / metrics below the object cluster — keeps lines off the graph core */
function layoutEventAndMetricNodes(nodes, edges, positions, objectIncluded) {
  const bounds = objectClusterBounds(positions, objectIncluded);
  const eventLaneY = bounds.minY - ENRICHMENT_LANE_GAP;
  const metricLaneY = bounds.maxY + ENRICHMENT_LANE_GAP;

  const placeLane = (ids, laneY) => {
    const byParent = new Map();
    for (const id of ids) {
      const link = edges.find((e) => e.source === id);
      const parentId = link?.target;
      if (!parentId || !objectIncluded.has(parentId) || !positions[parentId]) continue;
      if (!byParent.has(parentId)) byParent.set(parentId, []);
      byParent.get(parentId).push(id);
    }

    for (const [parentId, satelliteIds] of byParent) {
      const parentX = positions[parentId].x;
      satelliteIds.forEach((id, index) => {
        const spread =
          satelliteIds.length > 1
            ? (index - (satelliteIds.length - 1) / 2) * ENRICHMENT_SIBLING_SPREAD
            : 0;
        positions[id] = { x: parentX + spread, y: laneY };
      });
    }
  };

  const eventIds = nodes.filter((n) => n.id.startsWith('event-')).map((n) => n.id);
  const metricIds = nodes.filter((n) => n.id.startsWith('metric-')).map((n) => n.id);
  placeLane(eventIds, eventLaneY);
  placeLane(metricIds, metricLaneY);
}

/** Place newly visible discovery nodes using on-canvas anchor positions. */
export function repositionDiscoveryNodes(
  nodes,
  savedPositions,
  edges,
  includedObjects,
  layoutOptions = {},
) {
  const objectIncluded = includedObjects ?? new Set();
  const positions = {};

  for (const n of nodes) {
    const saved = savedPositions.get(n.id);
    if (saved) positions[n.id] = { ...saved };
  }

  layoutEventAndMetricNodes(nodes, edges, positions, objectIncluded);

  for (const n of nodes) {
    if (positions[n.id]) continue;
    if (n.id.startsWith('event-') || n.id.startsWith('metric-')) continue;
    positions[n.id] =
      ghostPosition(n.id, objectIncluded, positions, layoutOptions) ?? n.position;
  }

  return nodes.map((n) => ({
    ...n,
    position: positions[n.id] ?? n.position,
  }));
}

function withLayoutMeta(nodes, focalId) {
  return nodes.map((n) => ({
    ...n,
    style: {
      ...n.style,
      width: NODE_LAYOUT.width,
      height: NODE_LAYOUT.height,
      transition: 'transform 0.48s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    zIndex: n.id === focalId ? 20 : 5,
  }));
}

export function applyDemoLayout(
  nodes,
  focalId,
  edges = [],
  includedIds = null,
  includedObjects = null,
  layoutOptions = {},
) {
  if (!nodes.length) return nodes;

  const objectIncluded =
    includedObjects ?? new Set([...includedIds].filter((id) => !id.includes('-')));
  const positions = {};
  const cycleSquare = shouldUseCycleSquare(objectIncluded);
  const verticalStack = !cycleSquare && shouldUseVerticalStack(objectIncluded);
  const hubRing = !cycleSquare && !verticalStack && shouldUseHubRing(objectIncluded);

  if (cycleSquare) {
    for (const id of ROUTE_AMBIGUITY_OBJECTS) {
      if (objectIncluded.has(id)) {
        const base = CYCLE_SQUARE[id];
        positions[id] = { x: base.x, y: base.y + ROUTE_RESOLVE_TOP_INSET };
      }
    }
  } else if (verticalStack) {
    applyVerticalStack(positions, objectIncluded);
  } else if (hubRing && objectIncluded.has('sales-order')) {
    positions['sales-order'] = { x: CLUSTER_CENTER_X, y: CHAIN_Y };
  } else {
    for (const id of CHAIN) {
      if (objectIncluded.has(id)) {
        positions[id] = chainPosition(id, objectIncluded);
      }
    }
  }

  if (objectIncluded.has('invoice') && !cycleSquare) {
    const so = positions['sales-order'];
    const cust = positions.customer;
    if (so && cust) {
      positions.invoice = { x: so.x + 72, y: so.y + 62 };
    } else if (so) {
      positions.invoice = { x: so.x + 72, y: so.y + 58 };
    }
  }

  layoutEventAndMetricNodes(nodes, edges, positions, objectIncluded);

  for (const n of nodes) {
    const { id } = n;
    if (positions[id]) continue;
    if (id.startsWith('event-') || id.startsWith('metric-')) continue;

    positions[id] =
      ghostPosition(id, objectIncluded, positions, layoutOptions) ??
      { x: CLUSTER_CENTER_X + 200, y: CHAIN_Y };
  }

  const layoutIds = nodes.map((n) => n.id).filter((id) => positions[id]);
  const anchorId =
    cycleSquare || !focalId
      ? null
      : focalId && positions[focalId]
        ? focalId
        : hubRing
          ? 'sales-order'
          : null;

  const nodeLayouts = {};
  if (layoutOptions.pendingObjectId) {
    nodeLayouts[layoutOptions.pendingObjectId] = PENDING_NODE_LAYOUT;
  }

  const resolved = resolveOverlaps(positions, layoutIds, anchorId, nodeLayouts);

  const laid = nodes.map((n) => ({
    ...n,
    position: resolved[n.id] ?? n.position,
    style:
      n.id === layoutOptions.pendingObjectId
        ? {
            ...n.style,
            width: PENDING_NODE_LAYOUT.width,
            height: PENDING_NODE_LAYOUT.height,
          }
        : n.style,
    zIndex: n.id === layoutOptions.pendingObjectId ? 18 : n.zIndex,
  }));

  return withLayoutMeta(laid, focalId);
}

export function getIncludedViewportTarget(nodes, includedObjects) {
  const targets = nodes.filter((n) => includedObjects.has(n.id));
  if (!targets.length) return null;
  let sx = 0;
  let sy = 0;
  for (const n of targets) {
    const c = getNodeCenter(n.position);
    sx += c.x;
    sy += c.y;
  }
  return { x: sx / targets.length, y: sy / targets.length, nodes: targets };
}

export const DEMO_HUB = { x: CLUSTER_CENTER_X, y: CHAIN_Y };
