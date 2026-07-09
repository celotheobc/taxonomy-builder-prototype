import { useEffect, useMemo } from 'react';
import { isDemoCycleQuartetComplete } from '../../data/demoScenario';
import { SELECTION_TYPES } from '../../pages/v1_5/selection/usePerspectiveSelection';
import { CONTEXT_STEPS, SCRATCH_STEPS } from './demoTourSteps';

function setIncludes(set, id) {
  return set?.has?.(id) ?? false;
}

function evaluateScratchStep(id, ctx) {
  const {
    activeTab,
    refine,
    events,
    milestones,
    contextOnBrowse,
  } = ctx;
  const objects = refine?.includedObjects;
  const isRefine = activeTab?.type === 'refine';

  switch (id) {
    case 'intro':
      return contextOnBrowse || isRefine;
    case 'create-perspective':
      return events.scratchPerspectiveCreated;
    case 'tab-opened':
      return isRefine && refine && !refine.hasStarted;
    case 'seed-sales-order':
      return setIncludes(objects, 'sales-order');
    case 'ghosts-explained':
      return setIncludes(objects, 'sales-order');
    case 'inspector-contextual':
      return (
        milestones.objectSelectedOnce ||
        (refine?.selection?.type === SELECTION_TYPES.OBJECT)
      );
    case 'canvas-focus':
      return milestones.canvasAfterObjectOnce;
    case 'add-customer':
      return setIncludes(objects, 'customer');
    case 'add-delivery-item':
      return setIncludes(objects, 'delivery-item');
    case 'add-delivery':
      return setIncludes(objects, 'delivery');
    case 'resolve-cycle':
      return (
        milestones.cycleResolvedOnce ||
        (refine?.prunedRelationshipIds?.size > 0 && refine?.isCycleResolved)
      );
    case 'add-disconnected':
      return (
        milestones.connectionPromptSeen ||
        refine?.connectionPrompt != null ||
        setIncludes(objects, 'vendor-hub')
      );
    case 'vendor-hub-path':
      return setIncludes(objects, 'vendor-hub');
    case 'event-discovery':
      return (
        milestones.eventFilterToggledOnce ||
        (refine?.discoveryFilters?.events && !refine?.discoveryFilters?.objects)
      );
    case 'add-events':
      return (refine?.includedEvents?.size ?? 0) > 0;
    case 'inventory-tabs':
      return milestones.bottomInventoryUsedOnce;
    case 'finish':
      return (
        milestones.scratchFinishedOnce ||
        SCRATCH_STEPS.filter((step) => step.id !== 'finish').every((step) =>
          evaluateScratchStep(step.id, ctx),
        )
      );
    default:
      return false;
  }
}

function evaluateContextStep(id, ctx) {
  const { activeTab, contextState, events, milestones } = ctx;
  const basketCount =
    (contextState?.selectedObjects?.size ?? 0) +
    (contextState?.selectedEvents?.size ?? 0);

  switch (id) {
    case 'cm-intro':
      return activeTab?.type === 'context';
    case 'cm-select-assets':
      return contextState?.selectionMode || milestones.contextSelectionEnteredOnce;
    case 'cm-choose-assets':
      return basketCount > 0;
    case 'cm-add-to-perspective':
      return events.contextPerspectiveCreated || milestones.contextAddClickedOnce;
    case 'cm-new-perspective':
      return events.contextPerspectiveCreated;
    case 'cm-tab-opened':
      return (
        events.contextPerspectiveCreated &&
        activeTab?.type === 'refine' &&
        (activeTab?.payload?.objects?.length > 0 ||
          activeTab?.payload?.events?.length > 0)
      );
    case 'cm-finish':
      return (
        milestones.contextFinishedOnce ||
        CONTEXT_STEPS.filter((step) => step.id !== 'cm-finish').every((step) =>
          evaluateContextStep(step.id, ctx),
        )
      );
    default:
      return false;
  }
}

export function useDemoTourProgress({
  activeTab,
  contextState,
  refineState,
  events,
  milestones,
  mergeMilestone,
}) {
  const contextOnBrowse = activeTab?.type === 'context';

  useEffect(() => {
    if (!refineState) return;

    if (refineState.selection?.type === SELECTION_TYPES.OBJECT) {
      mergeMilestone('objectSelectedOnce');
    }
    if (
      refineState.selection?.type === SELECTION_TYPES.CANVAS &&
      milestones.objectSelectedOnce
    ) {
      mergeMilestone('canvasAfterObjectOnce');
    }
    if (refineState.highlightedRelationshipId) {
      mergeMilestone('cycleHoveredOnce');
    }
    if (refineState.cycleActive) {
      mergeMilestone('cycleSeenOnce');
    }
    if (refineState.prunedRelationshipIds?.size > 0 && refineState.isCycleResolved) {
      mergeMilestone('cycleResolvedOnce');
    }
    if (refineState.connectionPrompt) {
      mergeMilestone('connectionPromptSeen');
    }
    if (
      refineState.discoveryFilters?.events &&
      !refineState.discoveryFilters?.objects
    ) {
      mergeMilestone('eventFilterToggledOnce');
    }
    if (
      refineState.bottomTab === 'relationships' ||
      refineState.bottomTab === 'events'
    ) {
      mergeMilestone('bottomInventoryUsedOnce');
    }
  }, [refineState, milestones.objectSelectedOnce, mergeMilestone]);

  useEffect(() => {
    if (contextState?.selectionMode) {
      mergeMilestone('contextSelectionEnteredOnce');
    }
  }, [contextState?.selectionMode, mergeMilestone]);

  const scratchCompleted = useMemo(() => {
    const ctx = {
      activeTab,
      refine: refineState,
      events,
      milestones,
      contextOnBrowse,
    };
    return SCRATCH_STEPS.filter((step) => evaluateScratchStep(step.id, ctx)).map(
      (step) => step.id,
    );
  }, [activeTab, refineState, events, milestones, contextOnBrowse]);

  const contextCompleted = useMemo(() => {
    const ctx = { activeTab, contextState, events, milestones };
    return CONTEXT_STEPS.filter((step) => evaluateContextStep(step.id, ctx)).map(
      (step) => step.id,
    );
  }, [activeTab, contextState, events, milestones]);

  const scratchProgress = scratchCompleted.length / SCRATCH_STEPS.length;
  const contextProgress = contextCompleted.length / CONTEXT_STEPS.length;

  const quartetComplete = isDemoCycleQuartetComplete(refineState?.includedObjects ?? new Set());

  return useMemo(
    () => ({
      scratchCompleted,
      contextCompleted,
      scratchProgress,
      contextProgress,
      quartetComplete,
    }),
    [
      scratchCompleted,
      contextCompleted,
      scratchProgress,
      contextProgress,
      quartetComplete,
    ],
  );
}
