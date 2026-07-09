import { optimizeLayoutForEdges } from './graphEdgeLayout';

const MIN_DISTANCE = 155;
const GHOST_DISTANCE = 68;
const HUB = { x: 420, y: 280 };

function hashAngle(id) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) % 360;
  return (h / 360) * Math.PI * 2;
}

function placeFanRing(ids, radius, positions, hub, startDeg = 5, endDeg = 95) {
  if (!ids.length) return;
  const start = (startDeg * Math.PI) / 180;
  const end = (endDeg * Math.PI) / 180;
  const step = ids.length > 1 ? (end - start) / (ids.length - 1) : 0;
  const mid = (start + end) / 2;

  ids.forEach((id, i) => {
    const angle = ids.length > 1 ? start + i * step : mid;
    positions[id] = {
      x: hub.x + Math.cos(angle) * radius,
      y: hub.y + Math.sin(angle) * radius,
    };
  });
}

function resolveCollisions(positions, ids, iterations = 120, anchorId = null, minDist = MIN_DISTANCE) {
  const pos = Object.fromEntries(
    Object.entries(positions).map(([id, p]) => [id, { ...p }]),
  );
  const anchor = anchorId && pos[anchorId] ? { ...pos[anchorId] } : null;

  for (let iter = 0; iter < iterations; iter += 1) {
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const a = ids[i];
        const b = ids[j];
        let dx = pos[b].x - pos[a].x;
        let dy = pos[b].y - pos[a].y;
        const dist = Math.hypot(dx, dy) || 1;

        if (dist >= minDist) continue;

        const push = (minDist - dist) / 2;
        dx /= dist;
        dy /= dist;

        if (a !== anchorId) {
          pos[a].x -= dx * push;
          pos[a].y -= dy * push;
        }
        if (b !== anchorId) {
          pos[b].x += dx * push;
          pos[b].y -= dy * push;
        }
      }
    }
    if (anchor) pos[anchorId] = { ...anchor };
  }

  return pos;
}

function classifyNode(node) {
  if (node.id.startsWith('event-')) return 'event';
  if (node.id.startsWith('metric-')) return 'metric';
  return 'object';
}

function placeGhostNodes(positions, ghostIds, includedIds, edges, hub) {
  for (const ghostId of ghostIds) {
    const link = edges.find(
      (e) =>
        (e.source === ghostId && includedIds.has(e.target)) ||
        (e.target === ghostId && includedIds.has(e.source)),
    );

    if (link) {
      const anchorId = includedIds.has(link.source) ? link.source : link.target;
      const anchor = positions[anchorId] ?? hub;
      const angle = hashAngle(ghostId);
      positions[ghostId] = {
        x: anchor.x + Math.cos(angle) * GHOST_DISTANCE,
        y: anchor.y + Math.sin(angle) * GHOST_DISTANCE,
      };
    } else {
      const angle = hashAngle(ghostId);
      positions[ghostId] = {
        x: hub.x + Math.cos(angle) * (GHOST_DISTANCE + 24),
        y: hub.y + Math.sin(angle) * (GHOST_DISTANCE + 24),
      };
    }
  }
}

const NODE_LAYOUT = { width: 148, height: 108 };

function withLayoutMeta(nodes, focalId) {
  return nodes.map((n) => ({
    ...n,
    style: {
      ...n.style,
      width: NODE_LAYOUT.width,
      height: NODE_LAYOUT.height,
      transition: 'transform 0.48s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    zIndex: n.id === focalId ? 20 : n.data?.kind === 'metric' ? 8 : 10,
  }));
}

export function buildIncludedIdSet(nodes, includedObjects, includedEvents, includedMetrics) {
  const ids = new Set(includedObjects);
  for (const n of nodes) {
    if (n.id.startsWith('event-')) {
      const eid = n.id.replace('event-', '');
      if (includedEvents?.has(eid)) ids.add(n.id);
    }
    if (n.id.startsWith('metric-')) {
      const mid = n.id.replace('metric-', '');
      if (includedMetrics?.has(mid)) ids.add(n.id);
    }
  }
  return ids;
}

export function includedLayoutSignature(includedObjects, includedEvents, includedMetrics) {
  const parts = [
    [...includedObjects].sort().join(','),
    [...(includedEvents ?? [])].sort().join(','),
    [...(includedMetrics ?? [])].sort().join(','),
  ];
  return parts.join('|');
}

/** Layout included nodes on rings; ghosts orbit their included neighbour */
export function applyAutoLayout(
  nodes,
  focalId,
  edges = [],
  includedIds = null,
) {
  if (!nodes.length) return nodes;

  const included = includedIds ?? new Set(nodes.map((n) => n.id));
  const includedNodeIds = nodes.filter((n) => included.has(n.id)).map((n) => n.id);
  const ghostIds = nodes.filter((n) => !included.has(n.id)).map((n) => n.id);
  const allIds = nodes.map((n) => n.id);

  const positions = {};
  const focal =
    focalId && included.has(focalId) ? focalId : includedNodeIds[0] ?? null;

  if (!focal) {
    nodes.forEach((n, i) => {
      positions[n.id] = { x: 140 + i * 200, y: HUB.y };
    });
  } else {
    positions[focal] = { ...HUB };

    const objects = [];
    const events = [];
    const metrics = [];

    includedNodeIds.forEach((id) => {
      if (id === focal) return;
      const node = nodes.find((n) => n.id === id);
      const kind = classifyNode(node);
      if (kind === 'event') events.push(id);
      else if (kind === 'metric') metrics.push(id);
      else objects.push(id);
    });

    const count = includedNodeIds.length;
    const objRadius = count <= 2 ? 0 : count <= 4 ? 130 : 165;
    const eventRadius = count <= 2 ? 0 : count <= 4 ? 155 : 185;
    const metricRadius = count <= 2 ? 0 : count <= 4 ? 175 : 205;

    if (objects.length) placeFanRing(objects, objRadius, positions, HUB);
    if (events.length) placeFanRing(events, eventRadius, positions, HUB, 10, 100);
    if (metrics.length) placeFanRing(metrics, metricRadius, positions, HUB, 20, 110);

    placeGhostNodes(positions, ghostIds, included, edges, HUB);
  }

  let resolved = resolveCollisions(positions, allIds, 50, focal, MIN_DISTANCE);
  resolved = resolveCollisions(resolved, ghostIds, 30, focal, GHOST_DISTANCE + 28);
  resolved = optimizeLayoutForEdges(resolved, allIds, edges, focal);

  const laid = nodes.map((n) => ({
    ...n,
    position: resolved[n.id] ?? n.position,
  }));

  return withLayoutMeta(laid, focalId);
}

export function resolveNodeCollisions(nodes, focalId, edges = [], includedIds = null) {
  const included = includedIds ?? new Set(nodes.map((n) => n.id));
  const positions = Object.fromEntries(
    nodes.map((n) => [n.id, { ...n.position }]),
  );
  const ids = nodes.map((n) => n.id);
  let resolved = resolveCollisions(positions, ids, 40, focalId, MIN_DISTANCE);
  resolved = optimizeLayoutForEdges(resolved, ids, edges, focalId);
  return nodes.map((n) => ({
    ...n,
    position: resolved[n.id] ?? n.position,
  }));
}

export function mergeSavedPositions(nodes, savedMap, focalId, edges = [], includedIds = null) {
  const merged = nodes.map((n) => {
    const saved = savedMap.get(n.id);
    return saved ? { ...n, position: saved } : n;
  });
  const positions = Object.fromEntries(merged.map((n) => [n.id, n.position]));
  const ids = merged.map((n) => n.id);
  let resolved = resolveCollisions(positions, ids, 30, focalId, 120);
  resolved = optimizeLayoutForEdges(resolved, ids, edges, focalId);
  return merged.map((n) => ({
    ...n,
    position: resolved[n.id] ?? n.position,
  }));
}

export function nodeSetSignature(nodes) {
  return nodes
    .map((n) => n.id)
    .sort()
    .join('|');
}
