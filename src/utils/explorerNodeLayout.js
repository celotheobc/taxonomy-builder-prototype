/** Layout bounds for PerspectiveNode explorer variant (Context Model graph) */

export const EXPLORER_NODE_LAYOUT = {
  width: 96,
  height: 88,
  originX: 0.5,
  originY: 0.34,
};

const NODE_MARGIN = 12;

function nodeBounds(pos, layout = EXPLORER_NODE_LAYOUT) {
  const w = layout.width;
  const h = layout.height;
  return {
    l: pos.x - w * layout.originX,
    r: pos.x + w * (1 - layout.originX),
    t: pos.y - h * layout.originY,
    b: pos.y + h * (1 - layout.originY),
  };
}

export function getExplorerNodeCenter(position) {
  const { width, height, originX, originY } = EXPLORER_NODE_LAYOUT;
  return {
    x: position.x + width * originX,
    y: position.y + height * originY,
  };
}

/** Push overlapping explorer nodes apart (AABB separation) */
export function resolveExplorerOverlaps(positions, ids, anchorId = null) {
  const pos = Object.fromEntries(
    Object.entries(positions).map(([id, p]) => [id, { ...p }]),
  );
  const anchor = anchorId && pos[anchorId] ? { ...pos[anchorId] } : null;

  for (let iter = 0; iter < 48; iter += 1) {
    let moved = false;
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const a = ids[i];
        const b = ids[j];
        const ba = nodeBounds(pos[a]);
        const bb = nodeBounds(pos[b]);
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

function distPointToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function getEdgeSegment(positions, edge) {
  const s = getExplorerNodeCenter(positions[edge.source]);
  const t = getExplorerNodeCenter(positions[edge.target]);
  return { s, t };
}

/** Nudge nodes away from edges they are not part of */
export function optimizeExplorerLayoutForEdges(positions, nodeIds, edges, anchorId = null) {
  if (!edges.length) return positions;

  const pos = { ...positions };
  const clearance = 30;

  for (const edge of edges) {
    const { s, t } = getEdgeSegment(pos, edge);
    for (const id of nodeIds) {
      if (id === edge.source || id === edge.target || id === anchorId) continue;
      const c = getExplorerNodeCenter(pos[id]);
      const d = distPointToSegment(c.x, c.y, s.x, s.y, t.x, t.y);
      if (d >= clearance) continue;

      const mx = (s.x + t.x) / 2;
      const my = (s.y + t.y) / 2;
      let nx = c.x - mx;
      let ny = c.y - my;
      const len = Math.hypot(nx, ny) || 1;
      nx /= len;
      ny /= len;
      const push = clearance - d + 4;
      pos[id] = { x: pos[id].x + nx * push, y: pos[id].y + ny * push };
    }
  }

  return pos;
}
