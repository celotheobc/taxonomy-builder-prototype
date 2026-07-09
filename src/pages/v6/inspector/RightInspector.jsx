import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import CycleResolutionInspector from '../../v5/inspector/CycleResolutionInspector';
import DisconnectedConnectionPanel from '../../../components/configuration/DisconnectedConnectionPanel';
import { SELECTION_TYPES } from '../../v5/selection/usePerspectiveSelection';
import InspectTabContent from './InspectTabContent';
import {
  CacheTab,
  INSPECTOR_TABS,
  OverviewTab,
} from './inspectorTabPanels';
import panelTabStyles from '../../v5/components/PanelTabs.module.css';
import styles from '../../v5/inspector/RightInspector.module.css';

const PROCESS_LABELS = {
  'order-to-cash': 'Order to Cash',
  'procure-to-pay': 'Procure to Pay',
  'accounts-payable': 'Accounts Payable',
};

export default function RightInspector({
  selection,
  progressive,
  validationStatus,
  perspectiveName,
  objectRows,
  eventRows,
  sourceProcessId,
  collapsed,
  onToggle,
  width = 360,
  onResizeWidth,
  cycleResolution = null,
  onHighlightRelationship,
  onSelectRelationship,
  onSelectObject,
  onSelectEvent,
  activeTab,
  onActiveTabChange,
  inventoryPlacement,
  relationshipCount,
  onFocusBottomTab,
}) {
  const inResolutionMode = Boolean(
    cycleResolution?.active && !cycleResolution?.resolved,
  );
  const inConnectionMode = Boolean(progressive.connectionPrompt);
  const forceResolutionPanel =
    inResolutionMode && selection.type !== SELECTION_TYPES.CYCLE_EDGE;
  const forceConnectionPanel =
    inConnectionMode && !forceResolutionPanel;
  const showSpecialPanel = forceResolutionPanel || forceConnectionPanel;

  return (
    <aside
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}
      style={{ width: collapsed ? 40 : width }}
      aria-label="Contextual inspector"
    >
      {!collapsed && onResizeWidth && (
        <ResizeHandle
          axis="x"
          onDelta={onResizeWidth}
          ariaLabel="Resize inspector width"
        />
      )}
      <div className={styles.panel}>
        {!collapsed && !showSpecialPanel && (
          <header className={styles.panelHeader}>
            <div className={panelTabStyles.bar} role="tablist" aria-label="Perspective panel">
              {INSPECTOR_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={
                    activeTab === tab.id ? panelTabStyles.tabActive : panelTabStyles.tab
                  }
                  onClick={() => onActiveTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button type="button" className={styles.collapseBtn} onClick={onToggle}>
              ▸
            </button>
          </header>
        )}
        {!collapsed && showSpecialPanel && (
          <header className={styles.panelHeader}>
            <div className={panelTabStyles.bar} />
            <button type="button" className={styles.collapseBtn} onClick={onToggle}>
              ▸
            </button>
          </header>
        )}
        {collapsed && (
          <header className={styles.panelHeader}>
            <button type="button" className={styles.collapseBtn} onClick={onToggle}>
              ◂
            </button>
          </header>
        )}
        {!collapsed && (
          <div className={styles.panelBody}>
            {forceResolutionPanel ? (
              <div className={styles.tabContent}>
                <CycleResolutionInspector
                  rows={cycleResolution.rows}
                  alert={cycleResolution.alert}
                  highlightedRelationshipId={cycleResolution.highlightedRelationshipId}
                  onHighlightRelationship={onHighlightRelationship}
                  onSelectRelationship={onSelectRelationship}
                  onRemoveRelationship={progressive.pruneRelationship}
                />
              </div>
            ) : forceConnectionPanel ? (
              <div className={styles.tabContent}>
                <DisconnectedConnectionPanel
                  prompt={progressive.connectionPrompt}
                  includedObjects={progressive.includedObjects}
                  previewPathId={progressive.previewBridgePathId}
                  onPreviewPath={progressive.previewConnectionPath}
                  onClearPreview={progressive.clearConnectionPathPreview}
                  onInsertPath={progressive.insertConnectionPath}
                  onKeepUnconnected={progressive.keepObjectsUnconnected}
                />
              </div>
            ) : (
              <>
                {activeTab === 'inspect' && (
                  <InspectTabContent
                    selection={selection}
                    progressive={progressive}
                    cycleResolution={cycleResolution}
                    onSelectRelationship={onSelectRelationship}
                    onSelectEvent={onSelectEvent}
                  />
                )}
                {activeTab === 'overview' && (
                  <OverviewTab
                    progressive={progressive}
                    validationStatus={validationStatus}
                    perspectiveName={perspectiveName}
                    objectRows={objectRows}
                    eventRows={eventRows}
                    sourceProcessId={sourceProcessId}
                    processLabels={PROCESS_LABELS}
                    selectedObjectId={
                      selection.type === SELECTION_TYPES.OBJECT ? selection.id : null
                    }
                    selectedEventId={
                      selection.type === SELECTION_TYPES.EVENT ? selection.id : null
                    }
                    onSelectObject={onSelectObject}
                    onSelectEvent={onSelectEvent}
                    inventoryPlacement={inventoryPlacement}
                    relationshipCount={relationshipCount}
                    onFocusBottomTab={onFocusBottomTab}
                  />
                )}
                {activeTab === 'cache' && <CacheTab />}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
