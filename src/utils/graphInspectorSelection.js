import { NODE_KINDS } from '../data/mockData';

function cycleBlocksEntitySelection(cycleCtx) {
  return Boolean(cycleCtx?.cycleActive && !cycleCtx?.isResolved);
}

export function getInspectorNodeSelected(nodeId, kind, selection, cycleCtx) {
  if (!selection || cycleBlocksEntitySelection(cycleCtx)) return false;
  if (selection.type === 'object' && kind === NODE_KINDS.OBJECT && selection.id === nodeId) {
    return true;
  }
  if (selection.type === 'event' && kind === NODE_KINDS.EVENT_SOURCE) {
    return selection.id === nodeId.replace(/^event-/, '');
  }
  if (selection.type === 'metric' && kind === NODE_KINDS.METRIC) {
    return selection.id === nodeId.replace(/^metric-/, '');
  }
  return false;
}

export function inspectorNodeDataFlags(nodeId, kind, ctx) {
  const cycleCtx = { cycleActive: ctx.cycleActive, isResolved: ctx.isResolved };
  return {
    isInspectorSelected: getInspectorNodeSelected(
      nodeId,
      kind,
      ctx.inspectorSelection,
      cycleCtx,
    ),
    inspectorSelectionMode: Boolean(ctx.enableInspectorSelection),
  };
}

export function getInspectorEdgeSelected(relId, selection, cycleCtx) {
  if (!selection || !relId) return false;
  if (cycleBlocksEntitySelection(cycleCtx)) {
    return selection.type === 'cycleEdge' && selection.id === relId;
  }
  return (
    (selection.type === 'relationship' || selection.type === 'cycleEdge') &&
    selection.id === relId
  );
}
