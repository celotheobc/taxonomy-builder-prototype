import { EXPERIENCES } from '../../../data/mockData';
import ConfigurationModule from '../../../components/configuration/ConfigurationModule';
import styles from './AssetEditorLayout.module.css';

const ROUTE_STUB = {
  includedObjects: new Set(),
  activeRelationships: [],
};

export default function AssetEditorLayout({
  progressive,
  graphSelection,
  highlightedRelationshipId,
  cycleResolutionCardsByRelId = null,
  rightInspector,
  bottomPanel,
  hideMetrics = false,
  emptyStateComponent,
  emptyStateProps,
  combinedCanvasToolbar = false,
  showProcessFilter = false,
}) {
  return (
    <div className={styles.editor}>
      <div className={styles.centerColumn}>
        <main className={styles.main} aria-label="Graph work surface">
          <ConfigurationModule
            experience={EXPERIENCES.PROGRESSIVE}
            progressive={progressive}
            routeAmbiguity={ROUTE_STUB}
            highlightedRelationshipId={highlightedRelationshipId}
            cycleResolutionCardsByRelId={cycleResolutionCardsByRelId}
            layout="canvas"
            fillGraph
            hideSummary
            hideSectionHeader
            graphSelection={graphSelection}
            canvasUiVariant="v2"
            hideMetrics={hideMetrics}
            emptyStateComponent={emptyStateComponent}
            emptyStateProps={emptyStateProps}
            combinedCanvasToolbar={combinedCanvasToolbar}
            showProcessFilter={showProcessFilter}
          />
        </main>
        {bottomPanel}
      </div>
      {rightInspector}
    </div>
  );
}
