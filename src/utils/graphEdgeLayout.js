/** Edge-aware layout tuning — reduce crossings and line/node overlap */

const NODE_W = 148;
const NODE_H = 108;
const NODE_ORIGIN_X = 0.5;
const NODE_ORIGIN_Y = 0.34;

export function getNodeCenter(position) {
  return {
    x: position.x + NODE_W * NODE_ORIGIN_X,
    y: position.y + NODE_H * NODE_ORIGIN_Y,
  };
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

function segmentsIntersect(a1, a2, b1, b2) {
  const cross = (p, q, r) =>
    (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);

  const d1 = cross(a1, a2, b1);
  const d2 = cross(a1, a2, b2);
  const d3 = cross(b1, b2, a1);
  const d4 = cross(b1, b2, a2);

  if (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  ) {
    return true;
  }
  return false;
}

function getEdgeSegment(positions, edge) {
  const s = getNodeCenter(positions[edge.source]);
  const t = getNodeCenter(positions[edge.target]);
  return { s, t };
}

/** Push nodes away from relationship lines they are not part of */
function avoidEdgeNodeOverlap(positions, nodeIds, edges, anchorId, clearance = 38) {
  const pos = { ...positions };

  for (const edge of edges) {
    const { s, t } = getEdgeSegment(pos, edge);
    for (const id of nodeIds) {
      if (id === edge.source || id === edge.target || id === anchorId) continue;
      const c = getNodeCenter(pos[id]);
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

/** Nudge endpoints when two relationship lines cross */
function reduceEdgeCrossings(positions, edges, anchorId, iterations = 24) {
  const pos = { ...positions };

  for (let iter = 0; iter < iterations; iter += 1) {
    let moved = false;

    for (let i = 0; i < edges.length; i += 1) {
      for (let j = i + 1; j < edges.length; j += 1) {
        const e1 = edges[i];
        const e2 = edges[j];
        if (
          e1.source === e2.source ||
          e1.source === e2.target ||
          e1.target === e2.source ||
          e1.target === e2.target
        ) {
          continue;
        }

        const seg1 = getEdgeSegment(pos, e1);
        const seg2 = getEdgeSegment(pos, e2);

        if (!segmentsIntersect(seg1.s, seg1.t, seg2.s, seg2.t)) continue;

        for (const id of [e1.target, e2.source, e2.target]) {
          if (id === anchorId) continue;
          const c = getNodeCenter(pos[id]);
          const mx = (seg1.s.x + seg1.t.x) / 2;
          const my = (seg1.s.y + seg1.t.y) / 2;
          let nx = c.x - mx;
          let ny = c.y - my;
          const len = Math.hypot(nx, ny) || 1;
          nx /= len;
          ny /= len;
          pos[id] = { x: pos[id].x + nx * 8, y: pos[id].y + ny * 8 };
          moved = true;
        }
      }
    }

    if (!moved) break;
  }

  return pos;
}

export function optimizeLayoutForEdges(positions, nodeIds, edges, anchorId) {
  if (!edges.length) return positions;

  let pos = { ...positions };
  for (let pass = 0; pass < 1; pass += 1) {
    pos = avoidEdgeNodeOverlap(pos, nodeIds, edges, anchorId);
    pos = reduceEdgeCrossings(pos, edges, anchorId);
  }
  return pos;
}
