import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  buildTaxonomyAsset,
  getAttribute,
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
  getAncestorIds,
  getDescendantNodeIds,
  getHierarchyStats,
  getNodeDepth,
  getSubtypeMappingRows,
  getTreeSubtypeEntries,
  MAX_HIERARCHY_DEPTH,
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

export { getHierarchyStats, getNodeDepth, MAX_HIERARCHY_DEPTH };

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

  const toggleNodeExpanded = useCallback((objectTypeId, nodeId) => {
    updateTreeState(objectTypeId, (current) => {
      const expanded = new Set(current.expandedNodeIds ?? []);
      if (expanded.has(nodeId)) expanded.delete(nodeId);
      else expanded.add(nodeId);
      return { ...current, expandedNodeIds: [...expanded] };
    });
  }, [updateTreeState]);

  const ensureNodesExpanded = useCallback((objectTypeId, nodeIds) => {
    updateTreeState(objectTypeId, (current) => {
      const expanded = new Set(current.expandedNodeIds ?? []);
      nodeIds.forEach((id) => expanded.add(id));
      return { ...current, expandedNodeIds: [...expanded] };
    });
  }, [updateTreeState]);

  const addSubtypeValues = useCallback((objectTypeId, { parentId = null, attributeId, values }) => {
    const objectType = getObjectType(objectTypeId);
    if (!objectType || !attributeId || !values?.length) return null;

    let taxonomy = null;
    updateTreeState(objectTypeId, (current) => {
      const next = addValueNodesToTree(current, objectType, buildTaxonomyAsset, {
        parentId,
        attributeId,
        values,
        expandParentId: parentId,
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

  const updateTreeNodeDescription = useCallback((objectTypeId, nodeId, description) => {
    updateTreeState(objectTypeId, (current) => ({
      ...current,
      nodes: current.nodes.map((node) =>
        node.id === nodeId ? { ...node, description } : node,
      ),
    }));
  }, [updateTreeState]);

  const deleteTreeNode = useCallback((objectTypeId, nodeId) => {
    updateTreeState(objectTypeId, (current) => {
      const objectType = getObjectType(objectTypeId);
      const removeIds = new Set(getDescendantNodeIds(nodeId, current.nodes));
      const nodes = current.nodes.filter((node) => !removeIds.has(node.id));
      const expanded = (current.expandedNodeIds ?? []).filter((id) => !removeIds.has(id));
      return syncTreeTaxonomy(objectType, { ...current, nodes, expandedNodeIds: expanded }, buildTaxonomyAsset);
    });
  }, [updateTreeState]);

  const getSubtypeMapping = useCallback((objectTypeId) => {
    const objectType = getObjectType(objectTypeId);
    const state = getTreeState(objectTypeId);
    return getSubtypeMappingRows(state.nodes, objectType?.name ?? '', (attributeId) =>
      getAttribute(objectType, attributeId)?.name ?? attributeId,
    );
  }, [getTreeState]);

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

  const addTaxonomyGroup = useCallback(() => null, []);
  const renameTaxonomyGroup = useCallback(() => {}, []);
  const updateTaxonomyGroupDescription = useCallback(() => {}, []);
  const addMembersToTaxonomyGroup = useCallback(() => {}, []);
  const removeMemberFromTaxonomyGroup = useCallback(() => {}, []);
  const deleteTaxonomyGroup = useCallback(() => {}, []);

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

  const getAttributeValuesForSplit = useCallback((objectTypeId, attributeId, parentId = null) => {
    const objectType = getObjectType(objectTypeId);
    if (!objectType) return [];
    const all = getDetectedValues(objectType, attributeId);
    const state = getTreeState(objectTypeId);
    const existing = new Set(
      state.nodes
        .filter((node) => (node.parentId ?? null) === parentId)
        .map((node) => node.matchingValue ?? node.label),
    );
    return all.filter((item) => !existing.has(item.value));
  }, [getTreeState]);

  const value = useMemo(
    () => ({
      getTreeState,
      getSplitState,
      hasSubtypes,
      addSubtypeValues,
      renameTreeNode,
      deleteTreeNode,
      updateTreeNodeDescription,
      toggleNodeExpanded,
      ensureNodesExpanded,
      getSubtypeMapping,
      renameSubtype,
      deleteSubtype,
      getAllSubtypeEntries,
      getSubtypeCountForAttribute,
      getAttributeValuesForSplit,
      getAncestorIds,
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
      updateTreeNodeDescription,
      toggleNodeExpanded,
      ensureNodesExpanded,
      getSubtypeMapping,
      generatedTaxonomies,
      getTaxonomy,
      updateTaxonomyMeta,
      getTaxonomyHierarchy,
      getAttributeValuesForSplit,
      getAncestorIds,
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
