import { eventSources, metrics, NODE_KINDS } from '../data/mockData';
import { inspectorNodeDataFlags } from './graphInspectorSelection';

export function appendDiscoveryEventNodes(nodes, nodeIds, edges, ctx) {
  if (!ctx.showDiscoverEvents) return;
  if (ctx.unifiedSuggestions && ctx.showOnlyIncluded) return;

  for (const link of ctx.eventLinks ?? []) {
    if (!ctx.includedObjects?.has(link.objectId)) continue;
    const eventId = link.eventId;
    const nodeId = `event-${eventId}`;
    const included = ctx.includedEvents?.has(eventId);
    const addable = ctx.addableEvents?.has(eventId);
    if (included || !addable) continue;

    const ev = eventSources.find((e) => e.id === eventId);
    if (!ev) continue;

    if (!nodes.find((n) => n.id === nodeId)) {
      nodes.push({
        id: nodeId,
        type: 'perspective',
        position: { x: 0, y: 0 },
        data: {
          label: ev.name,
          kind: NODE_KINDS.EVENT_SOURCE,
          state: included ? 'included' : 'ghost',
          showPlus: addable,
          onPlusClick: () => ctx.onAddEvent?.(eventId),
          ...inspectorNodeDataFlags(nodeId, NODE_KINDS.EVENT_SOURCE, ctx),
        },
      });
      nodeIds.add(nodeId);
    }

    edges.push({
      id: link.id,
      source: nodeId,
      target: link.objectId,
      type: 'route',
      data: {
        included,
        potential: !included,
        isMetricLink: false,
        isDiscoveryLink: true,
      },
    });
  }
}

export function appendDiscoveryMetricNodes(nodes, nodeIds, edges, ctx) {
  if (!ctx.showDiscoverMetrics) return;
  if (ctx.unifiedSuggestions && ctx.showOnlyIncluded) return;

  for (const link of ctx.metricLinks ?? []) {
    if (!ctx.includedObjects?.has(link.objectId)) continue;
    const metricId = link.metricId;
    const nodeId = `metric-${metricId}`;
    const included = ctx.includedMetrics?.has(metricId);
    const addable = ctx.addableMetrics?.has(metricId);
    if (included || !addable) continue;

    const met = metrics.find((m) => m.id === metricId);
    if (!met) continue;

    if (!nodes.find((n) => n.id === nodeId)) {
      nodes.push({
        id: nodeId,
        type: 'perspective',
        position: { x: 0, y: 0 },
        data: {
          label: met.name,
          kind: NODE_KINDS.METRIC,
          state: included ? 'included' : 'ghost',
          compact: true,
          showPlus: addable,
          onPlusClick: () => ctx.onAddMetric?.(metricId),
        },
      });
      nodeIds.add(nodeId);
    }

    edges.push({
      id: link.id,
      source: nodeId,
      target: link.objectId,
      type: 'route',
      data: {
        included,
        potential: !included,
        isMetricLink: true,
        isDiscoveryLink: true,
      },
    });
  }
}
