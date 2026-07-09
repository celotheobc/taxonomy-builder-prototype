import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import PerspectiveNode from './PerspectiveNode';
import RouteEdge from './RouteEdge';
import GraphConnectionOverlay from './GraphConnectionOverlay';
import GraphInsertPopover from './GraphInsertPopover';
import PerspectiveExpansionPanel from './PerspectiveExpansionPanel';
import ContextualDiscoveryMenu from './ContextualDiscoveryMenu';
import GraphCanvasControls from './GraphCanvasControls';
import {
  buildProgressiveGraph,
  buildRouteAmbiguityGraph,
} from '../../utils/buildGraphElements';
import { applyDemoLayout, repositionDiscoveryNodes } from '../../utils/demoLayout';
import { enrichEdgesWithHandles, positionsFromNodes } from '../../utils/edgeHandles';
import {
  buildIncludedIdSet,
  includedLayoutSignature,
  nodeSetSignature,
} from '../../utils/graphAutoLayout';
import { animateNodesToTargets } from '../../utils/animateGraph';
import {
  computeFrameViewport,
  fitGraphBounds,
  fitIncludedNodes,
  getGraphFitOptions,
  getGraphFrameIds,
} from '../../utils/graphViewport';
import {
  GRAPH_GRID_GAP,
  GRAPH_SNAP_GRID,
  snapPositionToGrid,
} from '../../utils/graphGrid';
import styles from './PerspectiveGraph.module.css';

const nodeTypes = { perspective: PerspectiveNode };
const edgeTypes = { route: RouteEdge };

const defaultEdgeOptions = {
  type: 'route',
  interactionWidth: 18,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: '#b8c4ce',
  },
};

function stripNodeMotion(nodeList) {
  return nodeList.map((n) => ({
    ...n,
    style: { ...n.style, transition: 'none' },
  }));
}

export default function PerspectiveGraph({
  mode,
  graphContext,
  layoutEpoch = 0,
  showInsertPopover = false,
  contextualDiscovery = null,
  canvasControls = null,
  canvasUiVariant = 'v1.5',
  fillContainer = false,
  graphSelection = null,
  hideMetrics = false,
  combinedCanvasToolbar = false,
  showProcessFilter = false,
}) {
  const savedPositions = useRef(new Map());
  const canvasRef = useRef(null);
  const flowRef = useRef(null);
  const nodesRef = useRef([]);
  const lastTopologySignature = useRef('');
  const lastEffectsSignature = useRef('');
  const lastNodeSetSignature = useRef('');
  const lastLayoutEpoch = useRef(0);
  const lastFitKey = useRef('');
  const animatingRef = useRef(false);
  const initialRevealDone = useRef(false);
  const [defaultViewport, setDefaultViewport] = useState(null);
  const graphContextRef = useRef(graphContext);
  graphContextRef.current = graphContext;
  const graphSelectionRef = useRef(graphSelection);
  graphSelectionRef.current = graphSelection;

  const buildGraph = useCallback(() => {
    const ctx = {
      ...graphContextRef.current,
      enableInspectorSelection: Boolean(graphSelectionRef.current),
      onHoverEdge: graphSelectionRef.current?.onHoverEdge,
    };
    if (mode === 'route-ambiguity') {
      return buildRouteAmbiguityGraph(ctx);
    }
    return buildProgressiveGraph(ctx);
  }, [mode]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  nodesRef.current = nodes;

  const graphEffectKey = useMemo(() => {
    const inc = graphContext.includedObjects ?? new Set();
    const vis = graphContext.visibleObjects ?? new Set();
    const add = graphContext.addableObjects ?? new Set();
    const exc = graphContext.excludedRelationships ?? new Set();
    return [
      mode,
      layoutEpoch,
      includedLayoutSignature(
        inc,
        graphContext.includedEvents,
        graphContext.includedMetrics,
      ),
      [...exc].sort().join(','),
      [...vis].sort().join(','),
      [...add].sort().join(','),
      graphContext.showDiscoverObjects,
      graphContext.showDiscoverEvents,
      graphContext.showDiscoverMetrics,
      graphContext.showOnlyIncluded,
      graphContext.pendingObjectId ?? '',
      [...(graphContext.previewBridgeRelationshipIds ?? [])].sort().join(','),
      graphContext.previewBridgeWouldCreateCycle ? 'cycle' : 'safe',
      graphContext.cycleActive ? 'cycle-on' : 'cycle-off',
      graphContext.isResolved ? 'resolved' : 'unresolved',
    ].join('§');
  }, [
    mode,
    layoutEpoch,
    graphContext.includedObjects,
    graphContext.includedEvents,
    graphContext.includedMetrics,
    graphContext.visibleObjects,
    graphContext.addableObjects,
    graphContext.excludedRelationships,
    graphContext.showDiscoverObjects,
    graphContext.showDiscoverEvents,
    graphContext.showDiscoverMetrics,
    graphContext.showOnlyIncluded,
    graphContext.pendingObjectId,
    graphContext.previewBridgeRelationshipIds,
    graphContext.previewBridgeWouldCreateCycle,
    graphContext.cycleActive,
    graphContext.isResolved,
  ]);

  const visualStateKey = useMemo(
    () =>
      [
        graphContext.highlightedRelationshipId ?? '',
        graphContext.inspectorSelection?.type ?? '',
        graphContext.inspectorSelection?.id ?? '',
      ].join('§'),
    [
      graphContext.highlightedRelationshipId,
      graphContext.inspectorSelection,
    ],
  );

  const getPaneSize = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return { width: 900, height: 540 };
    const { width, height } = el.getBoundingClientRect();
    return {
      width: Math.max(width, 320),
      height: Math.max(height, 400),
    };
  }, []);

  const updateViewport = useCallback(
    (nextNodes, { forceFit = false, topologyChanged = false } = {}) => {
      const flow = flowRef.current;
      if (!flow || !nextNodes.length) return;

      const ctx = graphContextRef.current;
      const includedObjects = ctx.includedObjects ?? new Set();
      const addableObjects = ctx.addableObjects ?? new Set();
      const frameIds = getGraphFrameIds(
        includedObjects,
        addableObjects,
        ctx.pendingObjectId,
      );
      const hubRingView =
        includedObjects.size === 1 &&
        includedObjects.has('sales-order') &&
        addableObjects.size > 0;

      const fitKey = `${hubRingView}|${[...frameIds].sort().join(',')}`;
      const needsFit = forceFit || topologyChanged || fitKey !== lastFitKey.current;
      if (!needsFit) return;

      const duration = forceFit || topologyChanged ? 280 : 0;
      const fitOptions = getGraphFitOptions({
        includedObjects,
        addableObjects,
        cycleActive: ctx.cycleActive,
        isResolved: ctx.isResolved,
      });

      if (forceFit) {
        fitGraphBounds(flow, duration);
      } else if (frameIds.size > 0) {
        fitIncludedNodes(flow, nextNodes, frameIds, { duration, ...fitOptions });
      }

      lastFitKey.current = fitKey;
    },
    [],
  );

  const runLayout = useCallback(
    async (
      rawNodes,
      rawEdges,
      focal,
      { force = false, topologyChanged = false, relationshipsOnly = false } = {},
    ) => {
      const ctx = graphContextRef.current;
      const includedIds = buildIncludedIdSet(
        rawNodes,
        ctx.includedObjects ?? new Set(),
        ctx.includedEvents,
        ctx.includedMetrics,
      );

      if (relationshipsOnly) {
        nodesRef.current.forEach((n) => {
          savedPositions.current.set(n.id, { ...n.position });
        });
      }

      if (force) {
        savedPositions.current.clear();
      }

      const layoutOptions = {
        cycleLayout: ctx.cycleActive && !ctx.isResolved,
        pendingObjectId: ctx.pendingObjectId ?? null,
        expansionAnchorId: ctx.expansionAnchorId ?? null,
      };

      let nextNodes = rawNodes;
      const hasNewDiscoveryNodes = rawNodes.some(
        (n) => !savedPositions.current.has(n.id),
      );

      if (force) {
        nextNodes = applyDemoLayout(
          rawNodes,
          focal,
          rawEdges,
          includedIds,
          ctx.includedObjects,
          layoutOptions,
        );
      } else if (relationshipsOnly && hasNewDiscoveryNodes) {
        nextNodes = repositionDiscoveryNodes(
          rawNodes,
          savedPositions.current,
          rawEdges,
          ctx.includedObjects ?? new Set(),
          layoutOptions,
        );
        nextNodes.forEach((n) => {
          if (!savedPositions.current.has(n.id)) {
            savedPositions.current.set(n.id, { ...n.position });
          }
        });
      } else {
        nextNodes = rawNodes.map((n) => {
          const saved = savedPositions.current.get(n.id);
          return saved ? { ...n, position: { ...saved } } : n;
        });
      }

      const positioned = positionsFromNodes(nextNodes);
      setEdges(enrichEdgesWithHandles(rawEdges, positioned));

      const shouldAnimate =
        initialRevealDone.current &&
        !relationshipsOnly &&
        nodesRef.current.length > 0 &&
        !animatingRef.current;

      const nodesToSet =
        !initialRevealDone.current || relationshipsOnly
          ? stripNodeMotion(nextNodes)
          : nextNodes;

      if (shouldAnimate) {
        animatingRef.current = true;
        setNodes(nodesToSet);
        await animateNodesToTargets(
          nodesRef.current,
          nextNodes,
          setNodes,
          480,
        );
        animatingRef.current = false;
      } else {
        setNodes(nodesToSet);
      }

      const isInitialReveal = !initialRevealDone.current;
      if (isInitialReveal) {
        const includedObjects = ctx.includedObjects ?? new Set();
        const addableObjects = ctx.addableObjects ?? new Set();
        const frameIds = getGraphFrameIds(
          includedObjects,
          addableObjects,
          ctx.pendingObjectId,
        );
        const hubRingView =
          includedObjects.size === 1 &&
          includedObjects.has('sales-order') &&
          addableObjects.size > 0;
        const vp = computeFrameViewport(
          nextNodes,
          frameIds,
          getPaneSize(),
          getGraphFitOptions({
            includedObjects,
            addableObjects,
            cycleActive: ctx.cycleActive,
            isResolved: ctx.isResolved,
          }),
        );
        if (vp) setDefaultViewport(vp);
        lastFitKey.current = `${hubRingView}|${[...frameIds].sort().join(',')}`;
        initialRevealDone.current = true;
      } else {
        updateViewport(nextNodes, { forceFit: force, topologyChanged });
      }
    },
    [setNodes, setEdges, updateViewport, getPaneSize],
  );

  const buildGraphRef = useRef(buildGraph);
  buildGraphRef.current = buildGraph;
  const runLayoutRef = useRef(runLayout);
  runLayoutRef.current = runLayout;

  useLayoutEffect(() => {
    const ctx = graphContextRef.current;
    const { nodes: rawNodes, edges: e, focalId: focal } = buildGraphRef.current();
    const topology = includedLayoutSignature(
      ctx.includedObjects ?? new Set(),
      ctx.includedEvents,
      ctx.includedMetrics,
    );
    const effects = [...(ctx.excludedRelationships ?? [])].sort().join(',');
    const topologyChanged = topology !== lastTopologySignature.current;
    const effectsChanged = effects !== lastEffectsSignature.current;
    const nodeSig = nodeSetSignature(rawNodes);
    const nodesChanged = nodeSig !== lastNodeSetSignature.current;
    const forceLayout = layoutEpoch > lastLayoutEpoch.current;

    if (forceLayout) {
      savedPositions.current.clear();
      lastLayoutEpoch.current = layoutEpoch;
      lastFitKey.current = '';
    }

    if (topologyChanged) {
      lastTopologySignature.current = topology;
      if (!forceLayout) lastFitKey.current = '';
    }
    if (effectsChanged) lastEffectsSignature.current = effects;
    if (nodesChanged) lastNodeSetSignature.current = nodeSig;

    const relationshipsOnly =
      (effectsChanged || nodesChanged) && !topologyChanged && !forceLayout;

    runLayoutRef.current(rawNodes, e, focal, {
      force: forceLayout,
      topologyChanged: topologyChanged || !initialRevealDone.current,
      relationshipsOnly,
    });
  }, [graphEffectKey, layoutEpoch]);

  useLayoutEffect(() => {
    if (!initialRevealDone.current || !nodesRef.current.length) return;
    const { edges: rawEdges } = buildGraphRef.current();
    const positioned = positionsFromNodes(nodesRef.current);
    setEdges(enrichEdgesWithHandles(rawEdges, positioned));
  }, [visualStateKey, setEdges]);

  const onInit = useCallback((instance) => {
    flowRef.current = instance;
  }, []);

  const refreshEdgeHandles = useCallback(
    (nodeList) => {
      const list = nodeList ?? nodesRef.current;
      setEdges((currentEdges) =>
        enrichEdgesWithHandles(
          currentEdges,
          positionsFromNodes(list),
        ),
      );
    },
    [setEdges],
  );

  const onNodeDragStop = useCallback(
    (_event, node) => {
      const snapped = snapPositionToGrid(node.position);
      savedPositions.current.set(node.id, snapped);
      setNodes((current) => {
        const next = current.map((n) =>
          n.id === node.id ? { ...n, position: snapped } : n,
        );
        refreshEdgeHandles(next);
        return next;
      });
    },
    [refreshEdgeHandles, setNodes],
  );

  const onNodeClick = useCallback(
    (_event, node) => {
      const ctx = graphContextRef.current;
      if (ctx.cycleActive && !ctx.isResolved) {
        return;
      }
      if (graphSelection?.onSelectNode) {
        const kind =
          node.id.startsWith('event-')
            ? 'event'
            : node.id.startsWith('metric-')
              ? 'metric'
              : 'object';
        const entityId =
          kind === 'object'
            ? node.id
            : node.id.replace(/^(event|metric)-/, '');
        graphSelection.onSelectNode({
          kind,
          id: entityId,
          nodeId: node.id,
          state: node.data?.state ?? 'included',
        });
        return;
      }
      if (!graphContext.onOpenContextual) return;
      if (node.id.startsWith('event-') || node.id.startsWith('metric-')) return;
      if (!graphContext.includedObjects?.has(node.id)) return;
      graphContext.onOpenContextual(node.id);
    },
    [graphContext, graphSelection],
  );

  const onEdgeClick = useCallback(
    (_event, edge) => {
      if (!graphSelection?.onSelectEdge) return;
      const relId = edge.data?.relId ?? edge.id;
      const isCycleEdge = Boolean(
        edge.data?.highlightCycle || edge.data?.showScissors,
      );
      const ctx = graphContextRef.current;
      if (ctx.cycleActive && !ctx.isResolved && !isCycleEdge) {
        return;
      }
      graphSelection.onSelectEdge({ id: relId, isCycleEdge });
    },
    [graphSelection],
  );

  const onEdgeMouseEnter = useCallback(
    (_event, edge) => {
      const relId = edge.data?.relId;
      if (!relId || !graphSelection?.onHoverEdge) return;
      const ctx = graphContextRef.current;
      const isCycleEdge = Boolean(edge.data?.highlightCycle || edge.data?.showScissors);
      if (ctx.cycleActive && !ctx.isResolved && !isCycleEdge) return;
      graphSelection.onHoverEdge(relId);
    },
    [graphSelection],
  );

  const onEdgeMouseLeave = useCallback(
    (event, edge) => {
      const relId = edge.data?.relId;
      if (!relId || !graphSelection?.onHoverEdge) return;
      const related = event?.relatedTarget;
      if (
        related instanceof Element &&
        related.closest(`[data-scissors-for="${relId}"]`)
      ) {
        return;
      }
      graphSelection.onHoverEdge(null);
    },
    [graphSelection],
  );

  const onPaneClick = useCallback(() => {
    graphSelection?.onSelectCanvas?.();
    contextualDiscovery?.onClose?.();
  }, [graphSelection, contextualDiscovery]);

  const showCycleOverlay = graphContext.cycleActive && !graphContext.isResolved;
  const connectionPrompt = graphContext.connectionPrompt;
  const showConnectionOverlay = Boolean(
    connectionPrompt?.paths?.length && !showCycleOverlay,
  );
  const connectionObjectName =
    connectionPrompt?.addedId &&
    (graphContext.objectNames?.[connectionPrompt.addedId] ??
      connectionPrompt.addedId);

  const expansionAnchorId = graphContext.expansionAnchorId;
  const focalId =
    nodes.find((n) => n.data?.isHub)?.id ??
    expansionAnchorId ??
    [...(graphContext.includedObjects ?? [])][0];
  const focalLabel = showCycleOverlay
    ? 'Resolve cycle'
    : graphContext.discoveryMode === 'contextual' && contextualDiscovery?.selection
      ? `Selected · ${nodes.find((n) => n.id === contextualDiscovery.selection.objectId)?.data?.label ?? ''}`
      : null;

  const rerunLayout = useCallback(() => {
    savedPositions.current.clear();
    lastFitKey.current = '';
    const { nodes: rawNodes, edges: e, focalId: focal } = buildGraph();
    runLayout(rawNodes, e, focal, { force: true, topologyChanged: true });
  }, [buildGraph, runLayout]);

  return (
    <div className={`${styles.wrap} ${fillContainer ? styles.wrapFill : ''}`}>
      <div
        ref={canvasRef}
        className={`${styles.canvas} ${fillContainer ? styles.canvasFill : ''} ${canvasUiVariant === 'v2' ? styles.canvasV2 : ''} ${graphSelection ? styles.canvasSelectable : ''}`}
      >
        <div className={styles.canvasFlow}>
          <div className={styles.canvasTopLeft}>
            {showInsertPopover && graphContext.onAddObject && !showCycleOverlay && (
              combinedCanvasToolbar && canvasControls?.discovery ? (
                <PerspectiveExpansionPanel
                  onAddObject={graphContext.onAddObject}
                  onAddEvent={graphContext.onAddEvent}
                  onAddMetric={hideMetrics ? undefined : graphContext.onAddMetric}
                  hideMetrics={hideMetrics}
                  discovery={canvasControls.discovery}
                  showProcessFilter={showProcessFilter}
                />
              ) : (
                <GraphInsertPopover
                  onAddObject={graphContext.onAddObject}
                  onAddEvent={graphContext.onAddEvent}
                  onAddMetric={hideMetrics ? undefined : graphContext.onAddMetric}
                  placeholder={
                    hideMetrics ? 'Search objects and events…' : undefined
                  }
                  showLabel={canvasUiVariant === 'v2'}
                  showProcessFilter={showProcessFilter}
                />
              )
            )}
            {focalLabel && (
              <span className={styles.focalTag}>{focalLabel}</span>
            )}
          </div>

          {!combinedCanvasToolbar && canvasControls?.discovery && (
            <div
              className={`${styles.canvasTopRight} ${hideMetrics ? styles.canvasTopRightCompact : ''}`}
            >
              <GraphCanvasControls
                discovery={canvasControls.discovery}
                variant={canvasControls.variant ?? canvasUiVariant}
                hideMetrics={hideMetrics}
              />
            </div>
          )}

          {showConnectionOverlay && (
            <GraphConnectionOverlay
              pathCount={connectionPrompt.paths.length}
              objectName={connectionObjectName}
            />
          )}
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onEdgeMouseEnter={onEdgeMouseEnter}
              onEdgeMouseLeave={onEdgeMouseLeave}
              onNodeDragStop={onNodeDragStop}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              nodeOrigin={[0.5, 0.34]}
              defaultViewport={defaultViewport ?? undefined}
              onInit={onInit}
              minZoom={0.55}
              maxZoom={1.4}
              proOptions={{ hideAttribution: true }}
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable
              panOnDrag
              selectionOnDrag={false}
              snapToGrid
              snapGrid={GRAPH_SNAP_GRID}
            >
              <Background
                gap={GRAPH_GRID_GAP}
                size={1}
                lineWidth={1}
                color="#e8ecf0"
                bgColor="#ffffff"
                variant="lines"
              />
              <Controls showInteractive={false} />
            </ReactFlow>
            {contextualDiscovery && (
              <ContextualDiscoveryMenu
                selection={contextualDiscovery.selection}
                counts={contextualDiscovery.counts}
                onReveal={contextualDiscovery.onReveal}
                onClose={contextualDiscovery.onClose}
              />
            )}
          </ReactFlowProvider>
        </div>

        {canvasUiVariant !== 'v2' && (
          <div className={styles.hud}>
            {canvasControls?.showViewToggle && canvasControls?.onToggleShowOnly && (
              <label className={styles.hudToggle}>
                <input
                  type="checkbox"
                  checked={canvasControls.showOnlyIncluded}
                  onChange={(e) => canvasControls.onToggleShowOnly(e.target.checked)}
                />
                <span className={styles.hudToggleTrack} />
                Show only included
              </label>
            )}
            <button type="button" className={styles.hudBtn} onClick={rerunLayout}>
              ⊞ Auto layout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
