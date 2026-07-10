import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  buildSubtypeTemplates,
  buildTaxonomyAsset,
  getObjectType,
} from '../../../data/mockObjectTypes';
import {
  UNGROUPED_GROUP_ID,
  createEmptyHierarchy,
  createGroupId,
} from '../../../data/taxonomyHierarchy';

const ObjectTypeWorkspaceContext = createContext(null);

export const SUBTYPES_UI_MODE = {
  CREATION: 'creation',
  MANAGEMENT: 'management',
};

function createEmptySplitState() {
  return {
    uiMode: SUBTYPES_UI_MODE.CREATION,
    selectedAttributeId: null,
    splitsByAttributeId: {},
  };
}

function getVisibleSubtypes(split) {
  return split?.subtypes?.filter((subtype) => !subtype.hidden) ?? [];
}

export function getSplitForAttribute(state, attributeId) {
  if (!attributeId) return null;
  return state.splitsByAttributeId[attributeId] ?? null;
}

export function hasSubtypesForAttribute(state, attributeId) {
  const split = getSplitForAttribute(state, attributeId);
  return getVisibleSubtypes(split).length > 0;
}

export function getSubtypeCountForAttribute(state, attributeId) {
  return getVisibleSubtypes(getSplitForAttribute(state, attributeId)).length;
}

export function getAllSubtypeEntries(state) {
  return Object.entries(state.splitsByAttributeId).flatMap(([attributeId, split]) =>
    getVisibleSubtypes(split).map((subtype) => ({
      subtype,
      splitAttributeId: attributeId,
      taxonomy: split.taxonomy,
    })),
  );
}

function withDefaults(state, objectTypeId) {
  if (state) return state;
  return createEmptySplitState(objectTypeId);
}

export function ObjectTypeWorkspaceProvider({ children }) {
  const [splitByObjectId, setSplitByObjectId] = useState({
    'jira-issue': createEmptySplitState(),
    factory: createEmptySplitState(),
  });
  const [taxonomyOverrides, setTaxonomyOverrides] = useState({});
  const [taxonomyHierarchyById, setTaxonomyHierarchyById] = useState({});

  const updateSplitState = useCallback((objectTypeId, updater) => {
    setSplitByObjectId((prev) => {
      const current = withDefaults(prev[objectTypeId], objectTypeId);
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [objectTypeId]: next };
    });
  }, []);

  const setSubtypesUiMode = useCallback((objectTypeId, uiMode) => {
    updateSplitState(objectTypeId, (current) => ({ ...current, uiMode }));
  }, [updateSplitState]);

  const selectSplitAttribute = useCallback((objectTypeId, attributeId) => {
    updateSplitState(objectTypeId, (current) => ({
      ...current,
      uiMode: SUBTYPES_UI_MODE.CREATION,
      selectedAttributeId: attributeId,
    }));
  }, [updateSplitState]);

  const openCreationWithAttribute = useCallback((objectTypeId, attributeId) => {
    selectSplitAttribute(objectTypeId, attributeId);
  }, [selectSplitAttribute]);

  const manageSplit = useCallback((objectTypeId) => {
    updateSplitState(objectTypeId, (current) => ({
      ...current,
      uiMode: SUBTYPES_UI_MODE.CREATION,
      selectedAttributeId: current.splitAttributeId ?? current.selectedAttributeId,
    }));
  }, [updateSplitState]);

  const addAnotherSplit = useCallback((objectTypeId) => {
    updateSplitState(objectTypeId, (current) => ({
      ...current,
      uiMode: SUBTYPES_UI_MODE.CREATION,
      selectedAttributeId: null,
    }));
  }, [updateSplitState]);

  const generateSubtypes = useCallback((objectTypeId, attributeIdOverride, selectedMatchingValues = null) => {
    const objectType = getObjectType(objectTypeId);
    if (!objectType) return null;

    let createdTaxonomy = null;
    setSplitByObjectId((prev) => {
      const current = withDefaults(prev[objectTypeId], objectTypeId);
      const attributeId = attributeIdOverride ?? current.selectedAttributeId;
      if (!attributeId) return prev;

      const subtypes = buildSubtypeTemplates(objectType, attributeId, selectedMatchingValues).map(
        (subtype) => ({
          ...subtype,
          description: subtype.description ?? '',
        }),
      );
      if (!subtypes.length) return prev;

      const taxonomy = buildTaxonomyAsset(objectType, attributeId, subtypes);
      createdTaxonomy = taxonomy;

      return {
        ...prev,
        [objectTypeId]: {
          ...current,
          uiMode: SUBTYPES_UI_MODE.CREATION,
          selectedAttributeId: attributeId,
          splitsByAttributeId: {
            ...current.splitsByAttributeId,
            [attributeId]: { subtypes, taxonomy },
          },
        },
      };
    });

    return createdTaxonomy;
  }, []);

  const deleteSplitForAttribute = useCallback((objectTypeId, attributeId) => {
    updateSplitState(objectTypeId, (current) => {
      const nextSplits = { ...current.splitsByAttributeId };
      delete nextSplits[attributeId];
      return { ...current, splitsByAttributeId: nextSplits };
    });
  }, [updateSplitState]);

  const regenerateSubtypes = useCallback((objectTypeId, attributeId, selectedMatchingValues = null) => {
    return generateSubtypes(objectTypeId, attributeId, selectedMatchingValues);
  }, [generateSubtypes]);

  const renameSubtype = useCallback((objectTypeId, subtypeId, label) => {
    updateSplitState(objectTypeId, (current) => {
      const nextSplits = { ...current.splitsByAttributeId };
      let changed = false;

      Object.keys(nextSplits).forEach((attributeId) => {
        const split = nextSplits[attributeId];
        const subtypes = split.subtypes.map((subtype) =>
          subtype.id === subtypeId ? { ...subtype, label } : subtype,
        );
        if (subtypes !== split.subtypes) {
          changed = true;
          nextSplits[attributeId] = {
            ...split,
            subtypes,
            taxonomy: split.taxonomy
              ? {
                  ...split.taxonomy,
                  subtypes,
                  subtypeCount: subtypes.filter((s) => !s.hidden).length,
                }
              : null,
          };
        }
      });

      return changed ? { ...current, splitsByAttributeId: nextSplits } : current;
    });
  }, [updateSplitState]);

  const updateSubtypeDescription = useCallback((objectTypeId, subtypeId, description) => {
    updateSplitState(objectTypeId, (current) => {
      const nextSplits = { ...current.splitsByAttributeId };

      Object.keys(nextSplits).forEach((attributeId) => {
        const split = nextSplits[attributeId];
        nextSplits[attributeId] = {
          ...split,
          subtypes: split.subtypes.map((subtype) =>
            subtype.id === subtypeId ? { ...subtype, description } : subtype,
          ),
        };
      });

      return { ...current, splitsByAttributeId: nextSplits };
    });
  }, [updateSplitState]);

  const deleteSubtype = useCallback((objectTypeId, subtypeId) => {
    updateSplitState(objectTypeId, (current) => {
      const nextSplits = { ...current.splitsByAttributeId };

      Object.keys(nextSplits).forEach((attributeId) => {
        const split = nextSplits[attributeId];
        const subtypes = split.subtypes.map((subtype) =>
          subtype.id === subtypeId ? { ...subtype, hidden: true } : subtype,
        );
        const visibleCount = subtypes.filter((s) => !s.hidden).length;
        nextSplits[attributeId] = {
          ...split,
          subtypes,
          taxonomy: split.taxonomy
            ? { ...split.taxonomy, subtypes, subtypeCount: visibleCount }
            : null,
        };
        if (visibleCount === 0) {
          delete nextSplits[attributeId];
        }
      });

      return { ...current, splitsByAttributeId: nextSplits };
    });
  }, [updateSplitState]);

  const updateTaxonomyHierarchy = useCallback((taxonomyId, updater) => {
    setTaxonomyHierarchyById((prev) => {
      const current = prev[taxonomyId] ?? createEmptyHierarchy();
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [taxonomyId]: next };
    });
  }, []);

  const getTaxonomyHierarchy = useCallback(
    (taxonomyId) => taxonomyHierarchyById[taxonomyId] ?? createEmptyHierarchy(),
    [taxonomyHierarchyById],
  );

  const addTaxonomyGroup = useCallback((taxonomyId, { label, parentId = null, description = '' }) => {
    const trimmed = label?.trim();
    if (!trimmed) return null;
    const group = {
      id: createGroupId(trimmed),
      label: trimmed,
      description,
      parentId,
      memberIds: [],
    };
    updateTaxonomyHierarchy(taxonomyId, (current) => ({
      groups: [...current.groups, group],
    }));
    return group.id;
  }, [updateTaxonomyHierarchy]);

  const renameTaxonomyGroup = useCallback((taxonomyId, groupId, label) => {
    const trimmed = label?.trim();
    if (!trimmed) return;
    updateTaxonomyHierarchy(taxonomyId, (current) => ({
      groups: current.groups.map((group) =>
        group.id === groupId ? { ...group, label: trimmed } : group,
      ),
    }));
  }, [updateTaxonomyHierarchy]);

  const updateTaxonomyGroupDescription = useCallback((taxonomyId, groupId, description) => {
    updateTaxonomyHierarchy(taxonomyId, (current) => ({
      groups: current.groups.map((group) =>
        group.id === groupId ? { ...group, description } : group,
      ),
    }));
  }, [updateTaxonomyHierarchy]);

  const addMembersToTaxonomyGroup = useCallback((taxonomyId, groupId, memberIds) => {
    if (!memberIds?.length || groupId === UNGROUPED_GROUP_ID) return;
    const uniqueIds = [...new Set(memberIds)];
    updateTaxonomyHierarchy(taxonomyId, (current) => ({
      groups: current.groups.map((group) =>
        group.id === groupId
          ? { ...group, memberIds: [...new Set([...group.memberIds, ...uniqueIds])] }
          : group,
      ),
    }));
  }, [updateTaxonomyHierarchy]);

  const removeMemberFromTaxonomyGroup = useCallback((taxonomyId, groupId, memberId) => {
    if (groupId === UNGROUPED_GROUP_ID) return;
    updateTaxonomyHierarchy(taxonomyId, (current) => ({
      groups: current.groups.map((group) =>
        group.id === groupId
          ? { ...group, memberIds: group.memberIds.filter((id) => id !== memberId) }
          : group,
      ),
    }));
  }, [updateTaxonomyHierarchy]);

  const updateTaxonomyMeta = useCallback((taxonomyId, patch) => {
    setTaxonomyOverrides((prev) => ({
      ...prev,
      [taxonomyId]: { ...prev[taxonomyId], ...patch },
    }));
  }, []);

  const getSplitState = useCallback(
    (objectTypeId) => withDefaults(splitByObjectId[objectTypeId], objectTypeId),
    [splitByObjectId],
  );

  const hasSubtypes = useCallback(
    (objectTypeId) => {
      const state = withDefaults(splitByObjectId[objectTypeId], objectTypeId);
      return getAllSubtypeEntries(state).length > 0;
    },
    [splitByObjectId],
  );

  const generatedTaxonomies = useMemo(() => {
    return Object.values(splitByObjectId)
      .flatMap((state) => Object.values(state?.splitsByAttributeId ?? {}))
      .map((split) => split?.taxonomy)
      .filter(Boolean)
      .map((taxonomy) => ({
        ...taxonomy,
        ...taxonomyOverrides[taxonomy.id],
      }));
  }, [splitByObjectId, taxonomyOverrides]);

  const getTaxonomy = useCallback(
    (taxonomyId) => {
      const base = generatedTaxonomies.find((item) => item.id === taxonomyId);
      return base ? { ...base, ...taxonomyOverrides[taxonomyId] } : null;
    },
    [generatedTaxonomies, taxonomyOverrides],
  );

  const value = useMemo(
    () => ({
      getSplitState,
      hasSubtypes,
      setSubtypesUiMode,
      selectSplitAttribute,
      openCreationWithAttribute,
      manageSplit,
      addAnotherSplit,
      generateSubtypes,
      regenerateSubtypes,
      deleteSplitForAttribute,
      renameSubtype,
      updateSubtypeDescription,
      deleteSubtype,
      getSplitForAttribute,
      hasSubtypesForAttribute,
      getAllSubtypeEntries,
      generatedTaxonomies,
      getTaxonomy,
      updateTaxonomyMeta,
      getTaxonomyHierarchy,
      addTaxonomyGroup,
      renameTaxonomyGroup,
      updateTaxonomyGroupDescription,
      addMembersToTaxonomyGroup,
      removeMemberFromTaxonomyGroup,
    }),
    [
      getSplitState,
      hasSubtypes,
      setSubtypesUiMode,
      selectSplitAttribute,
      openCreationWithAttribute,
      manageSplit,
      addAnotherSplit,
      generateSubtypes,
      regenerateSubtypes,
      deleteSplitForAttribute,
      renameSubtype,
      updateSubtypeDescription,
      deleteSubtype,
      generatedTaxonomies,
      getTaxonomy,
      updateTaxonomyMeta,
      getTaxonomyHierarchy,
      addTaxonomyGroup,
      renameTaxonomyGroup,
      updateTaxonomyGroupDescription,
      addMembersToTaxonomyGroup,
      removeMemberFromTaxonomyGroup,
    ],
  );

  return (
    <ObjectTypeWorkspaceContext.Provider value={value}>{children}</ObjectTypeWorkspaceContext.Provider>
  );
}

export function useObjectTypeWorkspace() {
  const context = useContext(ObjectTypeWorkspaceContext);
  if (!context) {
    throw new Error('useObjectTypeWorkspace must be used within ObjectTypeWorkspaceProvider');
  }
  return context;
}
