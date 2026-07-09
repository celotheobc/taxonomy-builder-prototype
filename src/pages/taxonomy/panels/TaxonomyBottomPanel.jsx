import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import panelTabStyles from '../../v5/components/PanelTabs.module.css';
import styles from '../../v1_5/panels/BottomPanel.module.css';
import { getDataPreviewRows, getPreviewColumns } from '../../../data/mockDataPreview';
import localStyles from './TaxonomyBottomPanel.module.css';

const TABS = [
  { id: 'preview', label: 'Data Preview' },
  { id: 'taxonomy', label: 'Generated Taxonomy' },
  { id: 'values', label: 'Source Values', countKey: 'values' },
];

function tabLabel(tab, counts) {
  if (!tab.countKey) return tab.label;
  const count = counts[tab.countKey];
  return count ? `${tab.label} (${count})` : tab.label;
}

export default function TaxonomyBottomPanel({
  objectTypeId,
  activeTab,
  onTabChange,
  collapsed,
  onToggle,
  height = 220,
  onResizeHeight,
  subtypes,
  generatedTaxonomy,
  splitAttribute,
  previewSubtypeId,
}) {
  const previewRows = getDataPreviewRows(objectTypeId, previewSubtypeId);
  const previewColumns = getPreviewColumns(objectTypeId);
  const tabCounts = { values: subtypes.length };

  return (
    <section
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}
      style={{ height: collapsed ? 40 : height }}
      aria-label="Object type supporting data"
    >
      {!collapsed && onResizeHeight && (
        <ResizeHandle axis="y" onDelta={onResizeHeight} ariaLabel="Resize bottom panel height" />
      )}
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={panelTabStyles.bar} role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? panelTabStyles.tabActive : panelTabStyles.tab}
                onClick={() => onTabChange(tab.id)}
              >
                {tabLabel(tab, tabCounts)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`${styles.collapseBtn} ${localStyles.collapseBtn}`}
            onClick={onToggle}
            aria-label={collapsed ? 'Expand bottom panel' : 'Collapse bottom panel'}
          >
            {collapsed ? '▴' : '▾'}
          </button>
        </header>

        {!collapsed && (
          <div className={styles.body}>
            {activeTab === 'preview' && (
              <div className={localStyles.tableWrap}>
                {previewSubtypeId && (
                  <p className={localStyles.lead}>
                    Previewing subtype <strong>{subtypes.find((s) => s.id === previewSubtypeId)?.label}</strong>
                  </p>
                )}
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {previewColumns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => (
                      <tr key={row.id}>
                        {previewColumns.map((column) => (
                          <td key={column.key}>{row[column.key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'taxonomy' && (
              <div className={localStyles.metaBlock}>
                {generatedTaxonomy ? (
                  <>
                    <p className={localStyles.lead}>{generatedTaxonomy.description}</p>
                    <dl className={localStyles.metaList}>
                      <div className={localStyles.metaRow}>
                        <dt>Name</dt>
                        <dd>{generatedTaxonomy.name}</dd>
                      </div>
                      <div className={localStyles.metaRow}>
                        <dt>Type</dt>
                        <dd>{generatedTaxonomy.type}</dd>
                      </div>
                      <div className={localStyles.metaRow}>
                        <dt>Status</dt>
                        <dd>{generatedTaxonomy.status}</dd>
                      </div>
                      <div className={localStyles.metaRow}>
                        <dt>Reference key</dt>
                        <dd>{generatedTaxonomy.referenceKey}</dd>
                      </div>
                      <div className={localStyles.metaRow}>
                        <dt>Source object type</dt>
                        <dd>{generatedTaxonomy.sourceObjectTypeName}</dd>
                      </div>
                      <div className={localStyles.metaRow}>
                        <dt>Split attribute</dt>
                        <dd>{generatedTaxonomy.splitAttributeName}</dd>
                      </div>
                    </dl>
                    <p className={localStyles.readOnlyNote}>
                      Generated behind the scenes when subtypes are created. Structural editing happens on the Object Type.
                    </p>
                  </>
                ) : (
                  <p className={styles.empty}>Generate subtypes to create a taxonomy asset.</p>
                )}
              </div>
            )}

            {activeTab === 'values' && (
              <div className={localStyles.tableWrap}>
                {splitAttribute ? (
                  <>
                    <p className={localStyles.lead}>
                      Distinct values from <strong>{splitAttribute.name}</strong> mapped to subtypes.
                    </p>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Attribute value</th>
                          <th>Mapped subtype</th>
                          <th>Rows</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subtypes.filter((s) => !s.hidden).map((subtype) => (
                          <tr key={subtype.id}>
                            <td>{subtype.matchingValue}</td>
                            <td>{subtype.label}</td>
                            <td>{subtype.recordCount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className={styles.empty}>No source values until subtypes are generated.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
