/** Shared spacing for the canvas grid lines and node snap alignment */
export const GRAPH_GRID_GAP = 36;

export const GRAPH_SNAP_GRID = [GRAPH_GRID_GAP, GRAPH_GRID_GAP];

export function snapPositionToGrid(position) {
  return {
    x: Math.round(position.x / GRAPH_GRID_GAP) * GRAPH_GRID_GAP,
    y: Math.round(position.y / GRAPH_GRID_GAP) * GRAPH_GRID_GAP,
  };
}
