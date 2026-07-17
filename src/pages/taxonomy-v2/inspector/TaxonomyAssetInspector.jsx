import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import inspectorStyles from '../../v5/inspector/RightInspector.module.css';
import {
  countGroups,
  getHierarchyDepth,
  getUngroupedMemberIds,
} from '../../../data/taxonomyHierarchy';
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
  groups,
  subtypes,
  collapsed,
  onToggle,
  width,
  onResizeWidth,
  onOpenObjectType,
}) {
  const visibleSubtypes = subtypes.filter((subtype) => !subtype.hidden);
  const ungroupedCount = getUngroupedMemberIds(visibleSubtypes, groups).length;
  const assignedCount = visibleSubtypes.length - ungroupedCount;

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
            <div className={styles.introBlock}>
              <p className={styles.eyebrow}>Taxonomy</p>
              <h3 className={styles.assetName}>{taxonomy.name}</h3>
              <p className={styles.bodyText}>{taxonomy.description}</p>
            </div>

            <MetaSection
              title="Source"
              rows={[
                { label: 'Linked object type', value: taxonomy.sourceObjectTypeName },
                { label: 'Source attribute', value: taxonomy.splitAttributeName },
              ]}
            />

            <MetaSection
              title="Hierarchy"
              rows={[
                { label: 'Groups', value: String(countGroups(groups)) },
                { label: 'Assigned members', value: String(assignedCount) },
                { label: 'Ungrouped members', value: String(ungroupedCount) },
                { label: 'Hierarchy depth', value: String(getHierarchyDepth(groups)) },
              ]}
            />

            <MetaSection
              title="Asset"
              rows={[
                { label: 'Type', value: taxonomy.type },
                { label: 'Status', value: taxonomy.status },
                { label: 'Created by', value: taxonomy.createdBy },
                { label: 'Owner', value: taxonomy.owner ?? '—' },
                { label: 'Reference key', value: taxonomy.referenceKey },
              ]}
            />

            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => onOpenObjectType?.(taxonomy.sourceObjectTypeId)}
              >
                Open {taxonomy.sourceObjectTypeName}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
