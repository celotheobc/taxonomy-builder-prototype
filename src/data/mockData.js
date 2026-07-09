/** Semantic entities for the Order to Cash perspective prototype */

export const EXPERIENCES = {
  PROGRESSIVE: 'progressive',
  PROGRESSIVE_CONTEXTUAL: 'progressive-contextual',
  ROUTE_AMBIGUITY: 'route-ambiguity',
};

export const NODE_KINDS = {
  OBJECT: 'object',
  EVENT_SOURCE: 'eventSource',
  METRIC: 'metric',
};

export const SUGGESTED_START_OBJECTS = [
  'customer',
  'sales-order',
  'sales-order-item',
  'delivery',
  'invoice',
];

export const objects = [
  { id: 'customer', name: 'Customer', domain: 'Party', relationshipCount: 4 },
  { id: 'sales-order', name: 'Sales Order', domain: 'Order Management', relationshipCount: 6 },
  { id: 'sales-order-item', name: 'Sales Order Item', domain: 'Order Management', relationshipCount: 5 },
  { id: 'delivery', name: 'Delivery', domain: 'Logistics', relationshipCount: 4 },
  { id: 'delivery-item', name: 'Delivery Item', domain: 'Logistics', relationshipCount: 5 },
  { id: 'invoice', name: 'Invoice', domain: 'Finance', relationshipCount: 3 },
  { id: 'invoice-item', name: 'Invoice Item', domain: 'Finance', relationshipCount: 2 },
  { id: 'product', name: 'Product', domain: 'Master Data', relationshipCount: 3 },
  { id: 'material', name: 'Material', domain: 'Master Data', relationshipCount: 4 },
  { id: 'plant', name: 'Plant', domain: 'Master Data', relationshipCount: 2 },
  {
    id: 'returns-processing',
    name: 'Returns Processing',
    domain: 'Logistics',
    relationshipCount: 2,
    hiddenFromDiscovery: true,
  },
  {
    id: 'vendor-hub',
    name: 'Accounts Hub',
    domain: 'Logistics',
    relationshipCount: 4,
    /** Insert-only: not a graph neighbour; ≥2-hop route picker after cycle resolve */
    demoDisconnectedRoutes: true,
    insertOnly: true,
  },
  {
    id: 'currency-conversion',
    name: 'Currency Conversion',
    domain: 'Finance',
    relationshipCount: 0,
    disconnected: true,
  },
];

export const eventSources = [
  { id: 'create-sales-order', name: 'Create Sales Order', domain: 'Order Management' },
  { id: 'change-sales-order', name: 'Change Sales Order', domain: 'Order Management' },
  { id: 'release-credit-block', name: 'Release Credit Block', domain: 'Order Management' },
  { id: 'create-delivery', name: 'Create Delivery', domain: 'Logistics' },
  { id: 'post-goods-issue', name: 'Post Goods Issue', domain: 'Logistics' },
  { id: 'create-invoice', name: 'Create Invoice', domain: 'Finance' },
  { id: 'clear-invoice', name: 'Clear Invoice', domain: 'Finance' },
  { id: 'return-created', name: 'Return Created', domain: 'Logistics' },
];

export const metrics = [
  { id: 'on-time-delivery', name: 'On-time Delivery Rate', domain: 'Logistics' },
  { id: 'order-value', name: 'Order Value', domain: 'Finance' },
  { id: 'outstanding-revenue', name: 'Outstanding Revenue', domain: 'Finance' },
  { id: 'touchless-order', name: 'Touchless Order Rate', domain: 'Order Management' },
  { id: 'order-cycle-time', name: 'Order Cycle Time', domain: 'Order Management' },
];

/** Relationships: source → target */
export const relationships = [
  { id: 'r-customer-so', source: 'customer', target: 'sales-order', label: 'places' },
  { id: 'r-so-soi', source: 'sales-order', target: 'sales-order-item', label: 'contains' },
  { id: 'r-soi-di', source: 'sales-order-item', target: 'delivery-item', label: 'fulfills' },
  { id: 'r-delivery-di', source: 'delivery', target: 'delivery-item', label: 'contains' },
  { id: 'r-di-ii', source: 'delivery-item', target: 'invoice-item', label: 'billed as' },
  { id: 'r-invoice-ii', source: 'invoice', target: 'invoice-item', label: 'contains' },
  { id: 'r-product-soi', source: 'product', target: 'sales-order-item', label: 'ordered' },
  { id: 'r-material-di', source: 'material', target: 'delivery-item', label: 'shipped' },
  { id: 'r-plant-delivery', source: 'plant', target: 'delivery', label: 'ships from' },
  { id: 'r-vh-material', source: 'vendor-hub', target: 'material', label: 'sources' },
  { id: 'r-vh-plant', source: 'vendor-hub', target: 'plant', label: 'operates' },
  { id: 'r-vh-product', source: 'vendor-hub', target: 'product', label: 'supplies' },
  { id: 'r-vh-rp', source: 'vendor-hub', target: 'returns-processing', label: 'routes via' },
  { id: 'r-rp-customer', source: 'returns-processing', target: 'customer', label: 'serves' },
  { id: 'r-rp-di', source: 'returns-processing', target: 'delivery-item', label: 'fulfills' },
  { id: 'r-so-delivery', source: 'sales-order', target: 'delivery', label: 'fulfilled by' },
  { id: 'r-customer-di', source: 'customer', target: 'delivery-item', label: 'receives' },
  { id: 'r-customer-invoice', source: 'customer', target: 'invoice', label: 'billed' },
  { id: 'r-so-invoice', source: 'sales-order', target: 'invoice', label: 'invoiced' },
];

export const eventLinks = [
  { id: 'e-create-so', eventId: 'create-sales-order', objectId: 'sales-order' },
  { id: 'e-change-so', eventId: 'change-sales-order', objectId: 'sales-order' },
  { id: 'e-release-credit', eventId: 'release-credit-block', objectId: 'sales-order' },
  { id: 'e-create-delivery', eventId: 'create-delivery', objectId: 'delivery' },
  { id: 'e-pgi', eventId: 'post-goods-issue', objectId: 'delivery' },
  { id: 'e-create-invoice', eventId: 'create-invoice', objectId: 'invoice' },
  { id: 'e-clear-invoice', eventId: 'clear-invoice', objectId: 'invoice' },
  { id: 'e-return-created', eventId: 'return-created', objectId: 'returns-processing' },
];

export const metricLinks = [
  { id: 'm-otd', metricId: 'on-time-delivery', objectId: 'delivery' },
  { id: 'm-order-value', metricId: 'order-value', objectId: 'sales-order' },
  { id: 'm-revenue', metricId: 'outstanding-revenue', objectId: 'invoice' },
  { id: 'm-touchless', metricId: 'touchless-order', objectId: 'sales-order' },
  { id: 'm-cycle-time', metricId: 'order-cycle-time', objectId: 'sales-order' },
];

export const ROUTE_A = {
  id: 'route-a',
  label: 'Route A',
  path: ['customer', 'delivery-item'],
  relationshipIds: ['r-customer-di'],
  description: 'Customer → Delivery Item',
};

export const ROUTE_B = {
  id: 'route-b',
  label: 'Route B',
  path: ['customer', 'sales-order', 'delivery', 'delivery-item'],
  relationshipIds: ['r-customer-so', 'r-so-delivery', 'r-delivery-di'],
  description: 'Customer → Sales Order → Delivery → Delivery Item',
};

export const routeAmbiguityIncluded = new Set([
  'customer',
  'sales-order',
  'delivery',
  'delivery-item',
  'invoice',
]);

export const assetMetadata = {
  title: 'Order to Cash Perspective',
  status: 'Draft',
  type: 'Perspective',
  referenceKey: 'order_to_cash_perspective',
  createdBy: 'Theo Bonham Carter',
  lastUpdatedBy: 'Theo Bonham Carter',
  cacheStatus: 'Available',
};

/** Display metadata keyed by relationship id (graph model) */
export const relationshipTableMeta = {
  'r-customer-so': {
    name: 'CustomerToSalesOrder',
    cardinality: '1:N',
    join: 'Customer_ID',
    type: 'Type-to-Type',
  },
  'r-so-delivery': {
    name: 'SalesOrderToDelivery',
    cardinality: '1:N',
    join: 'SalesOrder_ID',
    type: 'Type-to-Type',
  },
  'r-delivery-di': {
    name: 'DeliveryToDeliveryItem',
    cardinality: '1:N',
    join: 'Delivery_ID',
    type: 'Type-to-Type',
  },
  'r-customer-di': {
    name: 'CustomerToDeliveryItem',
    cardinality: '1:N',
    join: 'Customer_ID',
    type: 'Type-to-Type',
  },
  'r-so-soi': {
    name: 'SalesOrderToSalesOrderItem',
    cardinality: '1:N',
    join: 'SalesOrder_ID',
    type: 'Type-to-Type',
  },
  'r-soi-di': {
    name: 'SalesOrderItemToDeliveryItem',
    cardinality: '1:N',
    join: 'SalesOrderItem_ID',
    type: 'Type-to-Type',
  },
  'r-customer-invoice': {
    name: 'CustomerToInvoice',
    cardinality: '1:N',
    join: 'Customer_ID',
    type: 'Type-to-Type',
  },
  'r-so-invoice': {
    name: 'SalesOrderToInvoice',
    cardinality: '1:N',
    join: 'SalesOrder_ID',
    type: 'Type-to-Type',
  },
  'r-vh-material': {
    name: 'VendorHubToMaterial',
    cardinality: 'N:1',
    join: 'VendorHub_ID',
    type: 'Type-to-Type',
  },
  'r-vh-plant': {
    name: 'VendorHubToPlant',
    cardinality: 'N:1',
    join: 'VendorHub_ID',
    type: 'Type-to-Type',
  },
  'r-rp-customer': {
    name: 'ReturnsProcessingToCustomer',
    cardinality: 'N:1',
    join: 'ReturnsProcessing_ID',
    type: 'Type-to-Type',
  },
};

/** Upstream / downstream dependencies shown on the perspective Overview tab. */
export const perspectiveOverviewDependencies = {
  partOf: [
    { id: 'otc-process', label: 'Order-to-Cash Process', iconColor: '#507D8E' },
    { id: 'order-log', label: 'Order log Event log', iconColor: '#218C5E' },
  ],
  usedBy: [
    { id: 'on-time-check', label: 'On-time check Function', iconColor: '#DB6E4C' },
    { id: 'cycle-time', label: 'Cycle time Metric', iconColor: '#B13E83' },
  ],
};

export const agentContextMarkdown = `## Order to Cash Perspective

This perspective scopes the **Order to Cash** process for agent reasoning.

### Included semantics
- Core order, logistics, and billing object types
- Event sources for order creation, delivery, and invoicing
- KPIs for delivery performance and revenue

### Instructions for agents
Prefer graph-derived relationship paths when traversing from Customer to fulfillment artifacts.`;
