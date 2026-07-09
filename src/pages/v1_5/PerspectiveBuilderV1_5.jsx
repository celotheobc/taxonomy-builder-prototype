import { useEffect, useMemo, useRef, useState } from 'react';
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
import { usePanelDimensions } from './layout/usePanelDimensions';
import RightInspector from './inspector/RightInspector';
import BottomPanel from './panels/BottomPanel';
import { usePerspectiveSelection } from './selection/usePerspectiveSelection';
import { buildV2Issues } from './utils/buildV2ViewData';
import { useClearEntitySelectionOnCycle } from '../../hooks/useClearEntitySelectionOnCycle';
import styles from './PerspectiveBuilderV1_5.module.css';

export default function PerspectiveBuilderV1_5({ onVersionChange }) {
  const progressive = useProgressiveBuilder('global');
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
    graphSelection,
  } = usePerspectiveSelection();

  const cycleActive = progressive.cycleActive && !progressive.isCycleResolved;
  const hadConnectionPrompt = useRef(false);

  useClearEntitySelectionOnCycle({
    cycleActive,
    selectionType: selection.type,
    onClear: selectCanvas,
    onCycleEnter: () => {
      setRightCollapsed(false);
    },
  });

  useEffect(() => {
    if (progressive.connectionPrompt && !hadConnectionPrompt.current) {
      selectCanvas();
      setRightCollapsed(false);
    }
    hadConnectionPrompt.current = Boolean(progressive.connectionPrompt);
  }, [progressive.connectionPrompt, selectCanvas]);

  const { validationStatus, relationshipCount, objectCount, eventCount, metricCount } =
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

  const counts = {
    objects: objectCount,
    events: eventCount,
    metrics: metricCount,
    relationships: relationshipCount,
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
      <LeftNav prototypeVersion="v1.5" onVersionChange={onVersionChange} />
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
                  counts={counts}
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
                  onSelectObject={selectObject}
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
