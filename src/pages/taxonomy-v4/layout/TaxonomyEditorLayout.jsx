import editorStyles from '../../v2/layout/AssetEditorLayout.module.css';
import styles from './TaxonomyEditorLayout.module.css';

export default function TaxonomyEditorLayout({ mainContent, rightInspector, bottomPanel }) {
  return (
    <div className={editorStyles.editor}>
      <div className={styles.centerColumn}>
        <main className={styles.main} aria-label="Object type work surface">
          {mainContent}
        </main>
        <div className={styles.bottomDrawer}>{bottomPanel}</div>
      </div>
      {rightInspector}
    </div>
  );
}
