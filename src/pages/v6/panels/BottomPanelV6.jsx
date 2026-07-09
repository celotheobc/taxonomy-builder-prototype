import { useMemo } from 'react';
import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import PanelEmptyHint from '../../v5/components/PanelEmptyHint';
import panelTabStyles from '../../v5/components/PanelTabs.module.css';
import styles from '../../v1_5/panels/BottomPanel.module.css';
import { isBottomInventory } from '../inventory/inventoryPlacement';

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

const TABS_SIDE = [
  { id: 'relationships', label: 'Includes Relationships', countKey: 'relationships' },
  { id: 'issues', label: 'Issues / Problems', countKey: 'issues' },
];

const TABS_BOTTOM = [
  { id: 'objects', label: 'Includes Object Types', countKey: 'objects' },
  { id: 'eventSources', label: 'Includes Event Sources', countKey: 'eventSources' },
  { id: 'relationships', label: 'Includes Relationships', countKey: 'relationships' },
  { id: 'issues', label: 'Issues / Problems', countKey: 'issues' },
];

function tabLabel(tab, tabCounts) {
  if (!tab.countKey) return tab.label;
  return `${tab.label} (${tabCounts[tab.countKey] ?? 0})`;
}

export default function BottomPanelV6({
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
  onSelectIssue,
  onSelectObject,
  onSelectEvent,
  onHoverRelationship,
  highlightedRelationshipId = null,
  perspectiveEmpty = false,
  inventoryPlacement,
}) {
  const tabs = isBottomInventory(inventoryPlacement) ? TABS_BOTTOM : TABS_SIDE;

  const selectedRelationshipId =
    selection?.type === 'relationship' || selection?.type === 'cycleEdge'
      ? selection.id
      : null;
  const selectedObjectId = selection?.type === 'object' ? selection.id : null;
  const selectedEventId = selection?.type === 'event' ? selection.id : null;

  const objectTableRows = useMemo(
    () =>
      objectRows.map((row) => ({
        id: row.id,
        object: row.name,
        domain: row.domain,
        status: 'Included',
      })),
    [objectRows],
  );

  const eventTableRows = useMemo(
    () =>
      eventRows.map((row) => ({
        id: row.id,
        eventSource: row.name,
        type: row.domain,
        status: 'Included',
      })),
    [eventRows],
  );

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
            {tabs.map((tab) => (
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
            {activeTab === 'objects' &&
              (perspectiveEmpty ? (
                <PanelEmptyHint
                  variant="perspective"
                  text="Objects appear once you start building."
                />
              ) : (
                <DataTable
                  columns={[
                    { key: 'object', label: 'Object' },
                    { key: 'domain', label: 'Domain' },
                    { key: 'status', label: 'Status' },
                  ]}
                  rows={objectTableRows}
                  selectedId={selectedObjectId}
                  empty="No objects included yet."
                  onSelectRow={(row) => onSelectObject(row.id)}
                />
              ))}

            {activeTab === 'eventSources' &&
              (perspectiveEmpty ? (
                <PanelEmptyHint
                  variant="perspective"
                  text="Event sources appear once you start building."
                />
              ) : (
                <DataTable
                  columns={[
                    { key: 'eventSource', label: 'Event Source' },
                    { key: 'type', label: 'Type' },
                    { key: 'status', label: 'Status' },
                  ]}
                  rows={eventTableRows}
                  selectedId={selectedEventId}
                  empty="No event sources included yet."
                  onSelectRow={(row) => onSelectEvent(row.id)}
                />
              ))}

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
                  selectedId={selectedRelationshipId}
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
