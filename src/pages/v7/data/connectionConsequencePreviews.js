import { objectName } from '../../../components/configuration/connectionPath/PathRouteLabel';

export const KEEP_DISCONNECTED_CHOICE = 'keep-disconnected';

function connectsViaName(path, includedObjects) {
  const anchors = path.objectIds.filter(
    (id, index) => index > 0 && includedObjects.has(id),
  );
  return objectName(anchors[anchors.length - 1] ?? path.objectIds[path.objectIds.length - 1]);
}

export function buildConnectionDecisionLabel(path, includedObjects) {
  const newObjectIds = path.objectIds.filter((id) => !includedObjects.has(id));
  return newObjectIds
    .map((id, index) => (index === 0 ? objectName(id) : `+ ${objectName(id)}`))
    .join('\n');
}

const PREVIEWS = {
  'path-vh-material': {
    businessConsequences: [
      { status: 'good', text: 'Accounts material linkage becomes available' },
      { status: 'good', text: 'Delivery item traceability preserved' },
      { status: 'good', text: 'Existing fulfilment analysis unchanged' },
    ],
    dataImpact: [
      { status: 'good', text: 'Reachable cases preserved' },
      { status: 'good', text: 'Filter propagation preserved' },
      { status: 'warn', text: 'One additional join introduced', detail: 'Material → Delivery Item' },
    ],
    pql: `SELECT
    AccountsHub.ID,
    Material.ID,
    DeliveryItem.ID
FROM Perspective`,
    pqlValidated: `SELECT
    AccountsHub.ID,
    Material.ID,
    DeliveryItem.ID
FROM Perspective
WHERE Material.Type = 'Accounts'`,
    results: {
      columns: ['Accounts Hub', 'Material', 'Delivery Item'],
      rows: [
        ['AH01', 'M100', 'DI221'],
        ['AH01', 'M102', 'DI228'],
      ],
    },
    resultsOnRun: {
      columns: ['Accounts Hub', 'Material', 'Delivery Item'],
      rows: [
        ['AH01', 'M100', 'DI221'],
        ['AH01', 'M102', 'DI228'],
        ['AH02', 'M110', 'DI240'],
      ],
    },
  },
  'path-vh-plant': {
    businessConsequences: [
      { status: 'good', text: 'Plant-level fulfilment context becomes available' },
      { status: 'good', text: 'Delivery analysis remains direct' },
      { status: 'warn', text: 'Adds master data objects to the perspective' },
    ],
    dataImpact: [
      { status: 'good', text: 'Reachable cases preserved' },
      { status: 'warn', text: 'Join complexity increased', detail: 'Plant → Delivery' },
      { status: 'good', text: 'Existing filters remain valid' },
    ],
    pql: `SELECT
    AccountsHub.ID,
    Plant.ID,
    Delivery.ID
FROM Perspective`,
    pqlValidated: `SELECT
    AccountsHub.ID,
    Plant.ID,
    Delivery.ID
FROM Perspective
WHERE Plant.Region = 'EMEA'`,
    results: {
      columns: ['Accounts Hub', 'Plant', 'Delivery'],
      rows: [
        ['AH01', 'PL01', 'D100'],
        ['AH01', 'PL02', 'D104'],
      ],
    },
    resultsOnRun: {
      columns: ['Accounts Hub', 'Plant', 'Delivery'],
      rows: [
        ['AH01', 'PL01', 'D100'],
        ['AH01', 'PL02', 'D104'],
        ['AH02', 'PL03', 'D112'],
      ],
    },
  },
  'path-vh-product': {
    businessConsequences: [
      { status: 'good', text: 'Product analysis becomes available' },
      { status: 'good', text: 'Accounts can be linked to deliveries' },
      { status: 'warn', text: 'Additional object joins introduced' },
      { status: 'warn', text: 'Longer fulfilment path through order items' },
    ],
    dataImpact: [
      { status: 'good', text: 'Reachable cases preserved' },
      { status: 'warn', text: 'Join complexity increased' },
      { status: 'good', text: 'Existing filters remain valid' },
    ],
    pql: `SELECT
    AccountsHub.ID,
    Product.ID,
    SalesOrderItem.ID,
    DeliveryItem.ID
FROM Perspective`,
    pqlValidated: `SELECT
    AccountsHub.ID,
    Product.ID,
    SalesOrderItem.ID,
    DeliveryItem.ID
FROM Perspective
WHERE Product.Category = 'Accounts'`,
    results: {
      columns: ['Accounts Hub', 'Product', 'Sales Order Item', 'Delivery Item'],
      rows: [
        ['AH01', 'P10', 'SOI221', 'DI221'],
        ['AH01', 'P11', 'SOI228', 'DI228'],
      ],
    },
    resultsOnRun: {
      columns: ['Accounts Hub', 'Product', 'Sales Order Item', 'Delivery Item'],
      rows: [
        ['AH01', 'P10', 'SOI221', 'DI221'],
        ['AH01', 'P11', 'SOI228', 'DI228'],
        ['AH02', 'P12', 'SOI240', 'DI240'],
      ],
    },
  },
  'path-vh-rp': {
    businessConsequences: [
      { status: 'good', text: 'Returns routing becomes available from accounts' },
      { status: 'warn', text: 'Customer entry path changes' },
      { status: 'bad', text: 'Creates a perspective cycle' },
      { status: 'warn', text: 'Requires resolution before analysis is stable' },
    ],
    dataImpact: [
      { status: 'bad', text: 'Creates cycle requiring resolution' },
      { status: 'warn', text: 'Join complexity increased' },
      { status: 'warn', text: 'Filter propagation becomes partial' },
    ],
    pql: `SELECT
    AccountsHub.ID,
    ReturnsProcessing.ID,
    Customer.ID
FROM Perspective`,
    pqlValidated: `SELECT
    AccountsHub.ID,
    ReturnsProcessing.ID,
    Customer.ID
FROM Perspective
WHERE ReturnsProcessing.Status = 'Open'`,
    results: {
      error: 'Query unstable — cycle detected in perspective graph',
    },
    resultsOnRun: {
      columns: ['Accounts Hub', 'Returns Processing', 'Customer'],
      rows: [
        ['AH01', 'RP10', 'C001'],
        ['AH01', 'RP11', 'C002'],
      ],
    },
  },
  [KEEP_DISCONNECTED_CHOICE]: {
    businessConsequences: [
      { status: 'good', text: 'Object remains available in the perspective' },
      { status: 'good', text: 'Existing perspective unchanged' },
      { status: 'warn', text: 'No filter propagation available' },
      { status: 'warn', text: 'No joins can be executed through this object' },
    ],
    dataImpact: [
      { status: 'good', text: 'No joins added' },
      { status: 'warn', text: 'Object is isolated from current analysis paths' },
      { status: 'warn', text: 'Downstream queries cannot reach related records' },
    ],
    pql: `SELECT
    AccountsHub.ID
FROM Perspective`,
    pqlValidated: `SELECT
    AccountsHub.ID
FROM Perspective
WHERE AccountsHub.Status = 'Active'`,
    results: {
      columns: ['Accounts Hub'],
      rows: [['AH01'], ['AH02']],
    },
    resultsOnRun: {
      columns: ['Accounts Hub'],
      rows: [['AH01'], ['AH02'], ['AH03']],
    },
  },
};

const CONNECTION_COMPARISON_NOTES = {
  'path-vh-material': [
    { status: 'good', text: 'Avoids creating a cycle' },
    { status: 'good', text: 'Simpler path than via Sales Order Item' },
    { status: 'warn', text: 'Adds one material join' },
  ],
  'path-vh-plant': [
    { status: 'good', text: 'No cycle introduced' },
    { status: 'warn', text: 'More master data than the material path' },
    { status: 'good', text: 'Shorter than the product route' },
  ],
  'path-vh-product': [
    { status: 'good', text: 'Avoids a cycle' },
    { status: 'warn', text: 'Longer hop chain than material or plant' },
    { status: 'good', text: 'Better product traceability than plant alone' },
  ],
  'path-vh-rp': [
    { status: 'bad', text: 'Only option that creates a new cycle' },
    { status: 'warn', text: 'Requires another resolution step' },
    { status: 'warn', text: 'Returns context not available on simpler paths' },
  ],
  [KEEP_DISCONNECTED_CHOICE]: [
    { status: 'good', text: 'No graph changes or join risk' },
    { status: 'warn', text: 'No connectivity — object stays isolated' },
    { status: 'warn', text: 'All connection paths offer more analysis reach' },
  ],
};

const DEFAULT_CONNECTION_COMPARISON = [
  { status: 'warn', text: 'Compare join complexity with other paths' },
  { status: 'warn', text: 'Check whether this path introduces a cycle' },
];

const DEFAULT_PREVIEW = PREVIEWS['path-vh-material'];

export function getConnectionConsequencePreview(choiceId, prompt, includedObjects) {
  if (!prompt) return null;

  const addedName = objectName(prompt.addedId);

  if (choiceId === KEEP_DISCONNECTED_CHOICE) {
    const preview = PREVIEWS[KEEP_DISCONNECTED_CHOICE];
    return {
      summaryHeading: 'If you keep disconnected',
      decisionLabel: addedName,
      connectsVia: null,
      comparisonNotes: CONNECTION_COMPARISON_NOTES[KEEP_DISCONNECTED_CHOICE],
      ...preview,
    };
  }

  const path = prompt.paths?.find((p) => p.id === choiceId);
  if (!path) return null;

  const preview = PREVIEWS[path.id] ?? DEFAULT_PREVIEW;

  return {
    summaryHeading: 'If you add',
    decisionLabel: buildConnectionDecisionLabel(path, includedObjects),
    connectsVia: connectsViaName(path, includedObjects),
    wouldCreateCycle: Boolean(path.wouldCreateCycle),
    comparisonNotes:
      CONNECTION_COMPARISON_NOTES[path.id] ?? DEFAULT_CONNECTION_COMPARISON,
    ...preview,
  };
}
