import { useCallback, useState } from 'react';

export const SELECTION_TYPES = {
  CANVAS: 'canvas',
  OBJECT: 'object',
  EVENT: 'event',
  METRIC: 'metric',
  RELATIONSHIP: 'relationship',
  CYCLE_EDGE: 'cycleEdge',
};

export function usePerspectiveSelection() {
  const [selection, setSelection] = useState({ type: SELECTION_TYPES.CANVAS });
  const [highlightedRelationshipId, setHighlightedRelationshipId] = useState(null);
  const [bottomTab, setBottomTab] = useState('objects');

  const selectCanvas = useCallback(() => {
    setSelection({ type: SELECTION_TYPES.CANVAS });
    setHighlightedRelationshipId(null);
  }, []);

  const selectObject = useCallback((id, state = 'included') => {
    setSelection({ type: SELECTION_TYPES.OBJECT, id, state });
    setHighlightedRelationshipId(null);
  }, []);

  const selectEvent = useCallback((id, state = 'included') => {
    setSelection({ type: SELECTION_TYPES.EVENT, id, state });
    setHighlightedRelationshipId(null);
  }, []);

  const selectMetric = useCallback((id, state = 'included') => {
    setSelection({ type: SELECTION_TYPES.METRIC, id, state });
    setHighlightedRelationshipId(null);
  }, []);

  const selectRelationship = useCallback((id, isCycleEdge = false) => {
    setSelection({
      type: isCycleEdge ? SELECTION_TYPES.CYCLE_EDGE : SELECTION_TYPES.RELATIONSHIP,
      id,
    });
    setHighlightedRelationshipId(id);
    setBottomTab(isCycleEdge ? 'issues' : 'relationships');
  }, []);

  const selectIssue = useCallback(() => {
    setSelection({ type: SELECTION_TYPES.CANVAS });
    setHighlightedRelationshipId(null);
    setBottomTab('issues');
  }, []);

  const hoverRelationship = useCallback((id) => {
    setHighlightedRelationshipId(id);
  }, []);

  const graphSelection = {
    selection,
    onSelectCanvas: selectCanvas,
    onSelectNode: ({ kind, id, state }) => {
      if (kind === 'object') selectObject(id, state);
      else if (kind === 'event') selectEvent(id, state);
      else if (kind === 'metric') selectMetric(id, state);
    },
    onSelectEdge: ({ id, isCycleEdge }) => selectRelationship(id, isCycleEdge),
    onHoverEdge: hoverRelationship,
  };

  return {
    selection,
    highlightedRelationshipId,
    bottomTab,
    setBottomTab,
    setHighlightedRelationshipId,
    selectCanvas,
    selectObject,
    selectEvent,
    selectMetric,
    selectRelationship,
    selectIssue,
    graphSelection,
  };
}
