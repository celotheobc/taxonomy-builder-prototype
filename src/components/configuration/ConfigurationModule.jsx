import { EXPERIENCES } from '../../data/mockData';
import PerspectiveGraph from '../graph/PerspectiveGraph';
import EmptyState from './EmptyState';
import DisconnectedConnectionPanel from './DisconnectedConnectionPanel';
import SummaryStrip from './SummaryStrip';
import { useGraphBuilderContext } from '../../hooks/useGraphBuilderContext';
import styles from './ConfigurationModule.module.css';

export default function ConfigurationModule({
  experience,
  progressive,
  routeAmbiguity,
  highlightedRelationshipId = null,
  cycleResolutionCardsByRelId = null,
  layout = 'stacked',
  graphSelection = null,
  fillGraph = false,
  hideSummary = false,
  hideSectionHeader = false,
  canvasUiVariant = 'v1.5',
  hideMetrics = false,
  emptyStateComponent: EmptyStateComponent = EmptyState,
  emptyStateProps = {},
  combinedCanvasToolbar = false,
  showProcessFilter = false,
}) {
  const {
    isGlobal,
    isContextual,
    isProgressive,
    isRoute,
    graphContext,
    objectCount,
    eventCount,
    relationshipCount,
    validationStatus,
  } = useGraphBuilderContext({
    experience,
    progressive,
    routeAmbiguity,
    highlightedRelationshipId,
    inspectorSelection: graphSelection?.selection ?? null,
  });

  const moduleClass =
    layout === 'canvas'
      ? `${styles.module} ${styles.moduleCanvas}`
      : styles.module;

  return (
    <section className={moduleClass} aria-labelledby="config-heading">
      {!hideSectionHeader && (
        <div className={styles.header}>
          <h2 id="config-heading">Configuration</h2>
        </div>
      )}

      {isProgressive && (
        <>
          {!hideSummary && progressive.hasStarted && (
            <SummaryStrip
              objectCount={objectCount}
              eventCount={eventCount}
              relationshipCount={relationshipCount}
              validationStatus={validationStatus}
            />
          )}

          <div className={layout === 'canvas' ? styles.graphSurface : styles.graphStack}>
            <PerspectiveGraph
              mode="progressive"
              graphContext={{
                ...graphContext,
                cycleResolutionCardsByRelId,
                unifiedSuggestions: canvasUiVariant === 'v2',
              }}
              canvasUiVariant={canvasUiVariant}
              hideMetrics={hideMetrics}
              showInsertPopover={progressive.hasStarted}
              fillContainer={fillGraph}
              graphSelection={graphSelection}
              combinedCanvasToolbar={combinedCanvasToolbar}
              showProcessFilter={showProcessFilter}
              contextualDiscovery={
                isContextual
                  ? {
                      selection: progressive.contextualSelection,
                      counts: progressive.contextualCounts,
                      onReveal: progressive.revealContextualCategory,
                      onClose: progressive.closeContextualMenu,
                    }
                  : null
              }
              canvasControls={{
                variant: canvasUiVariant,
                discovery: isGlobal && progressive.hasStarted
                  ? {
                      filters: progressive.discoveryFilters,
                      onToggle: progressive.toggleDiscoveryFilter,
                      disabled: progressive.cycleActive,
                      showOnlyIncluded: progressive.showOnlyIncluded,
                      onSetShowOnlyIncluded: progressive.setShowOnlyIncluded,
                    }
                  : null,
                showOnlyIncluded: progressive.showOnlyIncluded,
                onToggleShowOnly: progressive.setShowOnlyIncluded,
                showViewToggle: progressive.hasStarted && canvasUiVariant !== 'v2',
              }}
            />

            {!progressive.hasStarted && (
              <div className={styles.emptyOverlay}>
                <EmptyStateComponent
                  onAddObject={progressive.addObject}
                  centered={layout === 'canvas'}
                  {...emptyStateProps}
                />
              </div>
            )}
          </div>

          {progressive.hasStarted && layout !== 'canvas' && (
            <DisconnectedConnectionPanel
              prompt={progressive.connectionPrompt}
              includedObjects={progressive.includedObjects}
              previewPathId={progressive.previewBridgePathId}
              onPreviewPath={progressive.previewConnectionPath}
              onClearPreview={progressive.clearConnectionPathPreview}
              onInsertPath={progressive.insertConnectionPath}
              onKeepUnconnected={progressive.keepObjectsUnconnected}
            />
          )}
        </>
      )}

      {isRoute && (
        <>
          {!hideSummary && (
            <SummaryStrip
              objectCount={objectCount}
              eventCount={eventCount}
              relationshipCount={relationshipCount}
              validationStatus={validationStatus}
            />
          )}

          <PerspectiveGraph
            mode="route-ambiguity"
            graphContext={graphContext}
            canvasUiVariant={canvasUiVariant}
            hideMetrics={hideMetrics}
            fillContainer={fillGraph}
            graphSelection={graphSelection}
          />
        </>
      )}
    </section>
  );
}
