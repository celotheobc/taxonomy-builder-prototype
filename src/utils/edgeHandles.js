import { Position } from '@xyflow/react';

const H = {
  rightLeft: {
    sourceHandle: 's-right',
    targetHandle: 't-left',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  leftRight: {
    sourceHandle: 's-left',
    targetHandle: 't-right',
    sourcePosition: Position.Left,
    targetPosition: Position.Right,
  },
  bottomTop: {
    sourceHandle: 's-bottom',
    targetHandle: 't-top',
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  topBottom: {
    sourceHandle: 's-top',
    targetHandle: 't-bottom',
    sourcePosition: Position.Top,
    targetPosition: Position.Bottom,
  },
};

/** Pick handles on opposite faces; favour vertical for diagonal satellites */
export function pickEdgeHandles(sourcePos, targetPos) {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);

  if (ay > ax * 1.2) {
    return dy > 0 ? H.bottomTop : H.topBottom;
  }
  if (ax > ay * 1.2) {
    return dx > 0 ? H.rightLeft : H.leftRight;
  }

  if (dy > 0) return H.bottomTop;
  if (dy < 0) return H.topBottom;
  return dx > 0 ? H.rightLeft : H.leftRight;
}

export function enrichEdgesWithHandles(edges, positions) {
  return edges.map((edge) => {
    const sourcePos = positions[edge.source];
    const targetPos = positions[edge.target];
    if (!sourcePos || !targetPos) return edge;

    const handles = pickEdgeHandles(sourcePos, targetPos);
    const data = { ...(edge.data ?? {}) };
    delete data.clipSource;
    delete data.clipTarget;
    delete data.clipSourceBounds;
    delete data.clipTargetBounds;

    return {
      ...edge,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      sourcePosition: handles.sourcePosition,
      targetPosition: handles.targetPosition,
      data,
    };
  });
}

export function positionsFromNodes(nodes) {
  return Object.fromEntries(nodes.map((n) => [n.id, n.position]));
}
