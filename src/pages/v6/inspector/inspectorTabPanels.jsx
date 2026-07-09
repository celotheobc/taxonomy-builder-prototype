import {
  agentContextMarkdown,
  assetMetadata,
  perspectiveOverviewDependencies,
} from '../../../data/mockData';
import { MetaRows, TextBlock } from '../../v5/inspector/metaPanelParts';
import { CacheTab, InventoryTable } from '../../v5/inspector/inspectorTabPanels';
import { isSideInventory } from '../inventory/inventoryPlacement';
import styles from '../../v5/inspector/RightInspector.module.css';
import summaryStyles from './inspectorTabPanels.module.css';

export { CacheTab, InventoryTable };

const DESCRIPTION =
  'Order-to-Cash semantic scope. Build on the graph — relationships, issues, and AI context live in the panel below.';

const INVENTORY_ICON_COLORS = {
  object: '#1b6fd1',
  event: '#2db87a',
  relationship: '#8b5cf6',
};

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

function InventoryListIcon({ color }) {
  return (
    <span
      className={summaryStyles.dependencyIcon}
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

function IncludesListSection({
  title,
  items,
  iconColor,
  selectedId,
  onSelect,
  emptyLabel,
}) {
  return (
    <section className={styles.inventorySection}>
      <h3 className={styles.inventorySectionTitle}>{title}</h3>
      <div className={styles.inventoryTableWrap}>
        {!items.length ? (
          <p className={summaryStyles.listEmpty}>{emptyLabel}</p>
        ) : (
          <ul className={styles.inventoryList}>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`${summaryStyles.listRow} ${
                    selectedId === item.id ? summaryStyles.listRowSelected : ''
                  }`}
                  onClick={() => onSelect?.(item.id)}
                >
                  <InventoryListIcon color={iconColor} />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function DependencySquareIcon({ color }) {
  return (
    <span
      className={summaryStyles.dependencyIcon}
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

function DependencySection({ title, items }) {
  return (
    <section className={styles.inventorySection}>
      <h3 className={styles.inventorySectionTitle}>{title}</h3>
      <div className={styles.inventoryTableWrap}>
        <ul className={styles.inventoryList}>
          {items.map((item) => (
            <li key={item.id} className={summaryStyles.listRowStatic}>
              <DependencySquareIcon color={item.iconColor} />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const PERSPECTIVE_CONTAINS_ITEMS = [
  {
    tabId: 'objects',
    label: 'Object Types',
    countKey: 'objectCount',
    iconColor: INVENTORY_ICON_COLORS.object,
  },
  {
    tabId: 'eventSources',
    label: 'Event Sources',
    countKey: 'eventCount',
    iconColor: INVENTORY_ICON_COLORS.event,
  },
  {
    tabId: 'relationships',
    label: 'Relationships',
    countKey: 'relationshipCount',
    iconColor: INVENTORY_ICON_COLORS.relationship,
  },
];

function PerspectiveContainsSection({
  objectCount,
  eventCount,
  relationshipCount,
  onFocusBottomTab,
}) {
  const counts = { objectCount, eventCount, relationshipCount };

  return (
    <section className={styles.inventorySection}>
      <h3 className={styles.inventorySectionTitle}>Perspective contains</h3>
      <div className={styles.inventoryTableWrap}>
        <ul className={styles.inventoryList}>
          {PERSPECTIVE_CONTAINS_ITEMS.map((item) => (
            <li key={item.tabId}>
              <button
                type="button"
                className={summaryStyles.listRow}
                onClick={() => onFocusBottomTab?.(item.tabId)}
              >
                <InventoryListIcon color={item.iconColor} />
                <span>
                  {item.label} ({counts[item.countKey]})
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function OverviewTab({
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
  inventoryPlacement,
  relationshipCount,
  onFocusBottomTab,
  hideAgentContext = false,
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
    // validationRow(hasStarted, validationStatus),
    { label: 'Created By', value: assetMetadata.createdBy },
    { label: 'Last updated by', value: assetMetadata.lastUpdatedBy },
  ];

  if (associatedProcess) {
    metaRows.push({ label: 'Associated process', value: associatedProcess });
  }

  const agentExcerpt = agentContextMarkdown.split('\n\n')[1] ?? agentContextMarkdown;
  const showSideInventory = isSideInventory(inventoryPlacement);

  return (
    <div className={styles.tabContent}>
      <MetaRows rows={metaRows} />

      <TextBlock title="Description" empty={!hasStarted}>
        {DESCRIPTION}
      </TextBlock>

      {!hideAgentContext && (
        <TextBlock title="Agent context" empty={!hasStarted}>
          {agentExcerpt}
        </TextBlock>
      )}

      {showSideInventory ? (
        <>
          <IncludesListSection
            title={`Included Object Types (${objectRows.length})`}
            iconColor={INVENTORY_ICON_COLORS.object}
            items={objectRows}
            selectedId={selectedObjectId}
            onSelect={onSelectObject}
            emptyLabel="None included yet"
          />

          <IncludesListSection
            title={`Included Event Sources (${eventRows.length})`}
            iconColor={INVENTORY_ICON_COLORS.event}
            items={eventRows}
            selectedId={selectedEventId}
            onSelect={onSelectEvent}
            emptyLabel="None included yet"
          />
        </>
      ) : (
        <PerspectiveContainsSection
          objectCount={objectRows.length}
          eventCount={eventRows.length}
          relationshipCount={relationshipCount}
          onFocusBottomTab={onFocusBottomTab}
        />
      )}

      <hr className={summaryStyles.dependencyDivider} />

      <DependencySection
        title="Part of"
        items={perspectiveOverviewDependencies.partOf}
      />

      <DependencySection
        title="Used by"
        items={perspectiveOverviewDependencies.usedBy}
      />
    </div>
  );
}

export function InspectEmptyState() {
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
        Select an element on the canvas to inspect it.
      </p>
    </div>
  );
}

export const INSPECTOR_TABS = [
  { id: 'inspect', label: 'Inspect' },
  { id: 'overview', label: 'Overview' },
  { id: 'cache', label: 'Cache' },
];
