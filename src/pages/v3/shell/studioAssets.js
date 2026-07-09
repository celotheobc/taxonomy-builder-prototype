import { PROCESS_SEEDS } from '../data/contextModelData';

export const STUDIO_CONTEXT_MODEL = 'Order Management Context Model';

export const CONTEXT_BROWSE_TAB_ID = 'tab-context-browse';

export const L1_QUICK_LINKS = [
  { id: 'browse-context', label: 'Browse Context Model', assetType: 'context' },
  { id: 'new-agent', label: 'New Agent', assetType: 'placeholder' },
  { id: 'explore-data', label: 'Explore Data', assetType: 'placeholder' },
  { id: 'more', label: '… More', assetType: 'placeholder' },
];

export const L1_SECTIONS = [
  {
    id: 'objects',
    label: 'Objects',
    icon: 'object',
    assets: [
      { id: 'invoice', label: 'Invoice Object', assetType: 'object' },
      { id: 'customer', label: 'Customer Object', assetType: 'object' },
      { id: 'sales-order', label: 'Sales Order Object', assetType: 'object' },
    ],
  },
  {
    id: 'event-types',
    label: 'Event Types',
    icon: 'event',
    assets: [
      { id: 'create-sales-order', label: 'Create Sales Order', assetType: 'object' },
      { id: 'create-invoice', label: 'Create Invoice', assetType: 'object' },
    ],
  },
  {
    id: 'relationships',
    label: 'Relationships',
    icon: 'relationship',
    assets: [],
  },
  {
    id: 'taxonomies',
    label: 'Taxonomies',
    icon: 'taxonomy',
    assets: [],
  },
  {
    id: 'processes',
    label: 'Processes',
    icon: 'process',
    defaultOpen: true,
    assets: [
      { id: 'order-to-cash', label: 'Order-to-Cash Process', assetType: 'process' },
      { id: 'procure-to-pay', label: 'Procure-to-Pay Process', assetType: 'process' },
      { id: 'accounts-payable', label: 'Accounts Payable Process', assetType: 'process' },
    ],
  },
  {
    id: 'transformations',
    label: 'Transformations',
    icon: 'transformation',
    assets: [],
  },
  {
    id: 'data-pipelines',
    label: 'Data Pipelines',
    icon: 'pipeline',
    assets: [],
  },
  {
    id: 'perspectives',
    label: 'Perspectives',
    icon: 'perspective',
    defaultOpen: true,
    canCreate: true,
    assets: [
      {
        id: 'order-to-cash-perspective',
        label: 'Order to Cash Perspective',
        assetType: 'perspective',
        seed: PROCESS_SEEDS['order-to-cash'],
        perspectiveName: 'Order to Cash Perspective',
      },
      {
        id: 'procure-to-pay-perspective',
        label: 'Procure to Pay Perspective',
        assetType: 'perspective',
        seed: PROCESS_SEEDS['procure-to-pay'],
        perspectiveName: 'Procure to Pay Perspective',
      },
    ],
  },
  {
    id: 'knowledge-models',
    label: 'Knowledge Models',
    icon: 'knowledge',
    assets: [],
  },
];

export function getStudioPerspectives() {
  const section = L1_SECTIONS.find((s) => s.id === 'perspectives');
  return section?.assets ?? [];
}

export function getStudioProcesses() {
  const section = L1_SECTIONS.find((s) => s.id === 'processes');
  return section?.assets ?? [];
}

export function assetKey(asset) {
  if (asset.assetType === 'context') return 'context:browse';
  return `${asset.assetType}:${asset.id}`;
}

export function tabIconForType(type) {
  if (type === 'context') return 'grid';
  if (type === 'refine') return 'perspective';
  if (type === 'process') return 'process';
  if (type === 'object') return 'object';
  return 'asset';
}
