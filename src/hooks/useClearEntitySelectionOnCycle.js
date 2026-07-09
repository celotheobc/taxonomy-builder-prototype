import { useEffect, useRef } from 'react';

const ENTITY_SELECTION_TYPES = new Set([
  'object',
  'event',
  'metric',
  'relationship',
  'cycleEdge',
]);

/**
 * Clears object/event/metric/relationship selection while a cycle is unresolved.
 * Runs on cycle entry and whenever the user selects an entity during resolution.
 */
export function useClearEntitySelectionOnCycle({
  cycleActive,
  selectionType,
  onClear,
  onCycleEnter,
}) {
  const wasCycleActive = useRef(false);

  useEffect(() => {
    if (!cycleActive) {
      wasCycleActive.current = false;
      return;
    }

    if (ENTITY_SELECTION_TYPES.has(selectionType)) {
      onClear();
    }

    if (!wasCycleActive.current) {
      onCycleEnter?.();
    }
    wasCycleActive.current = true;
  }, [cycleActive, selectionType, onClear, onCycleEnter]);
}
