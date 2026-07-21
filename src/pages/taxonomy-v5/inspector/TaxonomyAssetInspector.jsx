import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import inspectorStyles from '../../v5/inspector/RightInspector.module.css';
import styles from './TaxonomyAssetInspector.module.css';

function MetaSection({ title, rows }) {
  return (
    <section className={styles.metaSection}>
      <h4 className={styles.metaSectionTitle}>{title}</h4>
      <dl className={styles.metaRows}>
        {rows.map((row) => (
          <div key={row.label} className={styles.metaRow}>
            <dt className={styles.metaLabel}>{row.label}</dt>
            <dd className={styles.metaValue}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function TaxonomyAssetInspector({
  taxonomy,
  collapsed,
  onToggle,
  width,
  onResizeWidth,
  lastUpdated = '—',
}) {
  return (
    <aside
      className={`${inspectorStyles.shell} ${collapsed ? inspectorStyles.shellCollapsed : ''}`}
      style={{ width: collapsed ? 40 : width }}
      aria-label="Taxonomy inspector"
    >
      {!collapsed && onResizeWidth && (
        <ResizeHandle axis="x" onDelta={onResizeWidth} ariaLabel="Resize inspector width" />
      )}
      <div className={inspectorStyles.panel}>
        <header className={inspectorStyles.panelHeader}>
          <span className={styles.headerTitle}>Inspector</span>
          <button
            type="button"
            className={`${inspectorStyles.collapseBtn} ${styles.collapseBtn}`}
            onClick={onToggle}
            aria-label={collapsed ? 'Expand inspector' : 'Collapse inspector'}
          >
            {collapsed ? '◂' : '▸'}
          </button>
        </header>

        {!collapsed && (
          <div className={styles.panelBody}>
            <MetaSection
              title="Asset"
              rows={[
                { label: 'Asset type', value: taxonomy.type },
                { label: 'Owner', value: taxonomy.owner ?? '—' },
                { label: 'Created', value: taxonomy.createdBy ?? '—' },
                { label: 'Last updated', value: lastUpdated },
                { label: 'Namespace', value: 'Custom' },
                { label: 'Reference key', value: taxonomy.referenceKey },
                { label: 'Status', value: taxonomy.status },
              ]}
            />

            <MetaSection
              title="Usage"
              rows={[
                { label: 'Usage', value: 'Not tracked yet' },
                { label: 'Linked assets', value: 'Not tracked yet' },
              ]}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
