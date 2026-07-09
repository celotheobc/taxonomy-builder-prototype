import { useMemo } from 'react';
import { EXPERIENCES, objects } from '../data/mockData';

export function useGraphBuilderContext({
  experience,
  progressive,
  routeAmbiguity,
  highlightedRelationshipId = null,
  inspectorSelection = null,
}) {
  const isGlobal = experience === EXPERIENCES.PROGRESSIVE;
  const isContextual = experience === EXPERIENCES.PROGRESSIVE_CONTEXTUAL;
  const isProgressive = isGlobal || isContextual;
  const isRoute = experience === EXPERIENCES.ROUTE_AMBIGUITY;

  const graphContext = useMemo(() => {
    const cycleSource = isProgressive ? progressive : routeAmbiguity;
    const base = isProgressive
      ? {
          discoveryMode: progressive.discoveryMode,
          includedObjects: progressive.includedObjects,
          includedEvents: progressive.includedEvents,
          includedMetrics: progressive.includedMetrics,
          visibleObjects: progressive.visibleObjects,
          addableObjects: progressive.addableObjects,
          addableEvents: progressive.addableEvents,
          addableMetrics: progressive.addableMetrics,
          showDiscoverObjects: progressive.showDiscoverObjects,
          showDiscoverEvents: progressive.showDiscoverEvents,
          showDiscoverMetrics: progressive.showDiscoverMetrics,
          discoveryAnchorId: progressive.discoveryAnchorId,
          includedRelationshipIds: progressive.includedRelationshipIds,
          activeRelationships: progressive.activeRelationships,
          showOnlyIncluded: progressive.showOnlyIncluded,
          onAddObject: progressive.addObject,
          onFocusExpansion: progressive.focusExpansionFrom,
          onOpenContextual: progressive.openContextualMenu,
          onAddEvent: progressive.addEvent,
          onAddMetric: progressive.addMetric,
          eventLinks: progressive.eventLinks,
          metricLinks: progressive.metricLinks,
          expansionAnchorId: progressive.expansionAnchorId,
          pendingObjectId: progressive.pendingObjectId,
          connectionPrompt: progressive.connectionPrompt,
          objectNames: Object.fromEntries(objects.map((o) => [o.id, o.name])),
          previewBridgeRelationshipIds: progressive.previewBridgeRelationshipIds,
          previewBridgeWouldCreateCycle: progressive.previewBridgeWouldCreateCycle,
          bridgePreviewObjectIds: progressive.bridgePreviewObjectIds,
          contextualSelection: progressive.contextualSelection,
        }
      : {
          includedObjects: routeAmbiguity.includedObjects,
          activeRelationships: routeAmbiguity.activeRelationships,
        };

    return {
      ...base,
      cycleActive: cycleSource.cycleActive ?? cycleSource.routeAmbiguityActive,
      cycleEdgeIds: cycleSource.cycleEdgeIds ?? cycleSource.conflictingEdges,
      isResolved: cycleSource.isCycleResolved ?? cycleSource.isRouteResolved,
      excludedRelationships: cycleSource.routeExcluded ?? cycleSource.excludedRelationships,
      onPrune: (relId) => cycleSource.pruneRelationship(relId),
      highlightedRelationshipId,
      inspectorSelection,
    };
  }, [
    isProgressive,
    routeAmbiguity,
    progressive,
    highlightedRelationshipId,
    inspectorSelection,
  ]);

  const objectCount = isProgressive
    ? progressive.includedObjects.size
    : routeAmbiguity.includedObjects.size;

  const relCount = isProgressive
    ? progressive.includedRelationshipIds.size
    : routeAmbiguity.activeRelationships.filter(
        (r) =>
          routeAmbiguity.includedObjects.has(r.source) &&
          routeAmbiguity.includedObjects.has(r.target),
      ).length;

  const validationStatus = isProgressive
    ? progressive.validationStatus
    : routeAmbiguity.validationStatus;

  return {
    isGlobal,
    isContextual,
    isProgressive,
    isRoute,
    graphContext,
    objectCount,
    eventCount: isProgressive ? progressive.includedEvents.size : 0,
    metricCount: isProgressive ? progressive.includedMetrics.size : 0,
    relationshipCount: relCount,
    validationStatus,
  };
}
