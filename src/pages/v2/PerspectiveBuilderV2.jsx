import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildRelationshipTableView } from '../../utils/perspectiveRelationships';
import {
  buildPerspectiveEventSourceRows,
  buildPerspectiveMetricRows,
  buildPerspectiveObjectRows,
} from '../../utils/perspectiveEntities';
import AssetHeader from '../../components/layout/AssetHeader';
import ContextSidebar from '../../components/layout/ContextSidebar';
import LeftNav from '../../components/layout/LeftNav';
import Toast from '../../components/ui/Toast';
import { useProgressiveBuilder } from '../../hooks/useProgressiveBuilder';
import { useGraphBuilderContext } from '../../hooks/useGraphBuilderContext';
import { EXPERIENCES } from '../../data/mockData';
import AssetEditorLayout from './layout/AssetEditorLayout';
import { usePanelDimensions } from '../v1_5/layout/usePanelDimensions';
import RightInspector from './inspector/RightInspector';
import BottomPanel from './panels/BottomPanel';
import { usePerspectiveSelection } from '../v1_5/selection/usePerspectiveSelection';
import { buildV2Issues } from '../v1_5/utils/buildV2ViewData';
import { useClearEntitySelectionOnCycle } from '../../hooks/useClearEntitySelectionOnCycle';
import styles from '../v1_5/PerspectiveBuilderV1_5.module.css';

export default function PerspectiveBuilderV2({ onVersionChange }) {
  const progressive = useProgressiveBuilder('global', {
    unfocusedShowsAllGhosts: true,
    autoSuppressSuggestionsOnResolution: true,
  });
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
  const { rightWidth, bottomHeight, adjustRightWidth, adjustBottomHeight } =
    usePanelDimensions();

  const {
    selection,
    highlightedRelationshipId,
    bottomTab,
    setBottomTab,
    setHighlightedRelationshipId,
    selectObject,
    selectEvent,
    selectMetric,
    selectRelationship,
    selectIssue,
    selectCanvas,
    graphSelection: baseGraphSelection,
  } = usePerspectiveSelection();

  const focusIncludedObject = useCallback(
    (id) => {
      if (progressive.includedObjects.has(id)) {
        progressive.focusExpansionFrom(id, { silent: true });
      }
    },
    [progressive],
  );

  const selectCanvasWithClearFocus = useCallback(() => {
    selectCanvas();
    progressive.clearExpansionFocus();
  }, [selectCanvas, progressive]);

  const graphSelection = useMemo(
    () => ({
      ...baseGraphSelection,
      onSelectCanvas: selectCanvasWithClearFocus,
      onSelectNode: ({ kind, id, state }) => {
        baseGraphSelection.onSelectNode({ kind, id, state });
        if (kind === 'object') {
          focusIncludedObject(id);
        }
      },
    }),
    [baseGraphSelection, focusIncludedObject, selectCanvasWithClearFocus],
  );

  const handleSelectObject = useCallback(
    (id) => {
      selectObject(id);
      focusIncludedObject(id);
    },
    [selectObject, focusIncludedObject],
  );

  const cycleActive = progressive.cycleActive && !progressive.isCycleResolved;
  const hadConnectionPrompt = useRef(false);

  useClearEntitySelectionOnCycle({
    cycleActive,
    selectionType: selection.type,
    onClear: selectCanvasWithClearFocus,
    onCycleEnter: () => {
      setRightCollapsed(false);
    },
  });

  useEffect(() => {
    if (progressive.connectionPrompt && !hadConnectionPrompt.current) {
      selectCanvasWithClearFocus();
      setRightCollapsed(false);
    }
    hadConnectionPrompt.current = Boolean(progressive.connectionPrompt);
  }, [progressive.connectionPrompt, selectCanvasWithClearFocus]);

  const { validationStatus } =
    useGraphBuilderContext({
      experience: EXPERIENCES.PROGRESSIVE,
      progressive,
      routeAmbiguity: { includedObjects: new Set(), activeRelationships: [] },
      highlightedRelationshipId,
      inspectorSelection: selection,
    });

  const relationshipTable = useMemo(
    () =>
      buildRelationshipTableView(
        progressive.activeRelationships,
        progressive.includedObjects,
        {
          active: progressive.cycleActive,
          resolved: progressive.isCycleResolved,
          edgeIds: progressive.cycleEdgeIds,
        },
      ),
    [progressive],
  );

  const objectRows = useMemo(() => {
    const rows = buildPerspectiveObjectRows(progressive.includedObjects);
    return rows.map((row) => ({
      ...row,
      inPerspectiveRelationships: progressive.activeRelationships.filter(
        (r) =>
          progressive.includedRelationshipIds.has(r.id) &&
          (r.source === row.id || r.target === row.id),
      ).length,
    }));
  }, [
    progressive.includedObjects,
    progressive.activeRelationships,
    progressive.includedRelationshipIds,
  ]);

  const eventRows = useMemo(
    () => buildPerspectiveEventSourceRows(progressive.includedEvents),
    [progressive.includedEvents],
  );

  const metricRows = useMemo(
    () => buildPerspectiveMetricRows(progressive.includedMetrics),
    [progressive.includedMetrics],
  );

  const issues = useMemo(() => buildV2Issues(progressive), [progressive]);

  const tabCounts = {
    objects: objectRows.length,
    relationships: relationshipTable.rows.length,
    events: eventRows.length,
    metrics: metricRows.length,
    issues: issues.length,
  };

  const cycleResolution = {
    active: progressive.cycleActive,
    resolved: progressive.isCycleResolved,
    rows: relationshipTable.rows,
    alert: relationshipTable.alert,
    highlightedRelationshipId,
  };

  return (
    <div className={styles.app}>
      <LeftNav prototypeVersion="v2" onVersionChange={onVersionChange} />
      <div className={styles.mainColumn}>
        <div className={styles.workspace}>
          <ContextSidebar />
          <div className={styles.page}>
            <AssetHeader />
            <AssetEditorLayout
              progressive={progressive}
              graphSelection={graphSelection}
              highlightedRelationshipId={highlightedRelationshipId}
              rightInspector={
                <RightInspector
                  selection={selection}
                  progressive={progressive}
                  validationStatus={validationStatus}
                  collapsed={rightCollapsed}
                  onToggle={() => setRightCollapsed((v) => !v)}
                  width={rightWidth}
                  onResizeWidth={adjustRightWidth}
                  cycleResolution={cycleResolution}
                  onHighlightRelationship={setHighlightedRelationshipId}
                  onSelectRelationship={selectRelationship}
                />
              }
              bottomPanel={
                <BottomPanel
                  activeTab={bottomTab}
                  onTabChange={setBottomTab}
                  collapsed={bottomCollapsed}
                  onToggle={() => setBottomCollapsed((v) => !v)}
                  height={bottomHeight}
                  onResizeHeight={adjustBottomHeight}
                  tabCounts={tabCounts}
                  relationshipRows={relationshipTable.rows}
                  objectRows={objectRows}
                  eventRows={eventRows}
                  metricRows={metricRows}
                  issues={issues}
                  selection={selection}
                  onSelectRelationship={selectRelationship}
                  onSelectObject={handleSelectObject}
                  onSelectEvent={selectEvent}
                  onSelectMetric={selectMetric}
                  onSelectIssue={selectIssue}
                  onHighlightRelationship={setHighlightedRelationshipId}
                />
              }
            />
          </div>
        </div>
      </div>
      <Toast toast={progressive.toast} />
    </div>
  );
}
