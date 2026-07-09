import { objects, relationships, eventLinks } from '../../../data/mockData';
import { CONTEXT_PROCESSES, getContextEventName, getContextObjectName } from '../data/contextModelData';

const OBJECT_DESCRIPTIONS = {
  customer: 'Party master for sold-to and bill-to roles in Order to Cash.',
  'sales-order': 'Commercial order header that anchors fulfilment and billing.',
  'sales-order-item': 'Line-level demand that drives delivery and invoicing.',
  delivery: 'Logistics document grouping outbound fulfilment activity.',
  'delivery-item': 'Shipped quantity line linked to sales demand.',
  invoice: 'Billing document issued to the customer.',
  'invoice-item': 'Billed line tied to fulfilment or service delivery.',
  product: 'Sellable material master referenced on order lines.',
  material: 'Operational material master used in logistics.',
  plant: 'Site master for shipping and inventory operations.',
  'vendor-hub': 'Accounts hub routing vendor and supply relationships.',
  'returns-processing': 'Returns handling object for reverse logistics.',
};

export function getContextEntityDetail(kind, entityId) {
  if (kind === 'object') {
    const meta = objects.find((o) => o.id === entityId);
    const name = getContextObjectName(entityId);
    const rels = relationships
      .filter((r) => r.source === entityId || r.target === entityId)
      .map((r) => {
        const outbound = r.source === entityId;
        const otherId = outbound ? r.target : r.source;
        return {
          id: r.id,
          label: r.label,
          direction: outbound ? 'outbound' : 'inbound',
          otherName: getContextObjectName(otherId),
        };
      });

    return {
      kind,
      entityId,
      name,
      technicalName: entityId.replace(/-/g, '_'),
      domain: meta?.domain ?? 'Object',
      description: OBJECT_DESCRIPTIONS[entityId] ?? `${name} object in the Order Management context model.`,
      relationshipCount: rels.length,
      relationships: rels,
      badges: ['Object Type', meta?.domain ?? 'Object', `${rels.length} Relationships`],
    };
  }

  if (kind === 'event') {
    const name = getContextEventName(entityId);
    return {
      kind,
      entityId,
      name,
      technicalName: entityId.replace(/-/g, '_'),
      domain: 'Event Type',
      description: `${name} event type emitted from operational systems.`,
      relationshipCount: 0,
      relationships: [],
      badges: ['Event Type', 'Order Management'],
    };
  }

  return {
    kind,
    entityId,
    name: CONTEXT_PROCESSES.find((p) => p.id === entityId)?.name ?? entityId,
    technicalName: entityId.replace(/-/g, '_'),
    domain: 'Process',
    description: 'Business process spanning multiple object and event types.',
    relationshipCount: 0,
    relationships: [],
    badges: ['Process'],
  };
}

export function getNeighborNodeIds(focusNodeId) {
  if (!focusNodeId) return new Set();
  const neighbors = new Set();

  if (focusNodeId.startsWith('obj-')) {
    const objectId = focusNodeId.slice(4);
    for (const relationship of relationships) {
      if (relationship.source === objectId) neighbors.add(`obj-${relationship.target}`);
      if (relationship.target === objectId) neighbors.add(`obj-${relationship.source}`);
    }
    for (const link of eventLinks) {
      if (link.objectId === objectId) neighbors.add(`evt-${link.eventId}`);
    }
  }

  if (focusNodeId.startsWith('evt-')) {
    const eventId = focusNodeId.slice(4);
    for (const link of eventLinks) {
      if (link.eventId === eventId) neighbors.add(`obj-${link.objectId}`);
    }
  }

  return neighbors;
}
