import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findCycleEdgeIds, hasObjectCycle } from '../data/cycleDetection';
import {
  eventLinks,
  eventSources,
  metricLinks,
  metrics,
  objects,
  relationships,
} from '../data/mockData';
import {
  findPathsToIncluded,
  objectTouchesIncluded,
  pathWouldCreateObjectCycle,
} from '../utils/graphPaths';
import {
  getAllSuggestedObjectNeighbours,
  getDiscoveryCountsForObject,
  getSuggestedObjectNeighbours,
} from '../utils/objectDiscovery';
import { useToast } from './useToast';

const DEFAULT_FILTERS = { objects: true, events: false, metrics: false };

export function useProgressiveBuilder(discoveryMode = 'global', options = {}) {
  const {
    unfocusedShowsAllGhosts = false,
    autoSuppressSuggestionsOnResolution = false,
    initialIncludedObjects = [],
    initialIncludedEvents = [],
  } = options;
  const isContextual = discoveryMode === 'contextual';

  const [includedObjects, setIncludedObjects] = useState(
    () => new Set(initialIncludedObjects),
  );
  const [includedEvents, setIncludedEvents] = useState(
    () => new Set(initialIncludedEvents),
  );
  const [includedMetrics, setIncludedMetrics] = useState(new Set());
  const [prunedRelationshipIds, setPrunedRelationshipIds] = useState(new Set());
  const [showOnlyIncluded, setShowOnlyIncluded] = useState(false);
  const { toast, showToast, dismissToast } = useToast();
  const [lastFocusedNodeId, setLastFocusedNodeId] = useState(null);
  const [connectionPrompt, setConnectionPrompt] = useState(null);
  const [previewBridgePathId, setPreviewBridgePathId] = useState(null);
  const [discoveryFilters, setDiscoveryFilters] = useState({ ...DEFAULT_FILTERS });
  const [contextualSelection, setContextualSelection] = useState(null);
  const suggestionsBeforeSuppress = useRef(null);

  const hasStarted = includedObjects.size > 0;

  const activeRelationships = useMemo(
    () => relationships.filter((r) => !prunedRelationshipIds.has(r.id)),
    [prunedRelationshipIds],
  );

  const cycleActive = hasObjectCycle(includedObjects, activeRelationships);
  const cycleEdgeIds = useMemo(
    () => findCycleEdgeIds(includedObjects, activeRelationships),
    [includedObjects, activeRelationships],
  );
  const isCycleResolved = !cycleActive;

  const expansionAnchorId = useMemo(() => {
    if (!hasStarted) return null;
    if (lastFocusedNodeId && includedObjects.has(lastFocusedNodeId)) {
      return lastFocusedNodeId;
    }
    if (unfocusedShowsAllGhosts) return null;
    return [...includedObjects][0] ?? null;
  }, [hasStarted, lastFocusedNodeId, includedObjects, unfocusedShowsAllGhosts]);

  const discoveryAnchorId = useMemo(() => {
    if (isContextual && contextualSelection?.objectId) {
      return contextualSelection.objectId;
    }
    return expansionAnchorId;
  }, [isContextual, contextualSelection, expansionAnchorId]);

  const contextualCounts = useMemo(() => {
    if (!isContextual || !contextualSelection?.objectId) return null;
    return getDiscoveryCountsForObject(contextualSelection.objectId, {
      includedObjects,
      includedEvents,
      includedMetrics,
      relationshipList: activeRelationships,
      cycleResolved: isCycleResolved,
    });
  }, [
    isContextual,
    contextualSelection,
    includedObjects,
    includedEvents,
    includedMetrics,
    activeRelationships,
  ]);

  const showDiscoverObjects = useMemo(() => {
    if (cycleActive) return false;
    if (isContextual) {
      if (!contextualSelection) return discoveryFilters.objects;
      return contextualSelection.revealedCategory === 'objects';
    }
    return discoveryFilters.objects;
  }, [
    cycleActive,
    isContextual,
    contextualSelection,
    discoveryFilters.objects,
  ]);

  const showDiscoverEvents = useMemo(() => {
    if (cycleActive) return false;
    if (isContextual) {
      return contextualSelection?.revealedCategory === 'events';
    }
    return discoveryFilters.events;
  }, [cycleActive, isContextual, contextualSelection, discoveryFilters.events]);

  const showDiscoverMetrics = useMemo(() => {
    if (cycleActive) return false;
    if (isContextual) {
      return contextualSelection?.revealedCategory === 'metrics';
    }
    return discoveryFilters.metrics;
  }, [cycleActive, isContextual, contextualSelection, discoveryFilters.metrics]);

  const pendingObjectId = connectionPrompt?.addedId ?? null;

  const previewBridge = useMemo(() => {
    if (!previewBridgePathId || !connectionPrompt?.paths?.length) {
      return {
        relationshipIds: new Set(),
        objectIds: new Set(),
        wouldCreateCycle: false,
      };
    }
    const path = connectionPrompt.paths.find((p) => p.id === previewBridgePathId);
    if (!path) {
      return {
        relationshipIds: new Set(),
        objectIds: new Set(),
        wouldCreateCycle: false,
      };
    }
    return {
      relationshipIds: new Set(path.relationshipIds),
      objectIds: new Set(path.objectIds),
      wouldCreateCycle: Boolean(path.wouldCreateCycle),
    };
  }, [connectionPrompt, previewBridgePathId]);

  const addableObjects = useMemo(() => {
    if (!showDiscoverObjects) return new Set();
    if (!discoveryAnchorId) {
      if (unfocusedShowsAllGhosts && includedObjects.size > 0) {
        return getAllSuggestedObjectNeighbours(includedObjects, activeRelationships, {
          cycleResolved: isCycleResolved,
        });
      }
      return new Set();
    }
    if (isContextual && contextualCounts) {
      return contextualCounts.objectIds;
    }
    return getSuggestedObjectNeighbours(
      discoveryAnchorId,
      includedObjects,
      activeRelationships,
      { cycleResolved: isCycleResolved },
    );
  }, [
    showDiscoverObjects,
    discoveryAnchorId,
    unfocusedShowsAllGhosts,
    includedObjects,
    isContextual,
    contextualCounts,
    activeRelationships,
    isCycleResolved,
  ]);

  const addableEvents = useMemo(() => {
    if (!showDiscoverEvents) return new Set();
    if (isContextual && contextualCounts) {
      return contextualCounts.eventIds;
    }
    const ids = new Set();
    for (const link of eventLinks) {
      if (
        includedObjects.has(link.objectId) &&
        !includedEvents.has(link.eventId)
      ) {
        ids.add(link.eventId);
      }
    }
    return ids;
  }, [
    showDiscoverEvents,
    isContextual,
    contextualCounts,
    includedObjects,
    includedEvents,
  ]);

  const addableMetrics = useMemo(() => {
    if (!showDiscoverMetrics) return new Set();
    if (isContextual && contextualCounts) {
      return contextualCounts.metricIds;
    }
    const ids = new Set();
    for (const link of metricLinks) {
      if (
        includedObjects.has(link.objectId) &&
        !includedMetrics.has(link.metricId)
      ) {
        ids.add(link.metricId);
      }
    }
    return ids;
  }, [
    showDiscoverMetrics,
    isContextual,
    contextualCounts,
    includedObjects,
    includedMetrics,
  ]);

  const visibleObjects = useMemo(() => {
    if (!hasStarted) return new Set();
    const visible = new Set(includedObjects);
    if (pendingObjectId) visible.add(pendingObjectId);
    previewBridge.objectIds.forEach((id) => visible.add(id));
    if (!showOnlyIncluded) {
      if (showDiscoverObjects) {
        addableObjects.forEach((id) => visible.add(id));
      }
    }
    return visible;
  }, [
    hasStarted,
    includedObjects,
    showOnlyIncluded,
    showDiscoverObjects,
    addableObjects,
    previewBridge,
    pendingObjectId,
  ]);

  const includedRelationshipIds = useMemo(() => {
    const ids = new Set();
    for (const r of activeRelationships) {
      if (includedObjects.has(r.source) && includedObjects.has(r.target)) {
        ids.add(r.id);
      }
    }
    return ids;
  }, [includedObjects, activeRelationships]);

  const toggleDiscoveryFilter = useCallback((key) => {
    setDiscoveryFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => {
    if (!autoSuppressSuggestionsOnResolution) return undefined;

    const suppressed = cycleActive || Boolean(connectionPrompt);
    if (suppressed) {
      if (suggestionsBeforeSuppress.current === null) {
        suggestionsBeforeSuppress.current = showOnlyIncluded;
        setShowOnlyIncluded(true);
      }
    } else if (suggestionsBeforeSuppress.current !== null) {
      setShowOnlyIncluded(suggestionsBeforeSuppress.current);
      suggestionsBeforeSuppress.current = null;
    }
    return undefined;
  }, [autoSuppressSuggestionsOnResolution, cycleActive, connectionPrompt]);

  useEffect(() => {
    if (cycleActive) {
      setContextualSelection(null);
      setLastFocusedNodeId(null);
    }
  }, [cycleActive]);

  const clearExpansionFocus = useCallback(() => {
    setLastFocusedNodeId(null);
  }, []);

  const openContextualMenu = useCallback((objectId) => {
    if (!includedObjects.has(objectId)) return;
    setLastFocusedNodeId(objectId);
    setContextualSelection({ objectId, revealedCategory: null });
  }, [includedObjects]);

  const revealContextualCategory = useCallback((category) => {
    setContextualSelection((prev) =>
      prev ? { ...prev, revealedCategory: category } : prev,
    );
  }, []);

  const closeContextualMenu = useCallback(() => {
    setContextualSelection(null);
  }, []);

  const addObject = useCallback(
    (id, options = {}) => {
      const forceDisconnected = options.disconnected === true;
      const name = objects.find((o) => o.id === id)?.name ?? id;
      setLastFocusedNodeId(id);
      setPreviewBridgePathId(null);

      setIncludedObjects((prev) => {
        const touches = objectTouchesIncluded(id, prev, activeRelationships);
        const isDisconnectedAdd = forceDisconnected || (prev.size > 0 && !touches);

        if (isDisconnectedAdd) {
          const paths = findPathsToIncluded(id, prev, activeRelationships, {
            minHops: 2,
          }).map((p) => ({
            ...p,
            wouldCreateCycle:
              p.wouldCreateCycle ??
              pathWouldCreateObjectCycle(prev, p, activeRelationships),
          }));
          setConnectionPrompt({ addedId: id, paths });
          showToast(`Choose how to connect ${name}`);
          return prev;
        }

        setConnectionPrompt(null);
        const next = new Set([...prev, id]);
        if (
          hasObjectCycle(next, activeRelationships) &&
          !hasObjectCycle(prev, activeRelationships)
        ) {
          setTimeout(
            () =>
              showToast(
                'Cycle detected — remove one highlighted connection on the graph',
              ),
            400,
          );
        }
        showToast(`${name} added to perspective`);
        return next;
      });
    },
    [showToast, activeRelationships],
  );

  const previewConnectionPath = useCallback((pathId) => {
    setPreviewBridgePathId(pathId);
  }, []);

  const clearConnectionPathPreview = useCallback(() => {
    setPreviewBridgePathId(null);
  }, []);

  const confirmConnectionPath = useCallback((pathId) => {
    const chosenId = pathId ?? previewBridgePathId;
    const path = connectionPrompt?.paths?.find((p) => p.id === chosenId);
    if (!path) return;

    setIncludedObjects((prev) => {
      const next = new Set(prev);
      path.objectIds.forEach((oid) => next.add(oid));
      if (connectionPrompt?.addedId) next.add(connectionPrompt.addedId);
      if (
        hasObjectCycle(next, activeRelationships) &&
        !hasObjectCycle(prev, activeRelationships)
      ) {
        setTimeout(
          () =>
            showToast(
              'Cycle detected — remove one highlighted connection on the graph',
            ),
          400,
        );
      }
      return next;
    });
    setConnectionPrompt(null);
    setPreviewBridgePathId(null);
    showToast(`Included path: ${path.label}`);
  }, [connectionPrompt, previewBridgePathId, showToast, activeRelationships]);

  const insertConnectionPath = useCallback(
    (pathId) => {
      confirmConnectionPath(pathId);
    },
    [confirmConnectionPath],
  );

  const keepObjectsUnconnected = useCallback(() => {
    const pendingId = connectionPrompt?.addedId;
    if (pendingId) {
      setIncludedObjects((prev) => new Set([...prev, pendingId]));
      const name = objects.find((o) => o.id === pendingId)?.name ?? pendingId;
      showToast(`${name} added (disconnected)`);
    }
    setConnectionPrompt(null);
    setPreviewBridgePathId(null);
  }, [connectionPrompt, showToast]);

  const addEvent = useCallback(
    (id) => {
      setLastFocusedNodeId(`event-${id}`);
      setIncludedEvents((prev) => new Set([...prev, id]));
      showToast(`${eventSources.find((e) => e.id === id)?.name ?? id} added`);
    },
    [showToast],
  );

  const focusExpansionFrom = useCallback(
    (objectId, { silent = false } = {}) => {
      if (!includedObjects.has(objectId)) return;
      if (isContextual) {
        openContextualMenu(objectId);
        return;
      }
      setLastFocusedNodeId(objectId);
      if (!silent) {
        const name = objects.find((o) => o.id === objectId)?.name ?? objectId;
        showToast(`Exploring from ${name}`);
      }
    },
    [includedObjects, isContextual, openContextualMenu, showToast],
  );

  const addMetric = useCallback(
    (id) => {
      setLastFocusedNodeId(`metric-${id}`);
      setIncludedMetrics((prev) => new Set([...prev, id]));
      showToast(`${metrics.find((m) => m.id === id)?.name ?? id} added`);
    },
    [showToast],
  );

  const addRelationship = useCallback(
    (relId) => {
      const rel = relationships.find((r) => r.id === relId);
      if (!rel) return;

      setPrunedRelationshipIds((prev) => {
        if (!prev.has(relId)) return prev;
        const next = new Set(prev);
        next.delete(relId);
        return next;
      });

      setIncludedObjects((prev) => {
        const next = new Set([...prev, rel.source, rel.target]);
        if (
          hasObjectCycle(next, activeRelationships) &&
          !hasObjectCycle(prev, activeRelationships)
        ) {
          setTimeout(
            () =>
              showToast(
                'Cycle detected — remove one highlighted connection on the graph',
              ),
            400,
          );
        }
        return next;
      });

      const sourceName = objects.find((o) => o.id === rel.source)?.name ?? rel.source;
      const targetName = objects.find((o) => o.id === rel.target)?.name ?? rel.target;
      setLastFocusedNodeId(rel.target);
      showToast(`${sourceName} → ${targetName} added to perspective`);
    },
    [showToast, activeRelationships],
  );

  const removeObject = useCallback(
    (id) => {
      const name = objects.find((o) => o.id === id)?.name ?? id;
      setIncludedObjects((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (lastFocusedNodeId === id) setLastFocusedNodeId(null);
      showToast(`${name} removed from perspective`);
    },
    [showToast, lastFocusedNodeId],
  );

  const removeEvent = useCallback(
    (id) => {
      const name = eventSources.find((e) => e.id === id)?.name ?? id;
      setIncludedEvents((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showToast(`${name} removed from perspective`);
    },
    [showToast],
  );

  const removeMetric = useCallback(
    (id) => {
      const name = metrics.find((m) => m.id === id)?.name ?? id;
      setIncludedMetrics((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showToast(`${name} removed from perspective`);
    },
    [showToast],
  );

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

  const validationStatus = useMemo(() => {
    if (!hasStarted) return 'Incomplete';
    if (cycleActive) return 'Needs resolution';
    return 'Valid';
  }, [hasStarted, cycleActive]);

  const seedFromAssets = useCallback(
    (objectIds, eventIds = []) => {
      setIncludedObjects(new Set(objectIds));
      setIncludedEvents(new Set(eventIds));
      setConnectionPrompt(null);
      setPreviewBridgePathId(null);
      setPrunedRelationshipIds(new Set());
      setLastFocusedNodeId(objectIds[0] ?? null);
      showToast('Perspective seeded from process');
    },
    [showToast],
  );

  return {
    discoveryMode,
    hasStarted,
    includedObjects,
    includedEvents,
    includedMetrics,
    visibleObjects,
    addableObjects,
    addableEvents,
    addableMetrics,
    showDiscoverObjects,
    showDiscoverEvents,
    showDiscoverMetrics,
    discoveryFilters,
    toggleDiscoveryFilter,
    contextualSelection,
    contextualCounts,
    openContextualMenu,
    revealContextualCategory,
    closeContextualMenu,
    includedRelationshipIds,
    activeRelationships,
    showOnlyIncluded,
    setShowOnlyIncluded,
    addObject,
    addEvent,
    addMetric,
    addRelationship,
    removeObject,
    removeEvent,
    removeMetric,
    toast,
    validationStatus,
    eventLinks,
    metricLinks,
    cycleActive,
    isCycleResolved,
    cycleEdgeIds,
    routeAmbiguityActive: cycleActive,
    isRouteResolved: isCycleResolved,
    conflictingEdges: cycleEdgeIds,
    routeExcluded: prunedRelationshipIds,
    pruneRelationship,
    lastFocusedNodeId,
    expansionAnchorId,
    discoveryAnchorId,
    focusExpansionFrom,
    clearExpansionFocus,
    pendingObjectId,
    connectionPrompt,
    previewBridgePathId,
    previewBridgeRelationshipIds: previewBridge.relationshipIds,
    previewBridgeWouldCreateCycle: previewBridge.wouldCreateCycle,
    bridgePreviewObjectIds: previewBridge.objectIds,
    previewConnectionPath,
    clearConnectionPathPreview,
    confirmConnectionPath,
    insertConnectionPath,
    keepObjectsUnconnected,
    seedFromAssets,
  };
}
