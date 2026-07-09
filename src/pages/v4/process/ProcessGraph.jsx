import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { GRAPH_GRID_GAP } from '../../../utils/graphGrid';
import {
  getContextEventName,
  getContextObjectName,
} from '../../v3/data/contextModelData';
import { computeProcessLaneLayout } from '../utils/processLayout';
import ProcessLaneLayer from './ProcessLaneLayer';
import ProcessTrackNode from './ProcessTrackNode';
import ProcessStationNode from './ProcessStationNode';
import styles from './ProcessGraph.module.css';

const nodeTypes = {
  processLaneLayer: ProcessLaneLayer,
  processTrack: ProcessTrackNode,
  processStation: ProcessStationNode,
};

function GraphViewport({ layoutKey, containerRef }) {
  const { fitView } = useReactFlow();

  const runFit = useCallback(() => {
    const element = containerRef?.current;
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    fitView({ padding: 0.18, duration: 280, maxZoom: 1.05 });
  }, [containerRef, fitView]);

  useEffect(() => {
    const id = window.setTimeout(runFit, 80);
    return () => window.clearTimeout(id);
  }, [runFit, layoutKey]);

  return null;
}

function buildPickerFlags({ selectionMode, basketSelected }) {
  return {
    basketSelected: Boolean(basketSelected && selectionMode),
    cmAssetPicker: Boolean(selectionMode),
    explorerSelectable: Boolean(selectionMode),
  };
}

function ProcessGraphInner({
  objectIds,
  eventIds,
  selectionMode,
  selectedObjects,
  selectedEvents,
  onToggleObject,
  onToggleEvent,
}) {
  const wrapRef = useRef(null);
  const layout = useMemo(
    () => computeProcessLaneLayout(objectIds, eventIds),
    [objectIds, eventIds],
  );

  const laneColorByObject = useMemo(
    () => Object.fromEntries(layout.lanes.map((lane) => [lane.objectId, lane.color])),
    [layout.lanes],
  );

  const nodes = useMemo(() => {
    const list = [
      {
        id: 'process-lane-layer',
        type: 'processLaneLayer',
        position: { x: 0, y: 0 },
        selectable: false,
        draggable: false,
        focusable: false,
        zIndex: 0,
        data: {
          lanes: layout.lanes,
          connections: layout.connections,
          width: layout.width,
          height: layout.height,
        },
      },
    ];

    for (const id of objectIds) {
      const pos = layout.positions[id];
      if (!pos) continue;
      list.push({
        id: `obj-${id}`,
        type: 'processTrack',
        position: { x: pos.x, y: pos.y },
        zIndex: 5,
        className: selectionMode ? 'selectable' : undefined,
        data: {
          label: getContextObjectName(id),
          cmKind: 'object',
          entityId: id,
          laneColor: laneColorByObject[id],
          ...buildPickerFlags({
            selectionMode,
            basketSelected: selectedObjects.has(id),
          }),
        },
      });
    }

    for (const id of eventIds) {
      const pos = layout.positions[id];
      if (!pos) continue;
      list.push({
        id: `evt-${id}`,
        type: 'processStation',
        position: { x: pos.x, y: pos.y },
        zIndex: 6,
        className: selectionMode ? 'selectable' : undefined,
        data: {
          label: getContextEventName(id),
          cmKind: 'event',
          entityId: id,
          laneColor: laneColorByObject[pos.laneObjectId],
          ...buildPickerFlags({
            selectionMode,
            basketSelected: selectedEvents.has(id),
          }),
        },
      });
    }

    return list;
  }, [
    objectIds,
    eventIds,
    layout,
    laneColorByObject,
    selectionMode,
    selectedObjects,
    selectedEvents,
  ]);

  const onNodeClick = useCallback(
    (_, node) => {
      if (!selectionMode) return;
      const { cmKind, entityId } = node.data ?? {};
      if (cmKind === 'object') onToggleObject?.(entityId);
      if (cmKind === 'event') onToggleEvent?.(entityId);
    },
    [selectionMode, onToggleObject, onToggleEvent],
  );

  const layoutKey = `${selectionMode}|${objectIds.join(',')}|${[...selectedObjects].join(',')}|${[...selectedEvents].join(',')}`;

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div className={styles.canvas}>
        <ReactFlow
          nodes={nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          minZoom={0.35}
          maxZoom={1.4}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          proOptions={{ hideAttribution: true }}
        >
          <GraphViewport layoutKey={layoutKey} containerRef={wrapRef} />
          <Background gap={GRAPH_GRID_GAP} size={1} color="#e8ecf0" variant="lines" />
          <Controls showInteractive={false} position="bottom-right" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function ProcessGraph(props) {
  return (
    <ReactFlowProvider>
      <ProcessGraphInner {...props} />
    </ReactFlowProvider>
  );
}
