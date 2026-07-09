import { useMemo } from 'react';
import {
  eventLinks,
  eventSources,
  objects,
  relationships,
} from '../../../data/mockData';
import { SELECTION_TYPES } from '../../v5/selection/usePerspectiveSelection';
import { getRelationshipMeta } from '../../v1_5/utils/buildV2ViewData';
import { formatObjectEventLinkName, formatRelationshipDisplayName } from '../../../utils/perspectiveRelationships';
import { InspectEmptyState, InventoryTable } from './inspectorTabPanels';
import {
  MetaRows,
  SettingsActionButton,
  SettingsActions,
  TextBlock,
} from '../../v5/inspector/metaPanelParts';
import styles from '../../v5/inspector/RightInspector.module.css';

function objectStatusLabel(included, state) {
  if (included) return 'Included';
  if (state === 'ghost') return 'Suggested';
  return 'Not included';
}

function ObjectSettings({ id, state, progressive, selection, onSelectRelationship, onSelectEvent }) {
  const obj = objects.find((o) => o.id === id);
  const included = progressive.includedObjects.has(id);

  const relatedRels = useMemo(() => {
    const objectName = obj?.name ?? id;

    const objectRelationships = relationships
      .filter(
        (r) =>
          progressive.includedRelationshipIds.has(r.id) &&
          (r.source === id || r.target === id),
      )
      .map((r) => {
        const meta = getRelationshipMeta(r.id);
        const sourceName = objects.find((o) => o.id === r.source)?.name ?? r.source;
        const targetName = objects.find((o) => o.id === r.target)?.name ?? r.target;
        return {
          id: r.id,
          name: formatRelationshipDisplayName(meta.name, sourceName, targetName),
        };
      });

    const eventRelationships = eventLinks
      .filter(
        (link) =>
          link.objectId === id &&
          included &&
          progressive.includedEvents.has(link.eventId),
      )
      .map((link) => {
        const event = eventSources.find((e) => e.id === link.eventId);
        return {
          id: link.eventId,
          name: formatObjectEventLinkName(objectName, event?.name ?? link.eventId),
        };
      });

    return [...objectRelationships, ...eventRelationships].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [id, obj?.name, included, progressive.includedRelationshipIds, progressive.includedEvents]);

  const selectedRowId =
    selection.type === SELECTION_TYPES.EVENT ||
    selection.type === SELECTION_TYPES.RELATIONSHIP ||
    selection.type === SELECTION_TYPES.CYCLE_EDGE
      ? selection.id
      : null;

  if (!obj) return <p className={styles.muted}>Object not found.</p>;

  return (
    <div className={styles.tabContent}>
      <MetaRows
        rows={[
          { label: 'Name', value: obj.name },
          { label: 'Domain', value: obj.domain },
          { label: 'Status', value: objectStatusLabel(included, state) },
        ]}
      />

      <TextBlock title="Description">
        {obj.domain} object in this perspective scope.
      </TextBlock>

      <h3 className={styles.sectionTitle}>Relationships ({relatedRels.length})</h3>
      <InventoryTable
        items={relatedRels}
        selectedId={selectedRowId}
        onSelect={(rowId) => {
          if (progressive.includedEvents.has(rowId)) {
            onSelectEvent(rowId);
            return;
          }
          onSelectRelationship(rowId, false);
        }}
        emptyLabel="No relationships yet"
      />

      <SettingsActions>
        {!included && (
          <SettingsActionButton onClick={() => progressive.addObject(id)}>
            Include object
          </SettingsActionButton>
        )}
        {included && (
          <SettingsActionButton variant="danger" onClick={() => progressive.removeObject(id)}>
            Remove from perspective
          </SettingsActionButton>
        )}
        <SettingsActionButton onClick={() => {}}>Open in context model browser</SettingsActionButton>
      </SettingsActions>
    </div>
  );
}

function EventSettings({ id, state, progressive }) {
  const event = eventSources.find((e) => e.id === id);
  const link = eventLinks.find((l) => l.eventId === id);
  const linkedObject = link
    ? objects.find((o) => o.id === link.objectId)?.name
    : '—';
  const included = progressive.includedEvents.has(id);

  if (!event) return <p className={styles.muted}>Event not found.</p>;

  return (
    <div className={styles.tabContent}>
      <MetaRows
        rows={[
          { label: 'Name', value: event.name },
          { label: 'Attached object', value: linkedObject },
          { label: 'Source', value: event.domain ?? 'Process event log' },
          { label: 'Status', value: objectStatusLabel(included, state) },
        ]}
      />

      <TextBlock title="Description">
        Event source attached to {linkedObject} in this perspective.
      </TextBlock>

      <SettingsActions>
        {!included && (
          <SettingsActionButton onClick={() => progressive.addEvent(id)}>
            Include event
          </SettingsActionButton>
        )}
        {included && (
          <SettingsActionButton variant="danger" onClick={() => progressive.removeEvent(id)}>
            Remove from perspective
          </SettingsActionButton>
        )}
        <SettingsActionButton onClick={() => {}}>Open in context model browser</SettingsActionButton>
      </SettingsActions>
    </div>
  );
}

function RelationshipSettings({
  id,
  progressive,
  isCycle,
  inCycle,
  onPreviewConsequences,
  previewRelationshipId,
}) {
  const rel = relationships.find((r) => r.id === id);
  const meta = getRelationshipMeta(id);
  if (!rel) return <p className={styles.muted}>Relationship not found.</p>;

  const sourceName = objects.find((o) => o.id === rel.source)?.name ?? rel.source;
  const targetName = objects.find((o) => o.id === rel.target)?.name ?? rel.target;

  const rows = [
    {
      label: 'Name',
      value: formatRelationshipDisplayName(meta.name, sourceName, targetName),
    },
    { label: 'Source', value: sourceName },
    { label: 'Target', value: targetName },
    { label: 'Relationship', value: rel.label },
    { label: 'Cardinality', value: meta.cardinality ?? '1:N' },
  ];

  if (isCycle || inCycle) {
    rows.push({
      label: 'Cycle',
      value: 'In loop',
      valueClass: styles.statusWarning,
    });
  }

  return (
    <div className={styles.tabContent}>
      <MetaRows rows={rows} />

      <TextBlock title="Description">{rel.label}</TextBlock>

      <SettingsActions>
        {onPreviewConsequences && progressive.includedRelationshipIds.has(id) && (
          <button
            type="button"
            className={`${styles.consequencePreviewBtn} ${
              previewRelationshipId === id ? styles.consequencePreviewBtnActive : ''
            }`}
            onClick={() => onPreviewConsequences(id)}
          >
            Preview consequences
          </button>
        )}
        {progressive.includedRelationshipIds.has(id) && (
          <SettingsActionButton variant="danger" onClick={() => progressive.pruneRelationship(id)}>
            Remove from perspective
          </SettingsActionButton>
        )}
        <SettingsActionButton onClick={() => {}}>Open in context model browser</SettingsActionButton>
      </SettingsActions>
    </div>
  );
}

export default function InspectTabContent({
  selection,
  progressive,
  cycleResolution,
  onSelectRelationship,
  onSelectEvent,
  onPreviewRelationshipConsequences,
  previewRelationshipId,
}) {
  const selectedRelationshipRow = cycleResolution?.rows?.find((r) => r.id === selection.id);

  if (selection.type === SELECTION_TYPES.CANVAS) {
    return <InspectEmptyState />;
  }

  if (selection.type === SELECTION_TYPES.OBJECT) {
    return (
      <ObjectSettings
        id={selection.id}
        state={selection.state}
        progressive={progressive}
        selection={selection}
        onSelectRelationship={onSelectRelationship}
        onSelectEvent={onSelectEvent}
      />
    );
  }

  if (selection.type === SELECTION_TYPES.EVENT) {
    return (
      <EventSettings id={selection.id} state={selection.state} progressive={progressive} />
    );
  }

  if (selection.type === SELECTION_TYPES.RELATIONSHIP) {
    return (
      <RelationshipSettings
        id={selection.id}
        progressive={progressive}
        isCycle={false}
        inCycle={selectedRelationshipRow?.isConflicting}
        onPreviewConsequences={onPreviewRelationshipConsequences}
        previewRelationshipId={previewRelationshipId}
      />
    );
  }

  if (selection.type === SELECTION_TYPES.CYCLE_EDGE) {
    return (
      <RelationshipSettings
        id={selection.id}
        progressive={progressive}
        isCycle
        inCycle
        onPreviewConsequences={onPreviewRelationshipConsequences}
        previewRelationshipId={previewRelationshipId}
      />
    );
  }

  return <InspectEmptyState />;
}
