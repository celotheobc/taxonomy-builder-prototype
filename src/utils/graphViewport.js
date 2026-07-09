import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { getNodeCenter } from './graphEdgeLayout';

export const DEFAULT_GRAPH_ZOOM = 1;

const NODE_W = 148;
const NODE_H = 108;
const NODE_ORIGIN = [0.5, 0.34];

/** Node ids to frame — hub ring includes ghost neighbours on first hop */
export function getGraphFrameIds(
  includedObjects,
  addableObjects,
  pendingObjectId = null,
) {
  const inc = includedObjects ?? new Set();
  const add = addableObjects ?? new Set();
  const hubRingView =
    inc.size === 1 && inc.has('sales-order') && add.size > 0;
  const frame = hubRingView ? new Set([...inc, ...add]) : new Set(inc);
  if (pendingObjectId) frame.add(pendingObjectId);
  return frame;
}

export function getGraphFitOptions({
  includedObjects,
  addableObjects,
  cycleActive,
  isResolved,
}) {
  const inc = includedObjects ?? new Set();
  const add = addableObjects ?? new Set();
  const hubRingView =
    inc.size === 1 && inc.has('sales-order') && add.size > 0;
  return {
    maxZoom: 1,
    minZoom: hubRingView ? 0.88 : 0.92,
    padding:
      cycleActive && !isResolved
        ? 0.2
        : hubRingView
          ? 0.26
          : inc.size >= 3
            ? 0.12
            : 0.18,
  };
}

/** Synchronous viewport for first paint — avoids waiting on fitView + hidden canvas */
export function computeFrameViewport(nodes, frameIds, paneSize, fitOptions = {}) {
  const frameNodes = nodes
    .filter((n) => frameIds.has(n.id))
    .map((n) => ({
      id: n.id,
      position: n.position,
      width: n.width ?? NODE_W,
      height: n.height ?? NODE_H,
    }));

  if (!frameNodes.length || !paneSize?.width || !paneSize?.height) {
    return null;
  }

  const bounds = getNodesBounds(frameNodes, { nodeOrigin: NODE_ORIGIN });
  const { minZoom = 0.88, maxZoom = 1, padding = 0.16 } = fitOptions;

  return getViewportForBounds(
    bounds,
    paneSize.width,
    paneSize.height,
    minZoom,
    maxZoom,
    padding,
  );
}

export function focusNode(flow, node, options = {}) {
  if (!flow || !node) return;
  const { zoom, duration = 420 } = options;
  const center = getNodeCenter(node.position);
  const z = zoom ?? flow.getZoom();
  flow.setCenter(center.x, center.y, { zoom: z, duration });
}

/** Frame all included nodes — keeps entire selected path visible */
export function fitIncludedNodes(flow, nodes, includedObjects, options = {}) {
  if (!flow || !nodes.length || !includedObjects?.size) return;

  const {
    duration = 420,
    maxZoom = 1,
    minZoom = 0.88,
    padding = 0.16,
  } = options;
  const includedNodeIds = nodes
    .filter((n) => includedObjects.has(n.id))
    .map((n) => ({ id: n.id }));

  if (!includedNodeIds.length) return;

  flow.fitView({
    nodes: includedNodeIds,
    padding,
    duration,
    maxZoom,
    minZoom,
  });
}

export function fitGraphBounds(flow, duration = 420) {
  if (!flow) return;
  flow.fitView({
    padding: 0.2,
    duration,
    maxZoom: 1,
    minZoom: 0.88,
  });
}
