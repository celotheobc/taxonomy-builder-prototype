import { useMemo, useState } from 'react';
import { countSuggestedRelationships } from '../../v3/data/contextModelData';
import AssetSelectionBar from '../../v3/stage1/AssetSelectionBar';
import { usePanelDimensions } from '../../v1_5/layout/usePanelDimensions';
import { getAssociatedPerspectives } from '../data/processPageData';
import ProcessGraph from './ProcessGraph';
import ProcessTableView from './ProcessTableView';
import ProcessRightRail from './ProcessRightRail';
import ProcessBottomPanel from './ProcessBottomPanel';
import layoutStyles from '../../v1_5/PerspectiveBuilderV1_5.module.css';
import styles from './ProcessDetailView.module.css';

export default function ProcessDetailView({
  processId,
  processLabel,
  seed,
  selectionMode,
  selectedObjects,
  selectedEvents,
  onEnterSelectionMode,
  onCancelSelection,
  onToggleObject,
  onToggleEvent,
  onCreateFromEntire,
  onCreateFromSelection,
}) {
  const [viewMode, setViewMode] = useState('graph');
  const [bottomTab, setBottomTab] = useState('changelog');
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
  const { rightWidth, bottomHeight, adjustRightWidth, adjustBottomHeight } =
    usePanelDimensions();

  const objectIds = seed?.objects ?? [];
  const eventIds = seed?.events ?? [];
  const associatedPerspectives = useMemo(
    () => getAssociatedPerspectives(processId),
    [processId],
  );
  const relationshipCount = useMemo(
    () => countSuggestedRelationships(objectIds),
    [objectIds],
  );

  return (
    <div className={layoutStyles.page}>
      <div className={styles.editor}>
        <div className={styles.centerColumn}>
          <div className={styles.vizToolbar}>
            <div className={styles.viewToggle} role="group" aria-label="View mode">
              <button
                type="button"
                className={viewMode === 'graph' ? styles.viewActive : styles.viewBtn}
                onClick={() => setViewMode('graph')}
              >
                Graph
              </button>
              <button
                type="button"
                className={viewMode === 'table' ? styles.viewActive : styles.viewBtn}
                onClick={() => setViewMode('table')}
              >
                Table
              </button>
            </div>
          </div>

          <main className={styles.main} aria-label="Process visualization">
            <div
              className={`${styles.graphHost} ${selectionMode ? styles.selectionActive : ''}`}
            >
              {viewMode === 'graph' ? (
                <ProcessGraph
                  objectIds={objectIds}
                  eventIds={eventIds}
                  selectionMode={selectionMode}
                  selectedObjects={selectedObjects}
                  selectedEvents={selectedEvents}
                  onToggleObject={onToggleObject}
                  onToggleEvent={onToggleEvent}
                />
              ) : (
                <ProcessTableView
                  objectIds={objectIds}
                  eventIds={eventIds}
                  selectionMode={selectionMode}
                  selectedObjects={selectedObjects}
                  selectedEvents={selectedEvents}
                  onToggleObject={onToggleObject}
                  onToggleEvent={onToggleEvent}
                />
              )}
              <AssetSelectionBar
                variant="process"
                open={selectionMode}
                selectedObjects={selectedObjects}
                selectedEvents={selectedEvents}
                onCancel={onCancelSelection}
                onCreatePerspective={onCreateFromSelection}
              />
            </div>
          </main>

          <ProcessBottomPanel
            activeTab={bottomTab}
            onTabChange={setBottomTab}
            collapsed={bottomCollapsed}
            onToggle={() => setBottomCollapsed((v) => !v)}
            height={bottomHeight}
            onResizeHeight={adjustBottomHeight}
            relationshipCount={relationshipCount}
          />
        </div>

        <ProcessRightRail
          processId={processId}
          processLabel={processLabel}
          associatedPerspectives={associatedPerspectives}
          onCreateEntire={onCreateFromEntire}
          onSelectSubset={onEnterSelectionMode}
          width={rightWidth}
          collapsed={rightCollapsed}
          onToggle={() => setRightCollapsed((v) => !v)}
          onResizeWidth={adjustRightWidth}
        />
      </div>
    </div>
  );
}
