import { useMemo, useState } from 'react';
import {
  assetMetadata,
  eventLinks,
  eventSources,
  metricLinks,
  metrics,
  objects,
  relationships,
} from '../../../data/mockData';
import { getRelationshipPrunePreview } from '../../../data/cycleDetection';
import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import CycleResolutionInspector from '../../v1_5/inspector/CycleResolutionInspector';
import DisconnectedConnectionPanel from '../../../components/configuration/DisconnectedConnectionPanel';
import { SELECTION_TYPES } from '../../v1_5/selection/usePerspectiveSelection';
import { getRelationshipMeta } from '../../v1_5/utils/buildV2ViewData';
import {
  InspectorActions,
  InspectorButton,
  InspectorRow,
  InspectorSection,
} from '../../v1_5/inspector/inspectorParts';
import styles from '../../v1_5/inspector/inspector.module.css';

function statusClass(status) {
  if (status === 'Valid') return styles.statusValid;
  if (status === 'Needs resolution') return styles.statusWarning;
  return styles.statusIncomplete;
}

function CanvasInspector({ progressive, validationStatus }) {
  const [cacheOn, setCacheOn] = useState(true);
  const [lastRefreshed] = useState('12 Mar 2026, 09:42');

  return (
    <>
      <InspectorSection>
        <InspectorRow label="Name">{assetMetadata.title}</InspectorRow>
        <InspectorRow label="Status">{assetMetadata.status}</InspectorRow>
        <InspectorRow label="Validation">
          {!progressive.hasStarted ? (
            <span className={styles.statusIncomplete}>Not started</span>
          ) : (
            <span className={statusClass(validationStatus)}>{validationStatus}</span>
          )}
        </InspectorRow>
        <p className={styles.note}>
          Order-to-Cash semantic scope. Build on the graph — included items appear in the
          panel below.
        </p>
      </InspectorSection>

      <InspectorSection title="Cache">
        <label className={styles.switchRow}>
          <span>Enable cache</span>
          <input
            type="checkbox"
            className={styles.switchInput}
            checked={cacheOn}
            onChange={(e) => setCacheOn(e.target.checked)}
            aria-label="Enable cache"
          />
          <span className={styles.switchTrack} aria-hidden />
        </label>
        <InspectorRow label="Status">
          <span className={styles.statusValid}>{cacheOn ? 'Up to date' : 'Disabled'}</span>
        </InspectorRow>
        <InspectorRow label="Last refreshed">{lastRefreshed}</InspectorRow>
      </InspectorSection>

      {/* v2 "Included counts" and "Included (compact)" removed — see bottom inventory panel */}
    </>
  );
}

function NavigableRelationshipList({ items, onSelect }) {
  if (!items.length) {
    return <p className={styles.muted}>No included relationships yet</p>;
  }

  return (
    <ul className={styles.relList}>
      {items.map((item) => (
        <li key={item.id}>
          <button type="button" className={styles.relLink} onClick={() => onSelect(item.id)}>
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

function OpenInGraphButton() {
  return (
    <InspectorButton onClick={() => {}}>
      Open in graph
    </InspectorButton>
  );
}

function ObjectInspector({ id, state, progressive, onSelectRelationship }) {
  const obj = objects.find((o) => o.id === id);
  const included = progressive.includedObjects.has(id);

  const relatedRels = useMemo(
    () =>
      relationships
        .filter(
          (r) =>
            progressive.includedRelationshipIds.has(r.id) &&
            (r.source === id || r.target === id),
        )
        .map((r) => {
          const other =
            r.source === id
              ? objects.find((o) => o.id === r.target)?.name
              : objects.find((o) => o.id === r.source)?.name;
          return { id: r.id, label: `${other} · ${r.label}` };
        }),
    [id, progressive.includedRelationshipIds],
  );

  if (!obj) return <p className={styles.muted}>Object not found.</p>;

  return (
    <>
      <InspectorSection>
        <InspectorRow label="Name">{obj.name}</InspectorRow>
        <InspectorRow label="Status">
          {included ? 'Included' : state === 'ghost' ? 'Suggested' : 'Not included'}
        </InspectorRow>
        {included && (
          <p className={styles.note}>
            Suggestions on the graph show what you can add next from here.
          </p>
        )}
      </InspectorSection>

      <InspectorSection title="Included relationships">
        <NavigableRelationshipList
          items={relatedRels}
          onSelect={(relId) => onSelectRelationship(relId, false)}
        />
      </InspectorSection>

      {/* Domain, "Available to add", and "Set expansion hub" removed — graph is the editor */}

      <InspectorActions>
        {!included && (
          <InspectorButton onClick={() => progressive.addObject(id)}>
            Include object
          </InspectorButton>
        )}
        {included && (
          <InspectorButton variant="danger" onClick={() => progressive.removeObject(id)}>
            Remove from perspective
          </InspectorButton>
        )}
        <OpenInGraphButton />
      </InspectorActions>
    </>
  );
}

function EventInspector({ id, state, progressive }) {
  const event = eventSources.find((e) => e.id === id);
  const link = eventLinks.find((l) => l.eventId === id);
  const linkedObject = link
    ? objects.find((o) => o.id === link.objectId)?.name
    : '—';
  const included = progressive.includedEvents.has(id);

  if (!event) return <p className={styles.muted}>Event not found.</p>;

  return (
    <>
      <InspectorSection title="Event source">
        <InspectorRow label="Name">{event.name}</InspectorRow>
        <InspectorRow label="Linked object">{linkedObject}</InspectorRow>
        <InspectorRow label="Status">
          {included ? 'Included' : state === 'ghost' ? 'Suggested' : 'Not included'}
        </InspectorRow>
      </InspectorSection>
      <InspectorActions>
        {!included && (
          <InspectorButton onClick={() => progressive.addEvent(id)}>Include event</InspectorButton>
        )}
        {included && (
          <InspectorButton variant="danger" onClick={() => progressive.removeEvent(id)}>
            Remove event
          </InspectorButton>
        )}
        <OpenInGraphButton />
      </InspectorActions>
    </>
  );
}

function MetricInspector({ id, state, progressive }) {
  const metric = metrics.find((m) => m.id === id);
  const link = metricLinks.find((l) => l.metricId === id);
  const linkedObject = link
    ? objects.find((o) => o.id === link.objectId)?.name
    : '—';
  const included = progressive.includedMetrics.has(id);

  if (!metric) return <p className={styles.muted}>Metric not found.</p>;

  return (
    <>
      <InspectorSection title="Metric">
        <InspectorRow label="Name">{metric.name}</InspectorRow>
        <InspectorRow label="Linked object">{linkedObject}</InspectorRow>
        <InspectorRow label="Status">
          {included ? 'Included' : state === 'ghost' ? 'Suggested' : 'Not included'}
        </InspectorRow>
      </InspectorSection>
      <InspectorActions>
        {!included && (
          <InspectorButton onClick={() => progressive.addMetric(id)}>Include metric</InspectorButton>
        )}
        {included && (
          <InspectorButton variant="danger" onClick={() => progressive.removeMetric(id)}>
            Remove metric
          </InspectorButton>
        )}
      </InspectorActions>
    </>
  );
}

function RelationshipInspector({ id, progressive, isCycle }) {
  const rel = relationships.find((r) => r.id === id);
  const meta = getRelationshipMeta(id);
  const preview = getRelationshipPrunePreview(id);
  if (!rel) return <p className={styles.muted}>Relationship not found.</p>;

  const sourceName = objects.find((o) => o.id === rel.source)?.name ?? rel.source;
  const targetName = objects.find((o) => o.id === rel.target)?.name ?? rel.target;

  return (
    <>
      <InspectorSection title={isCycle ? 'Resolve cycle' : 'Relationship'}>
        <InspectorRow label="Name">{meta.name ?? rel.id}</InspectorRow>
        <InspectorRow label="Source">{sourceName}</InspectorRow>
        <InspectorRow label="Target">{targetName}</InspectorRow>
        <InspectorRow label="Cardinality">{meta.cardinality ?? '1:N'}</InspectorRow>
        {isCycle && (
          <p className={styles.note}>
            This relationship is part of a loop. Removing this single edge resolves the
            cycle.
          </p>
        )}
        {preview && isCycle && <p className={styles.note}>{preview.detail}</p>}
      </InspectorSection>
      <InspectorActions>
        {progressive.includedRelationshipIds.has(id) && (
          <InspectorButton variant="danger" onClick={() => progressive.pruneRelationship(id)}>
            Remove from perspective
          </InspectorButton>
        )}
      </InspectorActions>
    </>
  );
}

const TITLES = {
  [SELECTION_TYPES.CANVAS]: 'Perspective',
  [SELECTION_TYPES.OBJECT]: 'Object',
  [SELECTION_TYPES.EVENT]: 'Event source',
  [SELECTION_TYPES.METRIC]: 'Metric',
  [SELECTION_TYPES.RELATIONSHIP]: 'Relationship',
  [SELECTION_TYPES.CYCLE_EDGE]: 'Resolve cycle',
  resolveCycle: 'Resolve cycle',
  connectObject: 'Connect object',
};

export default function RightInspector({
  selection,
  progressive,
  validationStatus,
  collapsed,
  onToggle,
  width = 300,
  onResizeWidth,
  cycleResolution = null,
  onHighlightRelationship,
  onSelectRelationship,
}) {
  const inResolutionMode = Boolean(
    cycleResolution?.active && !cycleResolution?.resolved,
  );
  const inConnectionMode = Boolean(progressive.connectionPrompt);
  const forceResolutionPanel =
    inResolutionMode && selection.type !== SELECTION_TYPES.CYCLE_EDGE;
  const forceConnectionPanel =
    inConnectionMode && !forceResolutionPanel;

  const title = forceResolutionPanel
    ? TITLES.resolveCycle
    : forceConnectionPanel
      ? TITLES.connectObject
      : TITLES[selection.type] ?? 'Inspector';

  return (
    <aside
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}
      style={{ width: collapsed ? 40 : width }}
      aria-label="Contextual inspector"
    >
      {!collapsed && onResizeWidth && (
        <ResizeHandle
          axis="x"
          onDelta={onResizeWidth}
          ariaLabel="Resize inspector width"
        />
      )}
      <div className={styles.panel}>
        <header className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{title}</h2>
          <button type="button" className={styles.collapseBtn} onClick={onToggle}>
            {collapsed ? '◂' : '▸'}
          </button>
        </header>
        {!collapsed && (
          <div className={styles.panelBody}>
            {forceResolutionPanel ? (
              <CycleResolutionInspector
                rows={cycleResolution.rows}
                alert={cycleResolution.alert}
                highlightedRelationshipId={cycleResolution.highlightedRelationshipId}
                onHighlightRelationship={onHighlightRelationship}
                onSelectRelationship={onSelectRelationship}
                onRemoveRelationship={progressive.pruneRelationship}
              />
            ) : forceConnectionPanel ? (
              <DisconnectedConnectionPanel
                prompt={progressive.connectionPrompt}
                includedObjects={progressive.includedObjects}
                previewPathId={progressive.previewBridgePathId}
                onPreviewPath={progressive.previewConnectionPath}
                onClearPreview={progressive.clearConnectionPathPreview}
                onInsertPath={progressive.insertConnectionPath}
                onKeepUnconnected={progressive.keepObjectsUnconnected}
              />
            ) : (
              <>
                {selection.type === SELECTION_TYPES.CANVAS && (
                  <CanvasInspector
                    progressive={progressive}
                    validationStatus={validationStatus}
                  />
                )}
                {selection.type === SELECTION_TYPES.OBJECT && (
                  <ObjectInspector
                    id={selection.id}
                    state={selection.state}
                    progressive={progressive}
                    onSelectRelationship={onSelectRelationship}
                  />
                )}
                {selection.type === SELECTION_TYPES.EVENT && (
                  <EventInspector
                    id={selection.id}
                    state={selection.state}
                    progressive={progressive}
                  />
                )}
                {selection.type === SELECTION_TYPES.METRIC && (
                  <MetricInspector
                    id={selection.id}
                    state={selection.state}
                    progressive={progressive}
                  />
                )}
                {(selection.type === SELECTION_TYPES.RELATIONSHIP ||
                  selection.type === SELECTION_TYPES.CYCLE_EDGE) && (
                  <RelationshipInspector
                    id={selection.id}
                    progressive={progressive}
                    isCycle={selection.type === SELECTION_TYPES.CYCLE_EDGE}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
