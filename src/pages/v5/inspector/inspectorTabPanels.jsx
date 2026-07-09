import { useState } from 'react';
import { agentContextMarkdown, assetMetadata } from '../../../data/mockData';
import { MetaRows, TextBlock } from './metaPanelParts';
import { EventSourceIcon, ObjectTypeIcon } from './inventorySectionIcons';
import styles from './RightInspector.module.css';

const VISIBLE_ROWS = 4;

const RECENT_EXECUTIONS = [
  { id: '1', at: '2026-06-28 14:32:18', status: 'success' },
  { id: '2', at: '2026-06-27 09:15:42', status: 'success' },
  { id: '3', at: '2026-06-26 18:04:09', status: 'failed' },
  { id: '4', at: '2026-06-25 11:28:55', status: 'success' },
];

const DESCRIPTION =
  'Order-to-Cash semantic scope. Build on the graph — relationships, issues, and AI context live in the panel below.';

function statusClass(status) {
  if (status === 'Valid') return styles.statusValid;
  if (status === 'Needs resolution') return styles.statusWarning;
  return styles.statusIncomplete;
}

function validationRow(hasStarted, validationStatus) {
  if (!hasStarted) {
    return { label: 'Validation', value: 'Not started', valueClass: styles.statusIncomplete };
  }
  return {
    label: 'Validation',
    value: validationStatus,
    valueClass: statusClass(validationStatus),
  };
}

export function InventoryTable({ items, selectedId, onSelect, emptyLabel }) {
  const [expanded, setExpanded] = useState(false);
  const hasOverflow = items.length > VISIBLE_ROWS;
  const visible = expanded || !hasOverflow ? items : items.slice(0, VISIBLE_ROWS);

  if (!items.length) {
    return <p className={styles.inventoryEmpty}>{emptyLabel}</p>;
  }

  return (
    <>
      <div className={styles.inventoryTableWrap}>
        <ul className={styles.inventoryList}>
          {visible.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`${styles.inventoryItem} ${
                  selectedId === item.id ? styles.inventoryItemActive : ''
                }`}
                onClick={() => onSelect(item.id)}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {hasOverflow && (
        <button
          type="button"
          className={styles.showMoreBtn}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show less' : 'Show all'}
        </button>
      )}
    </>
  );
}

function InventorySection({ title, icon, items, selectedId, onSelect, emptyLabel }) {
  return (
    <section className={styles.inventorySection}>
      <div className={styles.inventorySectionHeader}>
        <span className={styles.inventorySectionIcon} aria-hidden>
          {icon}
        </span>
        <h3 className={styles.inventorySectionTitle}>{title}</h3>
      </div>
      <InventoryTable
        items={items}
        selectedId={selectedId}
        onSelect={onSelect}
        emptyLabel={emptyLabel}
      />
    </section>
  );
}

export function MetadataTab({
  progressive,
  validationStatus,
  perspectiveName,
  objectRows,
  eventRows,
  sourceProcessId,
  processLabels,
  selectedObjectId,
  selectedEventId,
  onSelectObject,
  onSelectEvent,
}) {
  const hasStarted = progressive.hasStarted;
  const associatedProcess = sourceProcessId
    ? processLabels[sourceProcessId] ?? sourceProcessId
    : null;

  const metaRows = [
    { label: 'Asset name', value: perspectiveName || 'New Perspective' },
    {
      label: 'Status',
      value: assetMetadata.status,
      valueClass: styles.statusDot,
    },
    { label: 'Type', value: assetMetadata.type },
    { label: 'Reference Key', value: assetMetadata.referenceKey },
    validationRow(hasStarted, validationStatus),
    { label: 'Created By', value: assetMetadata.createdBy },
    { label: 'Last updated by', value: assetMetadata.lastUpdatedBy },
  ];

  if (associatedProcess) {
    metaRows.push({ label: 'Associated process', value: associatedProcess });
  }

  const agentExcerpt = agentContextMarkdown.split('\n\n')[1] ?? agentContextMarkdown;

  return (
    <div className={styles.tabContent}>
      <MetaRows rows={metaRows} />

      <TextBlock title="Description" empty={!hasStarted}>
        {DESCRIPTION}
      </TextBlock>

      <TextBlock title="Agent context" empty={!hasStarted}>
        {agentExcerpt}
      </TextBlock>

      <InventorySection
        title={`Included Objects (${objectRows.length})`}
        icon={<ObjectTypeIcon />}
        items={objectRows}
        selectedId={selectedObjectId}
        onSelect={onSelectObject}
        emptyLabel="None included yet"
      />

      <InventorySection
        title={`Included Event Sources (${eventRows.length})`}
        icon={
          <span className={styles.inventorySectionIconEvent}>
            <EventSourceIcon />
          </span>
        }
        items={eventRows}
        selectedId={selectedEventId}
        onSelect={onSelectEvent}
        emptyLabel="None included yet"
      />
    </div>
  );
}

export function CacheTab() {
  const [lastUpdated, setLastUpdated] = useState('2026-06-28 14:32:18');
  const [executionsOpen, setExecutionsOpen] = useState(true);

  return (
    <div className={styles.tabContent}>
      <ul className={styles.metaRows}>
        <li className={styles.metaRow}>
          <span className={styles.metaLabel}>Status</span>
          <span className={`${styles.metaValue} ${styles.cacheStatus}`}>Available</span>
        </li>
        <li className={styles.metaRow}>
          <span className={styles.metaLabel}>Last updated</span>
          <span className={styles.metaValue}>{lastUpdated}</span>
        </li>
      </ul>

      <button
        type="button"
        className={styles.cacheRefresh}
        onClick={() => setLastUpdated(new Date().toISOString().slice(0, 19).replace('T', ' '))}
      >
        Refresh Cache
      </button>

      <div className={styles.accordion}>
        <button
          type="button"
          className={styles.accordionHeader}
          onClick={() => setExecutionsOpen((v) => !v)}
          aria-expanded={executionsOpen}
        >
          Recent executions
          <span className={styles.accordionChevron} aria-hidden>
            {executionsOpen ? '▾' : '▸'}
          </span>
        </button>
        {executionsOpen && (
          <ul className={styles.executionList}>
            {RECENT_EXECUTIONS.map((run) => (
              <li key={run.id} className={styles.executionItem}>
                <span>{run.at}</span>
                <span
                  className={
                    run.status === 'success'
                      ? styles.executionBadgeSuccess
                      : styles.executionBadgeFailed
                  }
                >
                  {run.status === 'success' ? '✓ Success' : '✕ Failed'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className={styles.executionLogsLink}>
        Show all execution logs
      </button>
    </div>
  );
}

export function SettingsEmptyState() {
  return (
    <div className={styles.settingsEmpty}>
      <svg
        className={styles.settingsEmptyIcon}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M4 4l7.07 16.97 2.51-7.39 7.39-2.51L4 4z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M13 13l6 6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
      <p className={styles.settingsEmptyText}>
        Select an element on the canvas to see its settings.
      </p>
    </div>
  );
}

export const INSPECTOR_TABS = [
  { id: 'settings', label: 'Settings' },
  { id: 'metadata', label: 'Metadata' },
  { id: 'cache', label: 'Cache' },
];
