import styles from './Hierarchy.module.css';

export default function HierarchyMetadataHeader({ showActions = true }) {
  return (
    <div
      className={`${styles.hierarchyMetaHeaderRow} ${showActions ? styles.hierarchyMetaHeaderRowWithActions : ''}`}
      role="row"
      aria-label="Subtype hierarchy columns"
    >
      <span className={styles.hierarchyMetaHeaderName}>Name</span>
      <div className={styles.hierarchyMetaHeaderBand}>
        <div className={styles.hierarchyMetaHeaderColumns}>
          <span className={styles.hierarchyMetaHeaderCol}>Split by</span>
          <span className={styles.hierarchyMetaHeaderCol}>Subtypes</span>
          <span className={styles.hierarchyMetaHeaderCol}>Unused values</span>
          <span
            className={`${styles.hierarchyMetaHeaderCol} ${styles.hierarchyMetaHeaderColTaxonomy}`}
          >
            <span className={styles.splitMetaTaxonomyDot} aria-hidden />
            <span>Taxonomy</span>
          </span>
        </div>
      </div>
    </div>
  );
}
