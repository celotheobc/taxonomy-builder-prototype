import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import PerspectiveNode from '../../../components/graph/PerspectiveNode';
import RouteEdge from '../../../components/graph/RouteEdge';
import MakeGridBackdrop from '../../../components/graph/MakeGridBackdrop';
import { GRAPH_GRID_GAP } from '../../../utils/graphGrid';
import { eventLinks, relationships } from '../../../data/mockData';
import { enrichEdgesWithHandles } from '../../../utils/edgeHandles';
import {
  CONTEXT_EVENT_IDS,
  CONTEXT_OBJECT_IDS,
  CONTEXT_PROCESSES,
  getContextEventName,
  getContextObjectName,
} from '../data/contextModelData';
import { getNeighborNodeIds } from './contextModelDetail';
import {
  computeContextModelPositions,
  contextModelPositionMap,
} from '../utils/contextModelLayout';
import styles from './ContextModelGraph.module.css';

const nodeTypes = { perspective: PerspectiveNode };
const edgeTypes = { route: RouteEdge };

const defaultEdgeOptions = {
  type: 'route',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 12,
    height: 12,
    color: '#b8c4ce',
  },
};

function GraphViewport({ layoutKey, containerRef }) {
  const { fitView } = useReactFlow();

  const runFit = useCallback(() => {
    const element = containerRef?.current;
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    fitView({ padding: 0.1, duration: 280, maxZoom: 1.05 });
  }, [containerRef, fitView]);

  useEffect(() => {
    const id = window.setTimeout(runFit, 80);
    return () => window.clearTimeout(id);
  }, [runFit, layoutKey]);

  useEffect(() => {
    const element = containerRef?.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(runFit);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef, runFit]);

  return null;
}

function getInteractionState(nodeId, kind, focusNodeId, neighbors, selectionMode) {
  if (selectionMode && kind === 'process') return 'unselectable';
  if (focusNodeId === nodeId) return 'selected';
  if (focusNodeId) {
    if (neighbors.has(nodeId)) return 'neighbor';
    return 'dimmed';
  }
  return 'default';
}

function perspectiveKind(cmKind) {
  if (cmKind === 'event') return 'eventSource';
  return cmKind;
}

function mapNodeState(interaction) {
  if (interaction === 'dimmed') return 'included';
  return 'included';
}

function buildNodeData({
  label,
  cmKind,
  entityId,
  selectionMode,
  selectable,
  basketSelected,
  interaction,
  showLabel,
}) {
  const inBasket = Boolean(basketSelected && selectionMode);
  return {
    label,
    kind: perspectiveKind(cmKind),
    cmKind,
    entityId,
    state: mapNodeState(interaction),
    visualVariant: 'explorer',
    basketSelected: inBasket,
    isSelectedContext: interaction === 'selected',
    cmNeighbor: interaction === 'neighbor',
    explorerUnselectable: interaction === 'unselectable',
    explorerMuted: interaction === 'dimmed',
    cmAssetPicker: Boolean(selectionMode && selectable),
    explorerSelectable: selectionMode
      ? Boolean(selectable)
      : interaction !== 'unselectable',
    showLabel,
  };
}

function buildNodes(
  selectionMode,
  selectedObjects,
  selectedEvents,
  positions,
  focusNodeId,
  neighbors,
) {
  const nodes = [];

  for (const id of CONTEXT_OBJECT_IDS) {
    const nodeId = `obj-${id}`;
    const interaction = getInteractionState(
      nodeId,
      'object',
      focusNodeId,
      neighbors,
      selectionMode,
    );
    nodes.push({
      id: nodeId,
      type: 'perspective',
      position: positions[id] ?? { x: 0, y: 0 },
      zIndex: focusNodeId === nodeId ? 20 : neighbors.has(nodeId) ? 12 : 5,
      data: buildNodeData({
        label: getContextObjectName(id),
        cmKind: 'object',
        entityId: id,
        selectionMode,
        selectable: selectionMode,
        basketSelected: selectedObjects.has(id),
        interaction,
        showLabel: true,
      }),
    });
  }

  for (const id of CONTEXT_EVENT_IDS) {
    const nodeId = `evt-${id}`;
    const interaction = getInteractionState(
      nodeId,
      'event',
      focusNodeId,
      neighbors,
      selectionMode,
    );
    nodes.push({
      id: nodeId,
      type: 'perspective',
      position: positions[id] ?? { x: 0, y: 0 },
      zIndex: focusNodeId === nodeId ? 20 : neighbors.has(nodeId) ? 12 : 5,
      data: buildNodeData({
        label: getContextEventName(id),
        cmKind: 'event',
        entityId: id,
        selectionMode,
        selectable: selectionMode,
        basketSelected: selectedEvents.has(id),
        interaction,
        showLabel: true,
      }),
    });
  }

  for (const proc of CONTEXT_PROCESSES) {
    const nodeId = `proc-${proc.id}`;
    const interaction = getInteractionState(
      nodeId,
      'process',
      focusNodeId,
      neighbors,
      selectionMode,
    );
    nodes.push({
      id: nodeId,
      type: 'perspective',
      position: positions[proc.id] ?? { x: 0, y: 0 },
      zIndex: focusNodeId === nodeId ? 20 : 5,
      data: buildNodeData({
        label: proc.name,
        cmKind: 'process',
        entityId: proc.id,
        selectionMode,
        selectable: false,
        basketSelected: false,
        interaction,
        showLabel: true,
      }),
    });
  }

  return nodes;
}

function buildEdges(positionMap, focusNodeId) {
  const contextObjects = new Set(CONTEXT_OBJECT_IDS);
  const contextEvents = new Set(CONTEXT_EVENT_IDS);
  const edges = [];

  for (const relationship of relationships) {
    if (!contextObjects.has(relationship.source) || !contextObjects.has(relationship.target)) {
      continue;
    }
    const source = `obj-${relationship.source}`;
    const target = `obj-${relationship.target}`;
    const connected = Boolean(focusNodeId && (source === focusNodeId || target === focusNodeId));

    edges.push({
      id: relationship.id,
      type: 'route',
      source,
      target,
      data: {
        relId: relationship.id,
        included: connected,
        dimmed: Boolean(focusNodeId && !connected),
        contextOverview: !focusNodeId,
        directPath: true,
      },
    });
  }

  for (const link of eventLinks) {
    if (!contextEvents.has(link.eventId) || !contextObjects.has(link.objectId)) {
      continue;
    }
    const source = `evt-${link.eventId}`;
    const target = `obj-${link.objectId}`;
    const connected = Boolean(focusNodeId && (source === focusNodeId || target === focusNodeId));

    edges.push({
      id: link.id,
      type: 'route',
      source,
      target,
      data: {
        potential: Boolean(focusNodeId && !connected),
        isEventLink: true,
        included: connected,
        dimmed: Boolean(focusNodeId && !connected),
        contextOverview: !focusNodeId,
        directPath: true,
      },
    });
  }

  return enrichEdgesWithHandles(edges, positionMap);
}

function ContextModelGraphInner({
  selectionMode,
  selectedObjects,
  selectedEvents,
  focusedNode,
  onFocusNode,
  onToggleObject,
  onToggleEvent,
  detailOpen = false,
}) {
  const wrapRef = useRef(null);
  const positions = useMemo(() => computeContextModelPositions(), []);

  const focusNodeId = focusedNode
    ? `${focusedNode.kind === 'object' ? 'obj' : focusedNode.kind === 'event' ? 'evt' : 'proc'}-${focusedNode.entityId}`
    : null;

  const neighbors = useMemo(() => getNeighborNodeIds(focusNodeId), [focusNodeId]);

  const nodes = useMemo(
    () =>
      buildNodes(
        selectionMode,
        selectedObjects,
        selectedEvents,
        positions,
        focusNodeId,
        neighbors,
      ),
    [selectionMode, selectedObjects, selectedEvents, positions, focusNodeId, neighbors],
  );

  const edges = useMemo(() => {
    const positionMap = contextModelPositionMap(nodes);
    return buildEdges(positionMap, focusNodeId);
  }, [nodes, focusNodeId]);

  const onNodeClick = useCallback(
    (_, node) => {
      const { cmKind, entityId, explorerSelectable } = node.data ?? {};
      if (selectionMode) {
        if (!explorerSelectable) return;
        if (cmKind === 'object') onToggleObject?.(entityId);
        if (cmKind === 'event') onToggleEvent?.(entityId);
        return;
      }
      onFocusNode?.({ kind: cmKind, entityId });
    },
    [selectionMode, onFocusNode, onToggleObject, onToggleEvent],
  );

  const onPaneClick = useCallback(() => {
    if (selectionMode) return;
    onFocusNode?.(null);
  }, [onFocusNode, selectionMode]);

  const layoutKey = focusedNode
    ? `${focusedNode.kind}:${focusedNode.entityId}:${detailOpen ? 'detail' : 'node'}`
    : 'overview';

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div className={styles.canvas}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          minZoom={0.35}
          maxZoom={1.4}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          proOptions={{ hideAttribution: true }}
        >
          <GraphViewport layoutKey={layoutKey} containerRef={wrapRef} />
          <MakeGridBackdrop />
          <Background
            gap={GRAPH_GRID_GAP}
            size={1}
            color="#e8ecf0"
            variant="lines"
          />
          <Controls showInteractive={false} position="bottom-right" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function ContextModelGraph(props) {
  return (
    <ReactFlowProvider>
      <ContextModelGraphInner {...props} />
    </ReactFlowProvider>
  );
}
