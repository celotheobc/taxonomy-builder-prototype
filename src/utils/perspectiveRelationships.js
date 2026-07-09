import { objects, relationshipTableMeta } from '../data/mockData';
import { CYCLE_RESOLUTION_COPY } from './cycleResolutionCopy';

function humanizeMetaName(metaName) {
  if (!metaName) return null;
  return metaName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\s+To\s+/g, ' to ');
}

function relationshipDisplayName(sourceName, targetName, metaName) {
  const humanized = humanizeMetaName(metaName);
  if (humanized) return humanized;
  const s = sourceName.replace(/\s+/g, '');
  const t = targetName.replace(/\s+/g, '');
  return `${s} to ${t}`;
}

export function formatObjectEventLinkName(objectName, eventName) {
  return `${objectName} to ${eventName}`;
}

export function formatRelationshipDisplayName(metaName, sourceName, targetName) {
  return relationshipDisplayName(sourceName, targetName, metaName);
}

export function buildPerspectiveRelationshipRows(activeRelationships, includedObjects) {
  if (!includedObjects?.size) return [];

  const nameById = Object.fromEntries(objects.map((o) => [o.id, o.name]));

  return activeRelationships
    .filter(
      (r) => includedObjects.has(r.source) && includedObjects.has(r.target),
    )
    .map((r) => {
      const meta = relationshipTableMeta[r.id] ?? {};
      const sourceName = nameById[r.source] ?? r.source;
      const targetName = nameById[r.target] ?? r.target;
      return {
        id: r.id,
        name: relationshipDisplayName(sourceName, targetName, meta.name),
        source: sourceName,
        target: targetName,
        cardinality: meta.cardinality ?? '1:N',
        join: meta.join ?? `${targetName.replace(/\s+/g, '_')}_ID`,
        type: meta.type ?? 'Type-to-Type',
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildRelationshipTableView(
  activeRelationships,
  includedObjects,
  cycle = {},
) {
  const baseRows = buildPerspectiveRelationshipRows(
    activeRelationships,
    includedObjects,
  );

  if (!cycle.active || cycle.resolved) {
    return { rows: baseRows, alert: null };
  }

  const cycleEdgeIds = cycle.edgeIds ?? new Set();

  const rows = baseRows.map((row) => ({
    ...row,
    isConflicting: cycleEdgeIds.has(row.id),
  }));

  return {
    rows,
    alert: {
      title: CYCLE_RESOLUTION_COPY.title,
      message: CYCLE_RESOLUTION_COPY.message,
      conflictingCount: rows.filter((r) => r.isConflicting).length,
    },
  };
}
