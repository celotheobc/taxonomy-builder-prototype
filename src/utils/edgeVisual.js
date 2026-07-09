import { MarkerType } from '@xyflow/react';

/** Stroke + marker colours so edges render correctly (CSS modules miss SVG paths) */
export function getEdgeVisual(data = {}) {
  const {
    included,
    potential,
    dimmed,
    pruned,
    highlightCycle,
    previewRemove,
    previewBridgeCreatesCycle,
    isPreviewBridge,
    contextOverview,
    highlightFromTable,
    highlightFromTableCycle,
  } = data;

  if (contextOverview) {
    return {
      stroke: '#c5cdd6',
      strokeWidth: 1.75,
      opacity: 0.9,
      markerColor: '#c5cdd6',
    };
  }

  if (highlightFromTable) {
    let stroke = '#b8c4ce';
    if (highlightFromTableCycle) stroke = '#e11d48';
    else if (included) stroke = '#20a882';
    return {
      stroke,
      strokeWidth: 3.5,
      strokeDasharray: '10 6',
      markerColor: stroke,
    };
  }

  if (isPreviewBridge) {
    const dash = '8 6';
    if (previewBridgeCreatesCycle) {
      return {
        stroke: '#e11d48',
        strokeWidth: 2.5,
        strokeDasharray: dash,
        markerColor: '#e11d48',
      };
    }
    return {
      stroke: '#20a882',
      strokeWidth: 2.5,
      strokeDasharray: dash,
      markerColor: '#20a882',
    };
  }

  if (pruned) {
    return { stroke: '#e8ecf0', strokeWidth: 2, opacity: 0.12, markerColor: '#e8ecf0' };
  }
  if (previewRemove) {
    return {
      stroke: '#e11d48',
      strokeWidth: 3,
      strokeDasharray: '7 5',
      opacity: 0.55,
      markerColor: '#e11d48',
    };
  }
  if (dimmed) {
    return { stroke: '#d1d9e0', strokeWidth: 2, opacity: 0.35, markerColor: '#d1d9e0' };
  }
  if (highlightCycle && !previewRemove) {
    return { stroke: '#e11d48', strokeWidth: 3, markerColor: '#e11d48' };
  }
  if (included) {
    return { stroke: '#20a882', strokeWidth: 2.5, markerColor: '#20a882' };
  }
  if (potential) {
    return {
      stroke: '#b8c4ce',
      strokeWidth: 2,
      strokeDasharray: '6 5',
      markerColor: '#b8c4ce',
    };
  }
  return { stroke: '#b8c4ce', strokeWidth: 2, markerColor: '#b8c4ce' };
}

export function edgeMarker(color) {
  return {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color,
  };
}

export function edgePathStyle(visual) {
  const style = {
    stroke: visual.stroke,
    strokeWidth: visual.strokeWidth,
  };
  if (visual.strokeDasharray) style.strokeDasharray = visual.strokeDasharray;
  if (visual.opacity != null) style.opacity = visual.opacity;
  return style;
}
