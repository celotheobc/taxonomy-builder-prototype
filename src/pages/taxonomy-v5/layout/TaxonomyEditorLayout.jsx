import editorStyles from '../../v2/layout/AssetEditorLayout.module.css';
import styles from './TaxonomyEditorLayout.module.css';

export default function TaxonomyEditorLayout({ mainContent, rightInspector, bottomPanel }) {
  return (
    <div className={editorStyles.editor}>
      <div className={styles.centerColumn}>
        <main className={styles.main} aria-label="Taxonomy work surface">
          {mainContent}
        </main>
        {bottomPanel ? <div className={styles.bottomDrawer}>{bottomPanel}</div> : null}
      </div>
      {rightInspector}
    </div>
  );
}
