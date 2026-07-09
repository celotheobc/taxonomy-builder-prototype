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
  rightInspector,
  bottomPanel,
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
            layout="canvas"
            fillGraph
            hideSummary
            hideSectionHeader
            graphSelection={graphSelection}
            canvasUiVariant="v1.5"
          />
        </main>
        {bottomPanel}
      </div>
      {rightInspector}
    </div>
  );
}
