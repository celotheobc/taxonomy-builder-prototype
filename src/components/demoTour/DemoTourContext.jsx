import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useDemoTourProgress } from './useDemoTourProgress';

const DemoTourContext = createContext(null);

export function DemoTourProvider({
  children,
  activeTab,
  contextState,
  onFocusContextModel,
}) {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState('scratch');
  const [refineState, setRefineStateInner] = useState(null);
  const [events, setEvents] = useState({
    scratchPerspectiveCreated: false,
    contextPerspectiveCreated: false,
  });
  const [milestones, setMilestones] = useState({});

  const markEvent = useCallback((key) => {
    setEvents((prev) => ({ ...prev, [key]: true }));
  }, []);

  const mergeMilestone = useCallback((key) => {
    setMilestones((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const markFinished = useCallback(
    (tourRoute) => {
      if (tourRoute === 'scratch') mergeMilestone('scratchFinishedOnce');
      if (tourRoute === 'context') mergeMilestone('contextFinishedOnce');
    },
    [mergeMilestone],
  );

  const setRefineState = useCallback((state) => {
    setRefineStateInner((prev) => {
      if (prev === state) return prev;
      if (
        prev &&
        state &&
        prev.hasStarted === state.hasStarted &&
        prev.includedObjects === state.includedObjects &&
        prev.includedEvents === state.includedEvents &&
        prev.selection === state.selection &&
        prev.highlightedRelationshipId === state.highlightedRelationshipId &&
        prev.bottomTab === state.bottomTab &&
        prev.cycleActive === state.cycleActive &&
        prev.isCycleResolved === state.isCycleResolved &&
        prev.prunedRelationshipIds === state.prunedRelationshipIds &&
        prev.connectionPrompt === state.connectionPrompt &&
        prev.discoveryFilters === state.discoveryFilters
      ) {
        return prev;
      }
      return state;
    });
  }, []);

  const progress = useDemoTourProgress({
    activeTab,
    contextState,
    refineState,
    events,
    milestones,
    mergeMilestone,
  });

  const focusContextModel = useCallback(() => {
    onFocusContextModel?.();
  }, [onFocusContextModel]);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      route,
      setRoute,
      setRefineState,
      markEvent,
      markFinished,
      mergeMilestone,
      focusContextModel,
      ...progress,
    }),
    [
      open,
      route,
      markEvent,
      markFinished,
      mergeMilestone,
      setRefineState,
      focusContextModel,
      progress,
    ],
  );

  return (
    <DemoTourContext.Provider value={value}>{children}</DemoTourContext.Provider>
  );
}

export function useDemoTour() {
  const ctx = useContext(DemoTourContext);
  if (!ctx) {
    throw new Error('useDemoTour must be used within DemoTourProvider');
  }
  return ctx;
}

export function useDemoTourOptional() {
  return useContext(DemoTourContext);
}
