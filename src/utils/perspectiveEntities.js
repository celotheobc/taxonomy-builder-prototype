import { eventLinks, eventSources, metricLinks, metrics, objects } from '../data/mockData';

export function buildPerspectiveObjectRows(includedObjects) {
  if (!includedObjects?.size) return [];

  const byId = Object.fromEntries(objects.map((o) => [o.id, o]));

  return [...includedObjects]
    .map((id) => byId[id])
    .filter(Boolean)
    .map((obj) => ({
      id: obj.id,
      name: obj.name,
      domain: obj.domain,
      relationshipCount: obj.relationshipCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildPerspectiveEventSourceRows(includedEvents) {
  if (!includedEvents?.size) return [];

  const eventById = Object.fromEntries(eventSources.map((e) => [e.id, e]));
  const objectNameById = Object.fromEntries(objects.map((o) => [o.id, o.name]));
  const linkByEventId = Object.fromEntries(
    eventLinks.map((link) => [link.eventId, link.objectId]),
  );

  return [...includedEvents]
    .map((eventId) => {
      const event = eventById[eventId];
      if (!event) return null;
      const objectId = linkByEventId[eventId];
      return {
        id: event.id,
        name: event.name,
        domain: event.domain,
        linkedObject: objectId ? (objectNameById[objectId] ?? objectId) : '—',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildPerspectiveMetricRows(includedMetrics) {
  if (!includedMetrics?.size) return [];

  const metricById = Object.fromEntries(metrics.map((m) => [m.id, m]));
  const objectNameById = Object.fromEntries(objects.map((o) => [o.id, o.name]));
  const linkByMetricId = Object.fromEntries(
    metricLinks.map((link) => [link.metricId, link.objectId]),
  );

  return [...includedMetrics]
    .map((metricId) => {
      const metric = metricById[metricId];
      if (!metric) return null;
      const objectId = linkByMetricId[metricId];
      return {
        id: metric.id,
        name: metric.name,
        domain: metric.domain,
        linkedObject: objectId ? (objectNameById[objectId] ?? objectId) : '—',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}
