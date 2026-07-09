/** Object-centred radial layouts inspired by MakeGrid */

const DECORATIVE_GHOSTS = [
  { id: 'ghost-1', label: 'BusinessPartner', x: 248, y: 168 },
  { id: 'ghost-2', label: 'CompanyCode', x: 512, y: 168 },
  { id: 'ghost-3', label: 'Batch', x: 512, y: 348 },
  { id: 'ghost-4', label: 'Contract', x: 248, y: 348 },
];

export function getDecorativeGhosts() {
  return DECORATIVE_GHOSTS;
}

export function getFocalObjectId(includedObjects, preferId) {
  if (preferId && includedObjects.has(preferId)) return preferId;
  if (includedObjects.has('sales-order')) return 'sales-order';
  if (includedObjects.has('delivery-item')) return 'delivery-item';
  return [...includedObjects][0] ?? null;
}

/** Place nodes in a ring around the focal hub (MakeGrid object-centred pattern) */
export function getObjectCentredPositions(focalId, nodeIds) {
  const hub = { x: 400, y: 260 };
  const positions = {};

  if (!focalId) {
    nodeIds.forEach((id, i) => {
      positions[id] = { x: 200 + i * 120, y: 260 };
    });
    return positions;
  }

  positions[focalId] = { ...hub };
  const satellites = nodeIds.filter((id) => id !== focalId);
  const baseRadius = 150;
  const metricOffset = 72;

  satellites.forEach((id, i) => {
    const isMetric = id.startsWith('metric-');
    const isEvent = id.startsWith('event-');
    const radius = isMetric ? baseRadius + metricOffset : isEvent ? baseRadius - 40 : baseRadius;
    const angle = (i / Math.max(satellites.length, 1)) * Math.PI * 1.35 - Math.PI * 0.7;
    positions[id] = {
      x: hub.x + Math.cos(angle) * radius,
      y: hub.y + Math.sin(angle) * radius,
    };
  });

  return positions;
}

export function getNeighbours(objectId, relationships) {
  const neighbours = new Set();
  for (const r of relationships) {
    if (r.source === objectId) neighbours.add(r.target);
    if (r.target === objectId) neighbours.add(r.source);
  }
  return [...neighbours];
}
