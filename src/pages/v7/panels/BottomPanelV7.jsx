import { useMemo } from 'react';
import { agentContextMarkdown } from '../../../data/mockData';
import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import PanelEmptyHint from '../../v5/components/PanelEmptyHint';
import panelTabStyles from '../../v5/components/PanelTabs.module.css';
import styles from '../../v1_5/panels/BottomPanel.module.css';
import v7Styles from './BottomPanelV7.module.css';
import ImpactPreviewPanel from './ImpactPreviewPanel';
import { isBottomInventory } from '../../v6/inventory/inventoryPlacement';

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

const AGENT_CONTEXT_TAB = { id: 'agentContext', label: 'Agent context' };
const CONSEQUENCES_TAB = { id: 'consequences', label: 'Consequences' };

const TABS_SIDE_BASE = [
  { id: 'relationships', label: 'Included Relationships', countKey: 'relationships' },
  { id: 'issues', label: 'Issues', countKey: 'issues' },
];

const TABS_BOTTOM_BASE = [
  { id: 'objects', label: 'Included Object Types', countKey: 'objects' },
  { id: 'eventSources', label: 'Included Event Sources', countKey: 'eventSources' },
  { id: 'relationships', label: 'Included Relationships', countKey: 'relationships' },
  { id: 'issues', label: 'Issues / Problems', countKey: 'issues' },
];

function buildTabs(inventoryPlacement, showConsequencesTab) {
  const base = isBottomInventory(inventoryPlacement) ? TABS_BOTTOM_BASE : TABS_SIDE_BASE;
  const tabs = [...base, AGENT_CONTEXT_TAB];
  if (showConsequencesTab) {
    tabs.push(CONSEQUENCES_TAB);
  }
  return tabs;
}

function tabLabel(tab, tabCounts) {
  if (!tab.countKey) return tab.label;
  return `${tab.label} (${tabCounts[tab.countKey] ?? 0})`;
}

function formatReviewDate(isoDate) {
  try {
    return new Date(isoDate).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

export default function BottomPanelV7({
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
  resolvedDecisions = [],
  impactPreview,
  consequencesPreview = impactPreview,
  onReviewResolvedDecision,
  selection,
  onSelectRelationship,
  onSelectIssue,
  onSelectObject,
  onSelectEvent,
  onHoverRelationship,
  highlightedRelationshipId = null,
  perspectiveEmpty = false,
  inventoryPlacement,
  showConsequencesTab = false,
}) {
  const tabs = useMemo(
    () => buildTabs(inventoryPlacement, showConsequencesTab),
    [inventoryPlacement, showConsequencesTab],
  );

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
                {!issues.length && !resolvedDecisions.length && (
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

                {resolvedDecisions.length > 0 && (
                  <div className={v7Styles.resolvedSection}>
                    <h3 className={v7Styles.resolvedTitle}>Resolved Decisions</h3>
                    <ul className={v7Styles.resolvedList}>
                      {resolvedDecisions.map((decision) => (
                        <li key={decision.id}>
                          <div className={v7Styles.resolvedCard}>
                            <span className={v7Styles.resolvedLabel}>
                              ✓ Removed {decision.label}
                            </span>
                            <span className={v7Styles.resolvedMeta}>
                              Reviewed on {formatReviewDate(decision.reviewedAt)}
                            </span>
                            <button
                              type="button"
                              className={v7Styles.resolvedAction}
                              onClick={() => onReviewResolvedDecision?.(decision.id)}
                            >
                              Review again
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'agentContext' &&
              (perspectiveEmpty ? (
                <PanelEmptyHint
                  variant="perspective"
                  text="Agent context appears once you start building."
                />
              ) : (
                <textarea
                  className={v7Styles.agentEditor}
                  readOnly
                  value={agentContextMarkdown}
                  aria-label="Agent context markdown"
                />
              ))}

            {activeTab === 'consequences' && showConsequencesTab && (
              <div className={v7Styles.impactBody}>
                <ImpactPreviewPanel preview={consequencesPreview ?? impactPreview} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
