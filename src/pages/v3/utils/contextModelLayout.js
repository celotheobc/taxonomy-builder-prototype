import { eventLinks, relationships } from '../../../data/mockData';
import {
  CONTEXT_EVENT_IDS,
  CONTEXT_OBJECT_IDS,
  CONTEXT_PROCESSES,
} from '../data/contextModelData';
import {
  optimizeExplorerLayoutForEdges,
  resolveExplorerOverlaps,
} from '../../../utils/explorerNodeLayout';

const LAYOUT = {
  center: { x: 520, y: 360 },
  objectRadius: 200,
  eventRadius: 310,
  processRadius: 400,
};

/** O2C-adjacent ordering so relationship lines read as a connected ring */
const OBJECT_RING_ORDER = [
  'customer',
  'sales-order',
  'sales-order-item',
  'product',
  'delivery',
  'delivery-item',
  'material',
  'plant',
  'invoice',
  'invoice-item',
  'vendor-hub',
  'returns-processing',
];

function polar(center, radius, angle) {
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}

function angleFrom(center, point) {
  return Math.atan2(point.y - center.y, point.x - center.x);
}

function buildLayoutEdges() {
  const contextObjects = new Set(CONTEXT_OBJECT_IDS);
  const contextEvents = new Set(CONTEXT_EVENT_IDS);
  const edges = [];

  for (const relationship of relationships) {
    if (!contextObjects.has(relationship.source) || !contextObjects.has(relationship.target)) {
      continue;
    }
    edges.push({
      source: `obj-${relationship.source}`,
      target: `obj-${relationship.target}`,
    });
  }

  for (const link of eventLinks) {
    if (!contextEvents.has(link.eventId) || !contextObjects.has(link.objectId)) {
      continue;
    }
    edges.push({
      source: `evt-${link.eventId}`,
      target: `obj-${link.objectId}`,
    });
  }

  return edges;
}

function seedRadialPositions() {
  const { center, objectRadius, eventRadius, processRadius } = LAYOUT;
  const entityPositions = {};

  const ringObjects = OBJECT_RING_ORDER.filter((id) => CONTEXT_OBJECT_IDS.includes(id));
  ringObjects.forEach((id, index) => {
    const angle = (index / ringObjects.length) * Math.PI * 2 - Math.PI / 2;
    entityPositions[id] = polar(center, objectRadius, angle);
  });

  const eventsByObject = new Map();
  for (const eventId of CONTEXT_EVENT_IDS) {
    const link = eventLinks.find((entry) => entry.eventId === eventId);
    const objectId = link?.objectId;
    if (!objectId) continue;
    if (!eventsByObject.has(objectId)) eventsByObject.set(objectId, []);
    eventsByObject.get(objectId).push(eventId);
  }

  for (const [objectId, eventIds] of eventsByObject) {
    const anchor = entityPositions[objectId] ?? center;
    const baseAngle = angleFrom(center, anchor);

    eventIds.forEach((eventId, index) => {
      const spread = (index - (eventIds.length - 1) / 2) * 0.22;
      entityPositions[eventId] = polar(center, eventRadius, baseAngle + spread);
    });
  }

  CONTEXT_PROCESSES.forEach((process, index) => {
    const count = CONTEXT_PROCESSES.length;
    const angle = Math.PI / 2 + (index - (count - 1) / 2) * 0.42;
    entityPositions[process.id] = polar(center, processRadius, angle);
  });

  return entityPositions;
}

function toNodePositions(entityPositions) {
  const nodePositions = {};
  for (const id of CONTEXT_OBJECT_IDS) {
    nodePositions[`obj-${id}`] = entityPositions[id] ?? { x: 0, y: 0 };
  }
  for (const id of CONTEXT_EVENT_IDS) {
    nodePositions[`evt-${id}`] = entityPositions[id] ?? { x: 0, y: 0 };
  }
  for (const proc of CONTEXT_PROCESSES) {
    nodePositions[`proc-${proc.id}`] = entityPositions[proc.id] ?? { x: 0, y: 0 };
  }
  return nodePositions;
}

function toEntityPositions(nodePositions) {
  const entityPositions = {};
  for (const id of CONTEXT_OBJECT_IDS) {
    entityPositions[id] = nodePositions[`obj-${id}`];
  }
  for (const id of CONTEXT_EVENT_IDS) {
    entityPositions[id] = nodePositions[`evt-${id}`];
  }
  for (const proc of CONTEXT_PROCESSES) {
    entityPositions[proc.id] = nodePositions[`proc-${proc.id}`];
  }
  return entityPositions;
}

/** Radial seed + collision resolution + edge-aware tuning for explorer nodes */
export function computeContextModelPositions() {
  const seeded = seedRadialPositions();
  const nodePositions = toNodePositions(seeded);
  const nodeIds = Object.keys(nodePositions);
  const layoutEdges = buildLayoutEdges();

  let resolved = resolveExplorerOverlaps(nodePositions, nodeIds);
  resolved = optimizeExplorerLayoutForEdges(resolved, nodeIds, layoutEdges);

  return toEntityPositions(resolved);
}

export function contextModelNodeId(kind, entityId) {
  if (kind === 'object') return `obj-${entityId}`;
  if (kind === 'event') return `evt-${entityId}`;
  return `proc-${entityId}`;
}

export function contextModelPositionMap(nodes) {
  return Object.fromEntries(nodes.map((node) => [node.id, node.position]));
}
