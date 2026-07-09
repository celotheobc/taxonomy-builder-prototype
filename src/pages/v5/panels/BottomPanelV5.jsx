import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import PanelEmptyHint from '../components/PanelEmptyHint';
import panelTabStyles from '../components/PanelTabs.module.css';
import styles from '../../v1_5/panels/BottomPanel.module.css';

function DataTable({ columns, rows, selectedId, highlightedId, onSelectRow, onHoverRow, empty }) {
  if (!rows.length) {
    return <p className={styles.empty}>{empty}</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={
                selectedId === row.id
                  ? styles.rowSelected
                  : highlightedId === row.id
                    ? styles.rowHovered
                    : undefined
              }
              tabIndex={0}
              onClick={() => onSelectRow?.(row)}
              onMouseEnter={() => onHoverRow?.(row.id)}
              onMouseLeave={() => onHoverRow?.(null)}
              onFocus={() => onHoverRow?.(row.id)}
              onBlur={() => onHoverRow?.(null)}
            >
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  { id: 'relationships', label: 'Relationships', countKey: 'relationships' },
  { id: 'issues', label: 'Issues / Problems', countKey: 'issues' },
];

function tabLabel(tab, tabCounts) {
  if (!tab.countKey) return tab.label;
  return `${tab.label} (${tabCounts[tab.countKey] ?? 0})`;
}

export default function BottomPanelV5({
  activeTab,
  onTabChange,
  collapsed,
  onToggle,
  height = 220,
  onResizeHeight,
  tabCounts,
  relationshipRows,
  issues,
  selection,
  onSelectRelationship,
  onSelectIssue,
  onHoverRelationship,
  highlightedRelationshipId = null,
  perspectiveEmpty = false,
}) {
  const selectedRowId =
    selection?.type === 'relationship' || selection?.type === 'cycleEdge'
      ? selection.id
      : null;

  return (
    <section
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}
      style={{ height: collapsed ? 40 : height }}
      aria-label="Perspective diagnostics"
    >
      {!collapsed && onResizeHeight && (
        <ResizeHandle
          axis="y"
          onDelta={onResizeHeight}
          ariaLabel="Resize bottom panel height"
        />
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
          <button type="button" className={styles.collapseBtn} onClick={onToggle}>
            {collapsed ? '▴' : '▾'}
          </button>
        </header>

        {!collapsed && (
          <div className={styles.body}>
            {activeTab === 'relationships' &&
              (perspectiveEmpty ? (
                <PanelEmptyHint
                  variant="relationship"
                  text="Relationships appear once you start building."
                />
              ) : (
                <DataTable
                  columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'source', label: 'Source' },
                    { key: 'target', label: 'Target' },
                    { key: 'cardinality', label: 'Cardinality' },
                  ]}
                  rows={relationshipRows}
                  selectedId={selectedRowId}
                  highlightedId={highlightedRelationshipId}
                  empty="No relationships included yet."
                  onSelectRow={(row) => onSelectRelationship(row.id, row.isConflicting)}
                  onHoverRow={onHoverRelationship}
                />
              ))}

            {activeTab === 'issues' && (
              <div className={styles.issues}>
                {!issues.length && (
                  <p className={styles.empty}>No issues — perspective looks good.</p>
                )}
                {issues.map((issue) => (
                  <button
                    key={issue.id}
                    type="button"
                    className={`${styles.issueCard} ${styles[`issue_${issue.severity}`]}`}
                    onClick={() => onSelectIssue()}
                  >
                    <strong>{issue.title}</strong>
                    <span>{issue.message}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
