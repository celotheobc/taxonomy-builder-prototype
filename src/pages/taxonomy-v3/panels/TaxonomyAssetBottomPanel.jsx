import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import panelTabStyles from '../../v5/components/PanelTabs.module.css';
import styles from '../../v1_5/panels/BottomPanel.module.css';
import { getDataPreviewRows, getPreviewColumns } from '../../../data/mockDataPreview';
import localStyles from '../panels/TaxonomyBottomPanel.module.css';

const TABS = [
  { id: 'preview', label: 'Data Preview' },
  { id: 'source', label: 'Source Records' },
];

export default function TaxonomyAssetBottomPanel({
  activeTab,
  onTabChange,
  collapsed,
  onToggle,
  height = 220,
  onResizeHeight,
  objectTypeId,
  previewSubtypeId,
  previewSubtypeLabel,
  sourceAttributeName,
  sourceRecords = [],
}) {
  const previewRows = getDataPreviewRows(objectTypeId, previewSubtypeId);
  const previewColumns = getPreviewColumns(objectTypeId);

  return (
    <section
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}
      style={{ height: collapsed ? 40 : height }}
      aria-label="Taxonomy supporting data"
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
                {tab.label}
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
                {previewSubtypeId ? (
                  <p className={localStyles.lead}>
                    Previewing subtype <strong>{previewSubtypeLabel}</strong>
                  </p>
                ) : (
                  <p className={localStyles.lead}>Select a member action to preview data.</p>
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

            {activeTab === 'source' && (
              <div className={localStyles.tableWrap}>
                <p className={localStyles.lead}>
                  Source records for <strong>{previewSubtypeLabel ?? 'selected member'}</strong> from{' '}
                  <strong>{sourceAttributeName}</strong>.
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
                    {sourceRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{record.matchingValue}</td>
                        <td>{record.label}</td>
                        <td>{record.recordCount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
