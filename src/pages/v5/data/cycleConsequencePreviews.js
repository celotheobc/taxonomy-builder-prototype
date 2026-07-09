/** Mock consequence copy for cycle resolution options in v5 */
export const CYCLE_CONSEQUENCE_PREVIEWS = {
  'r-customer-di': {
    bullets: [
      'Delivery Item will remain reachable via Sales Order → Delivery',
      'Estimated connected delivery items: -8%',
      'Will keep Sales Order as the main route into fulfilment',
    ],
  },
  'r-so-delivery': {
    bullets: [
      'Delivery will remain reachable through Delivery Item',
      'Estimated delivery coverage: -14%',
      'May make fulfilment analysis less direct',
    ],
  },
  'r-customer-so': {
    bullets: [
      'Will remove Customer as the entry route to orders',
      'Sales Order will remain connected to Delivery and Delivery Item',
      'Estimated customer coverage: -22%',
      'Use only if this perspective is not customer-led',
    ],
  },
  'r-delivery-di': {
    bullets: [
      'Delivery Item will remain reachable via Customer',
      'Estimated fulfilment path depth: -1 hop',
      'May simplify order-to-delivery tracing',
    ],
  },
  'r-customer-invoice': {
    bullets: [
      'Invoice will remain reachable via Sales Order',
      'Estimated billing path coverage: -12%',
      'May reduce direct customer-to-invoice visibility',
    ],
  },
  'r-so-invoice': {
    bullets: [
      'Invoice will remain reachable via Customer',
      'Estimated order-to-cash traceability: -10%',
      'Keeps customer as the billing entry point',
    ],
  },
};

export function getCycleConsequencePreview(relId) {
  const preview = CYCLE_CONSEQUENCE_PREVIEWS[relId];
  if (preview) return preview;

  return {
    bullets: [
      'Removes one connection in the detected loop',
      'Other paths in this perspective may still connect the same objects',
      'Estimated scope impact: low to moderate',
    ],
  };
}
