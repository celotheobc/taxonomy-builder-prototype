import styles from './TaxonomyEditor.module.css';

export default function TaxonomyOverview({ taxonomy, hierarchyStats, onOpenObjectType }) {
  const containsLabel = `${hierarchyStats.subtypeCount} value${hierarchyStats.subtypeCount === 1 ? '' : 's'}`;
  const depthLabel = `${hierarchyStats.maxLevel} level${hierarchyStats.maxLevel === 1 ? '' : 's'}`;

  return (
    <section className={styles.taxonomyOverview} aria-label="Overview">
      <h2 className={styles.overviewSectionTitle}>Overview</h2>
      <dl className={styles.overviewMeta}>
        <div className={styles.overviewMetaRow}>
          <dt>Source object</dt>
          <dd>
            <button
              type="button"
              className={styles.overviewLink}
              onClick={() => onOpenObjectType?.(taxonomy.sourceObjectTypeId)}
            >
              {taxonomy.sourceObjectTypeName}
            </button>
          </dd>
        </div>
        <div className={styles.overviewMetaRow}>
          <dt>Generated from</dt>
          <dd>{taxonomy.splitAttributeName}</dd>
        </div>
        <div className={styles.overviewMetaRow}>
          <dt>Mode</dt>
          <dd>Generated from attribute</dd>
        </div>
        <div className={styles.overviewMetaRow}>
          <dt>Contains</dt>
          <dd>{containsLabel}</dd>
        </div>
        <div className={styles.overviewMetaRow}>
          <dt>Depth</dt>
          <dd>{depthLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
