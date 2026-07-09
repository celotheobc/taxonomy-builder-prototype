import { getProcessSeed } from '../pages/v4/data/processPageData';

export const ENTIRE_CONTEXT_MODEL_ID = '';
export const ENTIRE_CONTEXT_MODEL_LABEL = 'Entire context model';

export const PROCESS_FILTER_OPTIONS = [
  { id: 'order-to-cash', label: 'Order-to-Cash Process' },
  { id: 'procure-to-pay', label: 'Procure-to-Pay Process' },
  { id: 'accounts-payable', label: 'Accounts Payable Process' },
];

export function getProcessFilterLabel(processId) {
  if (!processId) return ENTIRE_CONTEXT_MODEL_LABEL;
  return PROCESS_FILTER_OPTIONS.find((p) => p.id === processId)?.label ?? processId;
}

export function getProcessAssetIds(processId) {
  if (!processId) {
    return { objectIds: null, eventIds: null };
  }
  const seed = getProcessSeed(processId);
  return {
    objectIds: new Set(seed.objects),
    eventIds: new Set(seed.events),
  };
}
