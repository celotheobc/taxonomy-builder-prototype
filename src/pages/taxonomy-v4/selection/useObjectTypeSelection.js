import { useCallback, useState } from 'react';

export const SELECTION_TYPES = {
  OBJECT: 'object',
  ATTRIBUTE: 'attribute',
  BINDING: 'binding',
  SUBTYPE: 'subtype',
  RELATIONSHIP: 'relationship',
};

export function useObjectTypeSelection() {
  const [selection, setSelection] = useState({ type: SELECTION_TYPES.OBJECT, id: null });

  const selectObject = useCallback(() => {
    setSelection({ type: SELECTION_TYPES.OBJECT, id: null });
  }, []);

  const selectAttribute = useCallback((id) => {
    setSelection({ type: SELECTION_TYPES.ATTRIBUTE, id });
  }, []);

  const selectBinding = useCallback((id) => {
    setSelection({ type: SELECTION_TYPES.BINDING, id });
  }, []);

  const selectSubtype = useCallback((id) => {
    setSelection({ type: SELECTION_TYPES.SUBTYPE, id });
  }, []);

  const selectRelationship = useCallback((id) => {
    setSelection({ type: SELECTION_TYPES.RELATIONSHIP, id });
  }, []);

  return {
    selection,
    selectObject,
    selectAttribute,
    selectBinding,
    selectSubtype,
    selectRelationship,
  };
}
