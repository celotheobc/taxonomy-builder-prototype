import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  buildTaxonomyAsset,
  getDetectedValues,
  getObjectType,
} from '../../../data/mockObjectTypes';
import {
  UNGROUPED_GROUP_ID,
  createEmptyHierarchy,
  createGroupId,
  getDescendantGroupIds,
} from '../../../data/taxonomyHierarchy';
import {
  addValueNodesToTree,
  createEmptyTreeState,
  getDescendantNodeIds,
  getTreeSubtypeEntries,
  syncTreeTaxonomy,
} from '../../../data/taxonomyTreeModel';

const ObjectTypeWorkspaceContext = createContext(null);

function withDefaults(state) {
  return state ?? createEmptyTreeState();
}

export function getSubtypeCountForAttribute(state, attributeId) {
  return withDefaults(state).nodes.filter(
    (node) => node.createdByAttributeId === attributeId,
  ).length;
}

export function getAllSubtypeEntries(state) {
  return getTreeSubtypeEntries(withDefaults(state));
}

export function ObjectTypeWorkspaceProvider({ children }) {
  const [treeByObjectId, setTreeByObjectId] = useState({
    'jira-issue': createEmptyTreeState(),
    facility: createEmptyTreeState(),
  });
  const [taxonomyOverrides, setTaxonomyOverrides] = useState({});
  const [taxonomyHierarchyById, setTaxonomyHierarchyById] = useState({});

  const updateTreeState = useCallback((objectTypeId, updater) => {
    setTreeByObjectId((prev) => {
      const current = withDefaults(prev[objectTypeId]);
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [objectTypeId]: next };
    });
  }, []);

  const getTreeState = useCallback(
    (objectTypeId) => withDefaults(treeByObjectId[objectTypeId]),
    [treeByObjectId],
  );

  const getSplitState = getTreeState;

  const hasSubtypes = useCallback(
    (objectTypeId) => getTreeState(objectTypeId).nodes.length > 0,
    [getTreeState],
  );

  const addSubtypeValues = useCallback((objectTypeId, { parentId = null, attributeId, values }) => {
    const objectType = getObjectType(objectTypeId);
    if (!objectType || !attributeId || !values?.length) return null;

    let taxonomy = null;
    updateTreeState(objectTypeId, (current) => {
      const next = addValueNodesToTree(current, objectType, buildTaxonomyAsset, {
        parentId,
        attributeId,
        values,
      });
      taxonomy = next.taxonomy;
      return next;
    });
    return taxonomy;
  }, [updateTreeState]);

  const renameTreeNode = useCallback((objectTypeId, nodeId, label) => {
    const trimmed = label?.trim();
    if (!trimmed) return;

    updateTreeState(objectTypeId, (current) => {
      const objectType = getObjectType(objectTypeId);
      const nodes = current.nodes.map((node) =>
        node.id === nodeId ? { ...node, label: trimmed } : node,
      );
      return syncTreeTaxonomy(objectType, { ...current, nodes }, buildTaxonomyAsset);
    });
  }, [updateTreeState]);

  const deleteTreeNode = useCallback((objectTypeId, nodeId) => {
    updateTreeState(objectTypeId, (current) => {
      const objectType = getObjectType(objectTypeId);
      const removeIds = new Set(getDescendantNodeIds(nodeId, current.nodes));
      const nodes = current.nodes.filter((node) => !removeIds.has(node.id));
      return syncTreeTaxonomy(objectType, { ...current, nodes }, buildTaxonomyAsset);
    });
  }, [updateTreeState]);

  const clearTree = useCallback((objectTypeId) => {
    updateTreeState(objectTypeId, () => createEmptyTreeState());
  }, [updateTreeState]);

  const renameSubtype = renameTreeNode;
  const deleteSubtype = deleteTreeNode;

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

  const deleteTaxonomyGroup = useCallback((taxonomyId, groupId) => {
    if (groupId === UNGROUPED_GROUP_ID) return;
    updateTaxonomyHierarchy(taxonomyId, (current) => {
      const toRemove = new Set(getDescendantGroupIds(groupId, current.groups));
      return {
        groups: current.groups.filter((group) => !toRemove.has(group.id)),
      };
    });
  }, [updateTaxonomyHierarchy]);

  const updateTaxonomyMeta = useCallback((taxonomyId, patch) => {
    setTaxonomyOverrides((prev) => ({
      ...prev,
      [taxonomyId]: { ...prev[taxonomyId], ...patch },
    }));
  }, []);

  const generatedTaxonomies = useMemo(() => {
    return Object.values(treeByObjectId)
      .map((state) => state?.taxonomy)
      .filter(Boolean)
      .map((taxonomy) => ({
        ...taxonomy,
        ...taxonomyOverrides[taxonomy.id],
      }));
  }, [treeByObjectId, taxonomyOverrides]);

  const getTaxonomy = useCallback(
    (taxonomyId) => {
      const base = generatedTaxonomies.find((item) => item.id === taxonomyId);
      return base ? { ...base, ...taxonomyOverrides[taxonomyId] } : null;
    },
    [generatedTaxonomies, taxonomyOverrides],
  );

  const getAttributeValuesForSplit = useCallback((objectTypeId, attributeId) => {
    const objectType = getObjectType(objectTypeId);
    if (!objectType) return [];
    return getDetectedValues(objectType, attributeId);
  }, []);

  const value = useMemo(
    () => ({
      getTreeState,
      getSplitState,
      hasSubtypes,
      addSubtypeValues,
      renameTreeNode,
      deleteTreeNode,
      clearTree,
      renameSubtype,
      deleteSubtype,
      getAllSubtypeEntries,
      getSubtypeCountForAttribute,
      getAttributeValuesForSplit,
      generatedTaxonomies,
      getTaxonomy,
      updateTaxonomyMeta,
      getTaxonomyHierarchy,
      addTaxonomyGroup,
      renameTaxonomyGroup,
      updateTaxonomyGroupDescription,
      addMembersToTaxonomyGroup,
      removeMemberFromTaxonomyGroup,
      deleteTaxonomyGroup,
    }),
    [
      getTreeState,
      getSplitState,
      hasSubtypes,
      addSubtypeValues,
      renameTreeNode,
      deleteTreeNode,
      clearTree,
      generatedTaxonomies,
      getTaxonomy,
      updateTaxonomyMeta,
      getTaxonomyHierarchy,
      addTaxonomyGroup,
      renameTaxonomyGroup,
      updateTaxonomyGroupDescription,
      addMembersToTaxonomyGroup,
      removeMemberFromTaxonomyGroup,
      deleteTaxonomyGroup,
      getAttributeValuesForSplit,
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
