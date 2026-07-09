import { PROCESS_SEEDS } from '../../v3/data/contextModelData';

export const PROCESS_ASSOCIATED_PERSPECTIVES = {
  'order-to-cash': [
    { id: 'order-management', label: 'Order Management' },
    { id: 'delivery-investigation', label: 'Delivery Investigation' },
  ],
  'procure-to-pay': [],
  'accounts-payable': [],
  'returns-management': [],
};

const PROCESS_SEED_ALIASES = {
  'accounts-payable': 'procure-to-pay',
};

export function getProcessSeed(processId) {
  const key = PROCESS_SEED_ALIASES[processId] ?? processId;
  return PROCESS_SEEDS[key] ?? { objects: [], events: [] };
}

export function getAssociatedPerspectives(processId) {
  return PROCESS_ASSOCIATED_PERSPECTIVES[processId] ?? [];
}
