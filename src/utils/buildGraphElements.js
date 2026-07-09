import {
  eventSources,
  metricLinks,
  metrics,
  NODE_KINDS,
  objects,
} from '../data/mockData';
import { getFocalObjectId } from '../data/graphLayout';
import { applyDemoLayout } from './demoLayout';
import { enrichEdgesWithHandles, positionsFromNodes } from './edgeHandles';
import { buildIncludedIdSet } from './graphAutoLayout';
import {
  appendDiscoveryEventNodes,
  appendDiscoveryMetricNodes,
} from './graphDiscoveryNodes';
import {
  getInspectorEdgeSelected,
  inspectorNodeDataFlags,
} from './graphInspectorSelection';

function objectLabel(id) {
  return objects.find((o) => o.id === id)?.name ?? id;
}

function getObjectState(id, ctx) {
  if (ctx.includedObjects?.has(id)) return 'included';
  if (ctx.pendingObjectId === id) return 'pending';
  if (ctx.bridgePreviewObjectIds?.has(id)) return 'bridgePreview';
  if (ctx.addableObjects?.has(id)) return 'ghost';
  if (ctx.dimmedObjectIds?.has(id)) return 'dimmed';
  if (ctx.visibleObjects?.has(id)) return 'available';
  return 'ghost';
}

function getCycleEdgeFlags(relId, ctx) {
  const inCycle = ctx.cycleEdgeIds?.has(relId);
  if (!inCycle || ctx.isResolved) return { highlightCycle: false };
  return { highlightCycle: true };
}

/** Dashed edges only to direct addable neighbours (or during cycle resolution) */
function edgeIsPotential(r, ctx) {
  if (ctx.previewBridgeRelationshipIds?.has(r.id)) return true;
  if (ctx.includedRelationshipIds?.has(r.id)) return false;
  const inc = ctx.includedObjects;
  if (!inc?.has(r.source) && !inc?.has(r.target)) return false;
  if (inc.has(r.source) && inc.has(r.target)) return false;
  if (ctx.cycleActive && !ctx.isResolved) return true;
  if (!ctx.showDiscoverObjects) return false;

  const ghostId = inc.has(r.source) ? r.target : r.source;
  if (!ctx.addableObjects?.has(ghostId)) return false;
  const meta = objects.find((o) => o.id === ghostId);
  return !meta?.insertOnly && !meta?.hiddenFromDiscovery;
}

function buildObjectNode(id, ctx, positions, focalId) {
  const obj = objects.find((o) => o.id === id);
  if (!obj) return null;
  const state = getObjectState(id, ctx);
  return {
    id,
    type: 'perspective',
    position: positions[id] ?? { x: 400, y: 260 },
    zIndex: state === 'pending' ? 18 : id === focalId ? 10 : 5,
    data: {
      label: obj.name,
      kind: NODE_KINDS.OBJECT,
      state,
      isHub:
        !ctx.cycleActive &&
        id === (ctx.expansionAnchorId ?? focalId) &&
        ctx.includedObjects?.has(id),
      showPlus: ctx.addableObjects?.has(id),
      onPlusClick: () => ctx.onAddObject?.(id),
      canRefocus:
        state === 'included' &&
        ctx.discoveryMode === 'global' &&
        ctx.expansionAnchorId &&
        id !== ctx.expansionAnchorId,
      onRefocusExpansion: () => ctx.onFocusExpansion?.(id),
      isSelectedContext:
        ctx.discoveryMode === 'contextual' &&
        ctx.contextualSelection?.objectId === id,
      ...inspectorNodeDataFlags(id, NODE_KINDS.OBJECT, ctx),
    },
  };
}

export function buildProgressiveGraph(ctx) {
  const nodes = [];
  const edges = [];

  const ambiguityLock = ctx.cycleActive && !ctx.isResolved && !ctx.showOnlyIncluded;

  const includedPlusPreview = () => {
    const ids = [...(ctx.includedObjects ?? [])];
    if (ctx.pendingObjectId) ids.push(ctx.pendingObjectId);
    ctx.bridgePreviewObjectIds?.forEach((id) => ids.push(id));
    return ids;
  };

  const objectIds = ambiguityLock
    ? [...ctx.includedObjects]
    : ctx.showOnlyIncluded
      ? includedPlusPreview()
      : [...ctx.visibleObjects];

  if (ctx.includedObjects?.has('currency-conversion')) {
    objectIds.push('currency-conversion');
  }

  const focalId = ctx.cycleActive
    ? null
    : ctx.expansionAnchorId ?? getFocalObjectId(ctx.includedObjects, 'sales-order');
  const nodeIdList = [...new Set(objectIds)];
  const layoutOptions = {
    cycleLayout: ctx.cycleActive && !ctx.isResolved,
    pendingObjectId: ctx.pendingObjectId ?? null,
    expansionAnchorId: ctx.expansionAnchorId ?? null,
  };

  for (const id of nodeIdList) {
    const node = buildObjectNode(id, ctx, {}, focalId);
    if (node) nodes.push(node);
  }

  const nodeIds = new Set(nodes.map((n) => n.id));

  const showCycle = ctx.cycleActive && !ctx.isResolved;

  for (const r of ctx.activeRelationships ?? []) {
    if (!nodeIds.has(r.source) || !nodeIds.has(r.target)) continue;
    const bridgePreview = ctx.previewBridgeRelationshipIds?.has(r.id);
    const touchesIncluded =
      ctx.includedObjects?.has(r.source) || ctx.includedObjects?.has(r.target);
    if (!touchesIncluded && !bridgePreview) continue;

    if (bridgePreview) {
      edges.push({
        id: r.id,
        source: r.source,
        target: r.target,
        type: 'route',
        data: {
          included: false,
          potential: true,
          isPreviewBridge: true,
          previewBridgeCreatesCycle: Boolean(ctx.previewBridgeWouldCreateCycle),
          relId: r.id,
        },
      });
      continue;
    }

    const included = ctx.includedRelationshipIds?.has(r.id);
    const potential = edgeIsPotential(r, ctx);
    if (!included && !potential) continue;

    const cycleFlags = getCycleEdgeFlags(r.id, ctx);
    const showScissors = showCycle && ctx.cycleEdgeIds?.has(r.id);
    const highlightId = ctx.highlightedRelationshipId ?? null;
    const highlightFromTable = highlightId === r.id;
    const highlightFromTableCycle =
      highlightFromTable && Boolean(cycleFlags.highlightCycle);

    edges.push({
      id: r.id,
      source: r.source,
      target: r.target,
      type: 'route',
      data: {
        included,
        potential,
        relId: r.id,
        pruned: ctx.excludedRelationships?.has(r.id),
        showScissors,
        onPrune: ctx.onPrune,
        onHoverEdge: ctx.onHoverEdge,
        highlightFromTable,
        highlightFromTableCycle,
        cycleResolutionCard: ctx.cycleResolutionCardsByRelId?.[r.id] ?? null,
        isInspectorSelected: getInspectorEdgeSelected(r.id, ctx.inspectorSelection, {
          cycleActive: ctx.cycleActive,
          isResolved: ctx.isResolved,
        }),
        ...cycleFlags,
      },
    });
  }

  appendDiscoveryEventNodes(nodes, nodeIds, edges, ctx);
  appendDiscoveryMetricNodes(nodes, nodeIds, edges, ctx);

  for (const link of ctx.eventLinks ?? []) {
    if (!ctx.includedObjects?.has(link.objectId)) continue;
    if (!ctx.includedEvents?.has(link.eventId)) continue;
    const ev = eventSources.find((e) => e.id === link.eventId);
    if (!ev) continue;
    const nodeId = `event-${link.eventId}`;
    if (!nodes.find((n) => n.id === nodeId)) {
      nodes.push({
        id: nodeId,
        type: 'perspective',
        position: { x: 0, y: 0 },
        data: {
          label: ev.name,
          kind: NODE_KINDS.EVENT_SOURCE,
          state: 'included',
          onPlusClick: () => ctx.onAddEvent?.(link.eventId),
          ...inspectorNodeDataFlags(nodeId, NODE_KINDS.EVENT_SOURCE, ctx),
        },
      });
      nodeIds.add(nodeId);
    }
    edges.push({
      id: link.id,
      source: nodeId,
      target: link.objectId,
      type: 'route',
      data: { included: true, isMetricLink: false },
    });
  }

  for (const link of ctx.metricLinks ?? []) {
    if (!ctx.includedObjects?.has(link.objectId)) continue;
    if (!ctx.includedMetrics?.has(link.metricId)) continue;
    const met = metrics.find((m) => m.id === link.metricId);
    if (!met) continue;
    const nodeId = `metric-${link.metricId}`;
    if (!nodes.find((n) => n.id === nodeId)) {
      nodes.push({
        id: nodeId,
        type: 'perspective',
        position: { x: 0, y: 0 },
        data: {
          label: met.name,
          kind: NODE_KINDS.METRIC,
          state: 'included',
          compact: true,
          onPlusClick: () => ctx.onAddMetric?.(link.metricId),
        },
      });
      nodeIds.add(nodeId);
    }
    edges.push({
      id: link.id,
      source: nodeId,
      target: link.objectId,
      type: 'route',
      data: { included: true, isMetricLink: true },
    });
  }

  const includedIds = buildIncludedIdSet(
    nodes,
    ctx.includedObjects ?? new Set(),
    ctx.includedEvents,
    ctx.includedMetrics,
  );
  const laidOut = applyDemoLayout(
    nodes,
    focalId,
    edges,
    includedIds,
    ctx.includedObjects,
    layoutOptions,
  );
  const positioned = positionsFromNodes(laidOut);
  const routedEdges = enrichEdgesWithHandles(edges, positioned);
  return { nodes: laidOut, edges: routedEdges, focalId };
}

export function buildRouteAmbiguityGraph(ctx) {
  const nodes = [];
  const edges = [];
  const focalId = null;
  const objectList = [...ctx.includedObjects];
  const layoutOptions = { cycleLayout: !ctx.isResolved };

  for (const id of objectList) {
    nodes.push({
      id,
      type: 'perspective',
      position: { x: 0, y: 0 },
      zIndex: 5,
      data: {
        label: objectLabel(id),
        kind: NODE_KINDS.OBJECT,
        state: ctx.dimmedObjectIds?.has(id) ? 'dimmed' : 'included',
        isHub: false,
        showIncludedBadge: true,
        ...inspectorNodeDataFlags(id, NODE_KINDS.OBJECT, ctx),
      },
    });
  }

  for (const r of ctx.activeRelationships) {
    if (!ctx.includedObjects.has(r.source) || !ctx.includedObjects.has(r.target)) {
      continue;
    }

    const cycleFlags = getCycleEdgeFlags(r.id, ctx);
    const showScissors = !ctx.isResolved && ctx.cycleEdgeIds?.has(r.id);
    const highlightId = ctx.highlightedRelationshipId ?? null;
    const highlightFromTable = highlightId === r.id;
    const highlightFromTableCycle =
      highlightFromTable && Boolean(cycleFlags.highlightCycle);

    edges.push({
      id: r.id,
      source: r.source,
      target: r.target,
      type: 'route',
      data: {
        included: true,
        pruned: ctx.excludedRelationships?.has(r.id),
        showScissors,
        onPrune: ctx.onPrune,
        onHoverEdge: ctx.onHoverEdge,
        relId: r.id,
        highlightFromTable,
        highlightFromTableCycle,
        cycleResolutionCard: ctx.cycleResolutionCardsByRelId?.[r.id] ?? null,
        isInspectorSelected: getInspectorEdgeSelected(r.id, ctx.inspectorSelection, {
          cycleActive: ctx.cycleActive,
          isResolved: ctx.isResolved,
        }),
        ...cycleFlags,
      },
    });
  }

  const includedIds = buildIncludedIdSet(
    nodes,
    ctx.includedObjects ?? new Set(),
    ctx.includedEvents,
    ctx.includedMetrics,
  );
  const laidOut = applyDemoLayout(
    nodes,
    focalId,
    edges,
    includedIds,
    ctx.includedObjects,
    layoutOptions,
  );
  const positioned = positionsFromNodes(laidOut);
  const routedEdges = enrichEdgesWithHandles(edges, positioned);
  return { nodes: laidOut, edges: routedEdges, focalId };
}
