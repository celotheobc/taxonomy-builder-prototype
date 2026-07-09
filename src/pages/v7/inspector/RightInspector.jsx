import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import CycleResolutionInspectorV7 from './CycleResolutionInspectorV7';
import ConnectionDecisionInspectorV7 from './ConnectionDecisionInspectorV7';
import DecisionPanelHeader from './DecisionPanelHeader';
import { CycleResolutionIntro, ConnectionDecisionIntro } from './DecisionPanelIntro';
import { objectName } from '../../../components/configuration/connectionPath/PathRouteLabel';
import { SELECTION_TYPES } from '../../v5/selection/usePerspectiveSelection';
import InspectTabContent from '../../v6/inspector/InspectTabContent';
import {
  CacheTab,
  INSPECTOR_TABS,
  OverviewTab,
} from '../../v6/inspector/inspectorTabPanels';
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
  previewRelationshipId = null,
  previewConnectionChoiceId = null,
  onPreviewImpact,
  onPreviewConnectionConsequences,
  onHoverConnectionChoice,
  onAddConnection,
  onKeepDisconnected,
  onRemoveRelationship,
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
  const connectionPrompt = progressive.connectionPrompt;
  const inConnectionMode = Boolean(connectionPrompt);
  const forceResolutionPanel = inResolutionMode;
  const forceConnectionPanel =
    inConnectionMode && !forceResolutionPanel;
  const showSpecialPanel = forceResolutionPanel || forceConnectionPanel;
  const connectionObjectName = connectionPrompt
    ? objectName(connectionPrompt.addedId)
    : '';

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
        {!collapsed && showSpecialPanel && (
          <header className={styles.panelHeader}>
            <DecisionPanelHeader />
            <button type="button" className={styles.collapseBtn} onClick={onToggle}>
              ▸
            </button>
          </header>
        )}
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
                <CycleResolutionIntro />
                <CycleResolutionInspectorV7
                  rows={cycleResolution.rows}
                  highlightedRelationshipId={cycleResolution.highlightedRelationshipId}
                  previewRelationshipId={previewRelationshipId}
                  onHighlightRelationship={onHighlightRelationship}
                  onPreviewImpact={onPreviewImpact}
                  onRemoveRelationship={onRemoveRelationship}
                />
              </div>
            ) : forceConnectionPanel ? (
              <div className={styles.tabContent}>
                <ConnectionDecisionIntro
                  objectName={connectionObjectName}
                  pathCount={connectionPrompt.paths.length}
                />
                <ConnectionDecisionInspectorV7
                  prompt={connectionPrompt}
                  includedObjects={progressive.includedObjects}
                  previewChoiceId={previewConnectionChoiceId}
                  hoverChoiceId={progressive.previewBridgePathId ?? previewConnectionChoiceId}
                  onHoverChoice={onHoverConnectionChoice}
                  onPreviewConsequences={onPreviewConnectionConsequences}
                  onAddConnection={onAddConnection}
                  onKeepDisconnected={onKeepDisconnected}
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
                    onPreviewRelationshipConsequences={onPreviewImpact}
                    previewRelationshipId={previewRelationshipId}
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
                    hideAgentContext
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
