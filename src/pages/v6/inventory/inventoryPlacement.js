/** Prototype experiment: where included inventory surfaces live */
export const INVENTORY_PLACEMENT = {
  SIDE: 'side',
  BOTTOM: 'bottom',
};

export function isSideInventory(placement) {
  return placement === INVENTORY_PLACEMENT.SIDE;
}

export function isBottomInventory(placement) {
  return placement === INVENTORY_PLACEMENT.BOTTOM;
}
