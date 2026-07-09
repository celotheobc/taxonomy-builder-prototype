import { CYCLE_RESOLUTION_COPY } from '../../../utils/cycleResolutionCopy';
import { objects, relationshipTableMeta } from '../../../data/mockData';

export function buildV2Issues(progressive) {
  const issues = [];

  if (progressive.cycleActive && !progressive.isCycleResolved) {
    issues.push({
      id: 'cycle-multiple-paths',
      severity: 'error',
      title: CYCLE_RESOLUTION_COPY.title,
      message: CYCLE_RESOLUTION_COPY.message,
    });
  }

  if (progressive.connectionPrompt?.addedId) {
    const name =
      objects.find((o) => o.id === progressive.connectionPrompt.addedId)?.name ??
      progressive.connectionPrompt.addedId;
    issues.push({
      id: 'disconnected-pending',
      severity: 'warning',
      title: 'Disconnected object pending',
      message: `${name} needs a connection path or can be kept disconnected.`,
    });
  }

  return issues;
}

export function relationshipRowById(rows, id) {
  return rows.find((r) => r.id === id) ?? null;
}

export function getRelationshipMeta(relId) {
  return relationshipTableMeta[relId] ?? {};
}
