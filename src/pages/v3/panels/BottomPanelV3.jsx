import { agentContextMarkdown } from '../../../data/mockData';
import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import styles from '../../v1_5/panels/BottomPanel.module.css';

function DataTable({ columns, rows, selectedId, onSelectRow, onHoverRow, empty }) {
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
              className={selectedId === row.id ? styles.rowSelected : undefined}
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
  { id: 'objects', label: 'Included Objects', countKey: 'objects' },
  { id: 'relationships', label: 'Included Relationships', countKey: 'relationships' },
  { id: 'events', label: 'Included Event Sources', countKey: 'events' },
  { id: 'issues', label: 'Issues', countKey: 'issues' },
  { id: 'agent', label: 'Agent Context' },
];

function tabLabel(tab, tabCounts) {
  if (!tab.countKey) return tab.label;
  return `${tab.label} (${tabCounts[tab.countKey] ?? 0})`;
}

export default function BottomPanelV3({
  activeTab,
  onTabChange,
  collapsed,
  onToggle,
  height = 220,
  onResizeHeight,
  tabCounts,
  relationshipRows,
  objectRows,
  eventRows,
  issues,
  selection,
  onSelectRelationship,
  onSelectObject,
  onSelectEvent,
  onSelectIssue,
}) {
  const selectedRowId =
    selection?.type === 'relationship' || selection?.type === 'cycleEdge'
      ? selection.id
      : selection?.type === 'object'
        ? selection.id
        : selection?.type === 'event'
          ? selection.id
          : null;

  return (
    <section
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}
      style={{ height: collapsed ? 40 : height }}
      aria-label="Perspective inventory"
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
          <div className={styles.tabs} role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? styles.tabActive : styles.tab}
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
            {activeTab === 'objects' && (
              <DataTable
                columns={[
                  { key: 'name', label: 'Name' },
                  { key: 'domain', label: 'Domain' },
                  { key: 'inPerspectiveRelationships', label: 'Relationships' },
                ]}
                rows={objectRows}
                selectedId={selectedRowId}
                empty="No objects included yet."
                onSelectRow={(row) => onSelectObject(row.id)}
              />
            )}

            {activeTab === 'relationships' && (
              <DataTable
                columns={[
                  { key: 'name', label: 'Name' },
                  { key: 'source', label: 'Source' },
                  { key: 'target', label: 'Target' },
                  { key: 'cardinality', label: 'Cardinality' },
                ]}
                rows={relationshipRows}
                selectedId={selectedRowId}
                empty="No relationships included yet — add objects on the graph."
                onSelectRow={(row) => onSelectRelationship(row.id, false)}
              />
            )}

            {activeTab === 'events' && (
              <DataTable
                columns={[
                  { key: 'name', label: 'Name' },
                  { key: 'domain', label: 'Domain' },
                  { key: 'linkedObject', label: 'Linked object' },
                ]}
                rows={eventRows}
                selectedId={selectedRowId}
                empty="No event sources included yet."
                onSelectRow={(row) => onSelectEvent(row.id)}
              />
            )}

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

            {activeTab === 'agent' && (
              <textarea
                className={styles.agentEditor}
                readOnly
                value={agentContextMarkdown}
                aria-label="Agent context markdown"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
