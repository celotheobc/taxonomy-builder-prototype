/** Mock consequence preview data for v7 cycle resolution experiment */

const DEFAULT_PREVIEW = {
  relationshipLabel: 'Relationship',
  businessConsequences: [
    { status: 'good', text: 'Other paths may still connect the same objects' },
    { status: 'warn', text: 'Some filters may propagate indirectly' },
  ],
  dataImpact: [
    { status: 'warn', text: 'Some joins may become unavailable', detail: '4,218 joins' },
    { status: 'warn', text: 'Filter propagation may be partial' },
  ],
  pql: `SELECT
    Customer.ID,
    SalesOrder.ID,
    DeliveryItem.ID
FROM Perspective`,
  pqlValidated: `SELECT
    Customer.ID,
    SalesOrder.ID,
    DeliveryItem.ID
FROM Perspective
WHERE Customer.Status = 'Active'`,
  results: {
    columns: ['Customer', 'Sales Order', 'Delivery Item'],
    rows: [
      ['C001', 'SO100', 'DI221'],
      ['C001', 'SO101', 'DI228'],
      ['C002', 'SO112', 'DI240'],
    ],
  },
  resultsOnRun: {
    columns: ['Customer', 'Sales Order', 'Delivery Item'],
    rows: [
      ['C001', 'SO100', 'DI221'],
      ['C001', 'SO101', 'DI228'],
      ['C002', 'SO112', 'DI240'],
      ['C003', 'SO120', 'DI255'],
    ],
  },
};

export const CYCLE_IMPACT_PREVIEWS = {
  'r-customer-di': {
    relationshipLabel: 'Customer → Delivery Item',
    businessConsequences: [
      { status: 'good', text: 'Delivery Items remain reachable' },
      { status: 'good', text: 'Order analysis remains possible' },
      { status: 'warn', text: 'Customer filters propagate indirectly' },
      { status: 'good', text: 'Fulfilment tracing stays intact via Sales Order' },
    ],
    dataImpact: [
      { status: 'good', text: '98% of delivery items remain reachable', detail: '84,113 cases' },
      { status: 'good', text: 'Filter propagation preserved' },
      { status: 'good', text: 'No joins become unavailable', detail: '0 missing joins' },
    ],
    pql: `SELECT
    Customer.ID,
    SalesOrder.ID,
    DeliveryItem.ID
FROM Perspective`,
    pqlValidated: `SELECT
    Customer.ID,
    SalesOrder.ID,
    DeliveryItem.ID
FROM Perspective
WHERE Customer.Region = 'EMEA'`,
    results: {
      columns: ['Customer', 'Sales Order', 'Delivery Item'],
      rows: [
        ['C001', 'SO100', 'DI221'],
        ['C001', 'SO101', 'DI228'],
        ['C002', 'SO112', 'DI240'],
      ],
    },
    resultsOnRun: {
      columns: ['Customer', 'Sales Order', 'Delivery Item'],
      rows: [
        ['C001', 'SO100', 'DI221'],
        ['C001', 'SO101', 'DI228'],
        ['C002', 'SO112', 'DI240'],
        ['C004', 'SO130', 'DI261'],
      ],
    },
  },
  'r-so-delivery': {
    relationshipLabel: 'Sales Order → Delivery',
    businessConsequences: [
      { status: 'good', text: 'Delivery Items remain reachable via Customer' },
      { status: 'warn', text: 'Fulfilment analysis becomes less direct' },
      { status: 'warn', text: 'Order-to-delivery tracing requires an extra hop' },
      { status: 'good', text: 'Customer-led analysis still works' },
    ],
    dataImpact: [
      { status: 'warn', text: '86% of deliveries remain on the primary route', detail: '71,944 cases' },
      { status: 'warn', text: '12,402 joins become unavailable' },
      { status: 'warn', text: 'Filter propagation becomes partial' },
    ],
    pql: `SELECT
    Customer.ID,
    DeliveryItem.ID
FROM Perspective`,
    pqlValidated: `SELECT
    Customer.ID,
    DeliveryItem.ID
FROM Perspective
WHERE DeliveryItem.Status <> 'Cancelled'`,
    results: {
      columns: ['Customer', 'Delivery Item'],
      rows: [
        ['C001', 'DI221'],
        ['C002', 'DI240'],
        ['C003', '—'],
      ],
    },
    resultsOnRun: {
      columns: ['Customer', 'Delivery Item'],
      rows: [
        ['C001', 'DI221'],
        ['C002', 'DI240'],
        ['C003', 'DI248'],
      ],
    },
  },
  'r-customer-so': {
    relationshipLabel: 'Customer → Sales Order',
    businessConsequences: [
      { status: 'bad', text: 'Invoice is no longer reachable from Customer' },
      { status: 'bad', text: 'Customer filtering breaks across orders' },
      { status: 'good', text: 'Sales Orders remain linked to Delivery' },
      { status: 'warn', text: 'Order analysis continues without a customer entry point' },
    ],
    dataImpact: [
      { status: 'bad', text: 'Invoice is no longer reachable' },
      { status: 'bad', text: 'Customer filtering breaks' },
      { status: 'warn', text: '28,904 joins become unavailable', detail: '62,108 reachable cases' },
    ],
    pql: `SELECT
    Customer.ID,
    SalesOrder.ID,
    DeliveryItem.ID
FROM Perspective`,
    pqlValidated: `SELECT
    Customer.ID,
    SalesOrder.ID
FROM Perspective
WHERE SalesOrder.Status = 'Open'`,
    results: {
      error: 'Query failed — Invoice no longer reachable from Customer',
    },
    resultsOnRun: {
      columns: ['Customer', 'Sales Order'],
      rows: [
        ['C001', 'SO100'],
        ['C001', 'SO101'],
        ['C002', 'SO112'],
        ['C003', 'SO118'],
      ],
    },
  },
  'r-delivery-di': {
    relationshipLabel: 'Delivery → Delivery Item',
    businessConsequences: [
      { status: 'good', text: 'Delivery Items remain reachable via Customer' },
      { status: 'good', text: 'Order analysis remains possible' },
      { status: 'warn', text: 'Direct delivery linkage is removed' },
      { status: 'good', text: 'Customer filters still propagate' },
    ],
    dataImpact: [
      { status: 'good', text: '97% of delivery items remain reachable', detail: '76,880 cases' },
      { status: 'warn', text: '2,104 joins become unavailable' },
      { status: 'warn', text: 'Filter propagation becomes partial' },
    ],
    pql: `SELECT
    Customer.ID,
    SalesOrder.ID
FROM Perspective`,
    pqlValidated: `SELECT
    Customer.ID,
    SalesOrder.ID
FROM Perspective
WHERE SalesOrder.CreatedDate >= '2024-01-01'`,
    results: {
      columns: ['Customer', 'Sales Order'],
      rows: [
        ['C001', 'SO100'],
        ['C001', 'SO101'],
        ['C002', 'SO112'],
      ],
    },
    resultsOnRun: {
      columns: ['Customer', 'Sales Order'],
      rows: [
        ['C001', 'SO100'],
        ['C001', 'SO101'],
        ['C002', 'SO112'],
        ['C002', 'SO115'],
      ],
    },
  },
};

const CYCLE_COMPARISON_NOTES = {
  'r-customer-di': [
    { status: 'good', text: 'Lowest apparent impact among the four removals' },
    { status: 'good', text: 'Fewer missing joins than Sales Order → Delivery' },
    { status: 'warn', text: 'Still removes a direct customer shortcut' },
  ],
  'r-so-delivery': [
    { status: 'warn', text: 'More joins affected than Customer → Delivery Item' },
    { status: 'good', text: 'Keeps a customer entry point unlike Customer → Sales Order' },
    { status: 'warn', text: 'Filter propagation becomes partial' },
  ],
  'r-customer-so': [
    { status: 'bad', text: 'Highest impact — breaks customer filtering' },
    { status: 'bad', text: 'Worse reachability than any other option' },
    { status: 'warn', text: 'Only viable if customer-led analysis is not needed' },
  ],
  'r-delivery-di': [
    { status: 'good', text: 'Similar reachability to the recommended option' },
    { status: 'warn', text: 'Slightly more joins affected than Customer → Delivery Item' },
    { status: 'good', text: 'Avoids breaking customer filter propagation' },
  ],
};

const DEFAULT_COMPARISON_NOTES = [
  { status: 'warn', text: 'Compare reachability and join loss with other removals' },
  { status: 'warn', text: 'Filter propagation may differ across options' },
];

export function getCycleImpactPreview(relId, rowName) {
  const preview = CYCLE_IMPACT_PREVIEWS[relId];
  if (preview) {
    return {
      ...preview,
      comparisonNotes: CYCLE_COMPARISON_NOTES[relId] ?? DEFAULT_COMPARISON_NOTES,
    };
  }

  return {
    ...DEFAULT_PREVIEW,
    relationshipLabel: rowName ?? DEFAULT_PREVIEW.relationshipLabel,
    comparisonNotes: DEFAULT_COMPARISON_NOTES,
  };
}
