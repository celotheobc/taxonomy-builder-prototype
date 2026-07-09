/** Clip edge segments at ghost / addable nodes so lines do not cross node bodies */

const NODE_W = 148;
const NODE_H = 108;
const NODE_ORIGIN_X = 0.5;
const NODE_ORIGIN_Y = 0.34;
const CLIP_GAP = 4;

export function getNodeClipBounds(position) {
  if (!position) return null;
  const left = position.x - NODE_W * NODE_ORIGIN_X;
  const top = position.y - NODE_H * NODE_ORIGIN_Y;
  return {
    left: left + 8,
    right: left + NODE_W - 8,
    top: top + 2,
    bottom: top + NODE_H - 4,
  };
}

function expandBounds(bounds, gap) {
  return {
    left: bounds.left - gap,
    right: bounds.right + gap,
    top: bounds.top - gap,
    bottom: bounds.bottom + gap,
  };
}

/** Parametric [tEnter, tLeave] where segment is inside rect (0–1 along segment), or null */
function segmentRectTRange(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let u0 = 0;
  let u1 = 1;
  const planes = [
    [-dx, x1 - r.left],
    [dx, r.right - x1],
    [-dy, y1 - r.top],
    [dy, r.bottom - y1],
  ];

  for (const [p, q] of planes) {
    if (p === 0) {
      if (q < 0) return null;
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > u1) return null;
        u0 = Math.max(u0, t);
      } else {
        if (t < u0) return null;
        u1 = Math.min(u1, t);
      }
    }
  }

  if (u0 > u1) return null;
  return [u0, u1];
}

function pointOnSegment(sx, sy, tx, ty, t) {
  return [sx + (tx - sx) * t, sy + (ty - sy) * t];
}

/** Shorten segment toward target so it stops at the near side of bounds */
export function trimSegmentAtTargetBounds(sx, sy, tx, ty, bounds, gap = CLIP_GAP) {
  if (!bounds) return [tx, ty];
  const r = expandBounds(bounds, gap);
  const range = segmentRectTRange(sx, sy, tx, ty, r);
  if (!range) return [tx, ty];

  const [tEnter] = range;
  const len = Math.hypot(tx - sx, ty - sy) || 1;
  const eps = Math.min(8 / len, 0.05);
  const tClip = Math.max(0, Math.min(1, tEnter - eps));
  const [x, y] = pointOnSegment(sx, sy, tx, ty, tClip);
  if (Math.hypot(x - tx, y - ty) < 1.5) return [tx, ty];
  return [x, y];
}

/** Shorten segment toward source so it stops at the far side of bounds */
export function trimSegmentAtSourceBounds(sx, sy, tx, ty, bounds, gap = CLIP_GAP) {
  if (!bounds) return [sx, sy];
  const r = expandBounds(bounds, gap);
  const range = segmentRectTRange(sx, sy, tx, ty, r);
  if (!range) return [sx, sy];

  const [, tLeave] = range;
  const len = Math.hypot(tx - sx, ty - sy) || 1;
  const eps = Math.min(8 / len, 0.05);
  const tClip = Math.max(0, Math.min(1, tLeave + eps));
  const [x, y] = pointOnSegment(sx, sy, tx, ty, tClip);
  if (Math.hypot(x - sx, y - sy) < 1.5) return [sx, sy];
  return [x, y];
}

export function nodeNeedsEdgeClip(nodeId, ctx) {
  if (!ctx || !nodeId) return false;

  if (nodeId.startsWith('event-')) {
    const eventId = nodeId.slice('event-'.length);
    return !ctx.includedEvents?.has(eventId);
  }
  if (nodeId.startsWith('metric-')) {
    const metricId = nodeId.slice('metric-'.length);
    return !ctx.includedMetrics?.has(metricId);
  }

  if (ctx.includedObjects?.has(nodeId)) return false;
  if (ctx.pendingObjectId === nodeId) return true;
  if (ctx.bridgePreviewObjectIds?.has(nodeId)) return true;
  if (ctx.addableObjects?.has(nodeId)) return true;
  if (ctx.visibleObjects?.has(nodeId)) return true;
  return false;
}
