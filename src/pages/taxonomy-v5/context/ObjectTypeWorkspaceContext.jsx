import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  buildTaxonomyAsset,
  getAttribute,
  getDetectedValues,
  getObjectType,
} from '../../../data/mockObjectTypes';
import { getScopedDetectedValues } from '../../../data/mockDataPreview';
import {
  UNGROUPED_GROUP_ID,
  createEmptyHierarchy,
  createGroupId,
  getDescendantGroupIds,
} from '../../../data/taxonomyHierarchy';
import {
  addValueNodesToTree,
  applySplitValueSelection,
  clearDirectDescendants,
  createEmptyTreeState,
  getAncestorIds,
  getDescendantNodeIds,
  getHierarchyStats,
  getNodeDepth,
  getSplitEditValueRows,
  getSubtypeMappingRows,
  getTreeSubtypeEntries,
  MAX_HIERARCHY_DEPTH,
  syncTreeTaxonomy,
} from '../../../data/taxonomyTreeModel';
import {
  addGroupedSubtypeNodes,
  addRuleBasedSubtypeNodes,
  getNodeSourceValues,
} from '../data/hierarchyAuthoring';

const ObjectTypeWorkspaceContext = createContext(null);

function withDefaults(state) {
  const base = state ?? createEmptyTreeState();
  return { splitMethodsByParent: {}, ...base };
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

  const addSubtypeGroups = useCallback((objectTypeId, { parentId = null, attributeId, groups }) => {
    const objectType = getObjectType(objectTypeId);
    if (!objectType || !attributeId || !groups?.length) return null;

    let taxonomy = null;
    updateTreeState(objectTypeId, (current) => {
      const next = addGroupedSubtypeNodes(current, objectType, buildTaxonomyAsset, {
        parentId,
        attributeId,
        groups,
        expandParentId: parentId,
      });
      taxonomy = next.taxonomy;
      return next;
    });
    return taxonomy;
  }, [updateTreeState]);

  const addRuleBasedSubtypes = useCallback(
    (objectTypeId, { parentId = null, attributeId, ruleSubtypes }) => {
      const objectType = getObjectType(objectTypeId);
      if (!objectType || !ruleSubtypes?.length) return null;

      let taxonomy = null;
      updateTreeState(objectTypeId, (current) => {
        const next = addRuleBasedSubtypeNodes(current, objectType, buildTaxonomyAsset, {
          parentId,
          attributeId,
          ruleSubtypes,
          expandParentId: parentId,
        });
        taxonomy = next.taxonomy;
        return next;
      });
      return taxonomy;
    },
    [updateTreeState],
  );

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
    if (!objectType || !attributeId) return [];
    const state = getTreeState(objectTypeId);
    const scoped = getScopedDetectedValues(objectTypeId, attributeId, parentId, state.nodes);
    const all = scoped ?? getDetectedValues(objectType, attributeId);
    const existing = new Set();
    state.nodes
      .filter((node) => (node.parentId ?? null) === parentId)
      .forEach((node) => {
        getNodeSourceValues(node).forEach((value) => existing.add(value));
      });
    return all.filter((item) => !existing.has(item.value));
  }, [getTreeState]);

  const getSplitEditRows = useCallback(
    (objectTypeId, attributeId, parentId = null) => {
      const objectType = getObjectType(objectTypeId);
      if (!objectType) return [];
      return getSplitEditValueRows(parentId, getTreeState(objectTypeId).nodes, objectType, attributeId, getDetectedValues);
    },
    [getTreeState],
  );

  const saveSplitValueSelection = useCallback(
    (objectTypeId, { parentId = null, attributeId, selectedValues }) => {
      const objectType = getObjectType(objectTypeId);
      if (!objectType || !attributeId) return;
      updateTreeState(objectTypeId, (current) =>
        applySplitValueSelection(current, objectType, buildTaxonomyAsset, {
          parentId,
          attributeId,
          selectedValues,
          getDetectedValues,
        }),
      );
    },
    [updateTreeState],
  );

  const replaceParentSplitAttribute = useCallback(
    (objectTypeId, { parentId = null, newAttributeId }) => {
      const objectType = getObjectType(objectTypeId);
      if (!objectType || !newAttributeId) return;
      updateTreeState(objectTypeId, (current) => {
        let next = clearDirectDescendants(current, parentId);
        if (parentId == null) {
          next = { ...next, rootSplitAttributeId: null };
        }
        return syncTreeTaxonomy(objectType, next, buildTaxonomyAsset);
      });
    },
    [updateTreeState],
  );

  const value = useMemo(
    () => ({
      getTreeState,
      getSplitState,
      hasSubtypes,
      addSubtypeValues,
      addSubtypeGroups,
      addRuleBasedSubtypes,
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
      getSplitEditRows,
      saveSplitValueSelection,
      replaceParentSplitAttribute,
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
      addSubtypeGroups,
      addRuleBasedSubtypes,
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
      getSplitEditRows,
      saveSplitValueSelection,
      replaceParentSplitAttribute,
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
