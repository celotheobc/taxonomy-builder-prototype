import { useCallback, useMemo, useState } from 'react';
import { findCycleEdgeIds, hasObjectCycle } from '../data/cycleDetection';
import { objects, relationships, routeAmbiguityIncluded } from '../data/mockData';
import { useToast } from './useToast';

export const RESOLUTION_PATTERN = { PRUNE: 'prune' };

export function useRouteAmbiguity() {
  const [prunedRelationshipIds, setPrunedRelationshipIds] = useState(new Set());
  const { toast, showToast, dismissToast } = useToast();

  const activeRelationships = useMemo(
    () => relationships.filter((r) => !prunedRelationshipIds.has(r.id)),
    [prunedRelationshipIds],
  );

  const cycleEdgeIds = useMemo(
    () => findCycleEdgeIds(routeAmbiguityIncluded, activeRelationships),
    [activeRelationships],
  );

  const isResolved = !hasObjectCycle(routeAmbiguityIncluded, activeRelationships);

  const pruneRelationship = useCallback(
    (relId) => {
      setPrunedRelationshipIds((prev) => new Set([...prev, relId]));
      const rel = relationships.find((r) => r.id === relId);
      const label = rel
        ? `${objects.find((o) => o.id === rel.source)?.name} → ${objects.find((o) => o.id === rel.target)?.name}`
        : 'Relationship';
      showToast(`Removed ${label}`, {
        undo: () => {
          setPrunedRelationshipIds((prev) => {
            const next = new Set(prev);
            next.delete(relId);
            return next;
          });
          dismissToast();
          showToast('Connection restored');
        },
      });
    },
    [showToast, dismissToast],
  );

  return {
    includedObjects: routeAmbiguityIncluded,
    activeRelationships,
    conflictingEdges: isResolved ? new Set() : cycleEdgeIds,
    cycleEdgeIds,
    cycleActive: !isResolved,
    isCycleResolved: isResolved,
    routeExcluded: prunedRelationshipIds,
    pruneRelationship,
    toast,
    validationStatus: isResolved ? 'Valid' : 'Needs resolution',
    excludedRelationships: prunedRelationshipIds,
    isResolved,
    isRouteResolved: isResolved,
    pattern: RESOLUTION_PATTERN.PRUNE,
    routeAmbiguityActive: !isResolved,
  };
}
