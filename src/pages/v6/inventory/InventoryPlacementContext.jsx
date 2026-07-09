import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { INVENTORY_PLACEMENT } from './inventoryPlacement';

const InventoryPlacementContext = createContext(null);

export function InventoryPlacementProvider({ children }) {
  const [placement, setPlacement] = useState(INVENTORY_PLACEMENT.SIDE);

  const togglePlacement = useCallback(() => {
    setPlacement((current) =>
      current === INVENTORY_PLACEMENT.SIDE
        ? INVENTORY_PLACEMENT.BOTTOM
        : INVENTORY_PLACEMENT.SIDE,
    );
  }, []);

  const value = useMemo(
    () => ({
      placement,
      setPlacement,
      togglePlacement,
    }),
    [placement, togglePlacement],
  );

  return (
    <InventoryPlacementContext.Provider value={value}>
      {children}
    </InventoryPlacementContext.Provider>
  );
}

export function useInventoryPlacement() {
  const ctx = useContext(InventoryPlacementContext);
  if (!ctx) {
    throw new Error('useInventoryPlacement must be used within InventoryPlacementProvider');
  }
  return ctx;
}
