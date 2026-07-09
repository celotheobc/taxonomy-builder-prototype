import { eventLinks, metricLinks, objects } from '../data/mockData';
import { filterDemoGhostNeighbourIds } from '../data/demoScenario';
import { getNeighbours } from '../data/graphLayout';

/** Direct neighbours only — keeps the graph sparse */
export function getSuggestedObjectNeighbours(
  anchorId,
  includedObjects,
  relationshipList,
  { cycleResolved = true } = {},
) {
  if (!anchorId) return new Set();
  const suggested = new Set();
  getNeighbours(anchorId, relationshipList).forEach((id) => {
    if (!includedObjects.has(id)) {
      const meta = objects.find((o) => o.id === id);
      if (!meta?.insertOnly && !meta?.hiddenFromDiscovery) {
        suggested.add(id);
      }
    }
  });
  const filtered = filterDemoGhostNeighbourIds([...suggested], includedObjects, {
    cycleResolved,
  });
  return new Set(filtered);
}

/** Union of direct neighbours for every included object (v3 canvas-unfocused mode). */
export function getAllSuggestedObjectNeighbours(
  includedObjects,
  relationshipList,
  { cycleResolved = true } = {},
) {
  const suggested = new Set();
  for (const anchorId of includedObjects) {
    getSuggestedObjectNeighbours(anchorId, includedObjects, relationshipList, {
      cycleResolved,
    }).forEach((id) => suggested.add(id));
  }
  return suggested;
}

export function getDiscoveryCountsForObject(
  objectId,
  { includedObjects, includedEvents, includedMetrics, relationshipList, cycleResolved = true },
) {
  const objectIds = [
    ...getSuggestedObjectNeighbours(objectId, includedObjects, relationshipList, {
      cycleResolved,
    }),
  ];
  const eventIds = eventLinks
    .filter((l) => l.objectId === objectId && !includedEvents.has(l.eventId))
    .map((l) => l.eventId);
  const metricIds = metricLinks
    .filter((l) => l.objectId === objectId && !includedMetrics.has(l.metricId))
    .map((l) => l.metricId);

  return {
    objects: objectIds.length,
    events: eventIds.length,
    metrics: metricIds.length,
    objectIds: new Set(objectIds),
    eventIds: new Set(eventIds),
    metricIds: new Set(metricIds),
  };
}
