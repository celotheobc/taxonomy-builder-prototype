/** Tree-first taxonomy model for recursive subtype authoring. */

export const MAX_HIERARCHY_DEPTH = 5;

export function createEmptyTreeState() {
  return {
    nodes: [],
    taxonomy: null,
    rootSplitAttributeId: null,
    expandedNodeIds: [],
  };
}

export function createNodeId(label) {
  return `${String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function getNodeDepth(nodeId, nodes) {
  let depth = 0;
  let current = nodes.find((node) => node.id === nodeId) ?? null;
  while (current) {
    depth += 1;
    current = current.parentId ? nodes.find((node) => node.id === current.parentId) : null;
  }
  return depth;
}

export function getHierarchyStats(nodes) {
  if (!nodes.length) return { subtypeCount: 0, maxLevel: 0 };
  const depths = nodes.map((node) => getNodeDepth(node.id, nodes));
  return {
    subtypeCount: nodes.length,
    maxLevel: Math.max(...depths),
  };
}

export function getUsedSplitAttributes(nodeId, nodes) {
  const used = new Set();
  let current = nodes.find((node) => node.id === nodeId) ?? null;

  while (current) {
    if (current.createdByAttributeId) used.add(current.createdByAttributeId);
    current = current.parentId ? nodes.find((node) => node.id === current.parentId) : null;
  }

  return used;
}

export function getDescendantNodeIds(nodeId, nodes) {
  const ids = [nodeId];
  nodes
    .filter((node) => node.parentId === nodeId)
    .forEach((child) => {
      getDescendantNodeIds(child.id, nodes).forEach((id) => ids.push(id));
    });
  return ids;
}

export function getDirectChildCount(nodeId, nodes) {
  return nodes.filter((node) => node.parentId === nodeId).length;
}

export function parentHasDirectSplit(parentId, nodes) {
  return nodes.some((node) => (node.parentId ?? null) === parentId);
}

export function getDirectChildren(parentId, nodes) {
  return nodes.filter((node) => (node.parentId ?? null) === parentId);
}

export function getAncestorIds(nodeId, nodes) {
  const ids = [];
  let current = nodes.find((node) => node.id === nodeId) ?? null;
  while (current?.parentId) {
    ids.push(current.parentId);
    current = nodes.find((node) => node.id === current.parentId);
  }
  return ids;
}

export function buildNodeTree(nodes, parentId = null) {
  return nodes
    .filter((node) => (node.parentId ?? null) === parentId)
    .map((node) => ({
      ...node,
      children: buildNodeTree(nodes, node.id),
    }));
}

export function getNodeBreadcrumb(nodeId, nodes, rootLabel) {
  return getClassificationPathItems(nodeId, nodes, rootLabel)
    .map((item) => item.label)
    .join(' · ');
}

/** Root object plus each ancestor subtype down to the selected node (navigable path). */
export function getClassificationPathItems(nodeId, nodes, rootLabel) {
  const items = [{ id: null, label: rootLabel }];
  const chain = [];
  let current = nodes.find((node) => node.id === nodeId) ?? null;
  while (current) {
    chain.unshift({ id: current.id, label: current.label });
    current = current.parentId ? nodes.find((node) => node.id === current.parentId) : null;
  }
  return [...items, ...chain];
}

/** Stats for descendants of a scoped parent (excludes the parent node itself). */
export function getScopedHierarchyStats(scopeParentId, nodes) {
  const descendantIds = getDescendantNodeIds(scopeParentId, nodes).filter(
    (id) => id !== scopeParentId,
  );
  if (!descendantIds.length) return { subtypeCount: 0, maxLevel: 0 };

  const scopeDepth = getNodeDepth(scopeParentId, nodes);
  const depths = descendantIds.map((id) => getNodeDepth(id, nodes) - scopeDepth);
  return {
    subtypeCount: descendantIds.length,
    maxLevel: Math.max(...depths),
  };
}

export function getSiblingNodes(nodeId, nodes) {
  const node = nodes.find((item) => item.id === nodeId);
  if (!node) return [];
  return nodes.filter(
    (item) => item.parentId === node.parentId && item.id !== nodeId,
  );
}

export function getNewAvailableValues(node, nodes, objectType, getDetectedValues) {
  return getSplitGroupForParent(node.id, nodes, objectType, getDetectedValues)?.availableValues ?? [];
}

export function getSplitGroupForParent(parentId, nodes, objectType, getDetectedValues, rootSplitAttributeId = null) {
  const children = nodes.filter((item) => (item.parentId ?? null) === parentId);
  if (!children.length) return null;

  const attributeId = children[0].createdByAttributeId ?? (parentId == null ? rootSplitAttributeId : null);
  if (!attributeId) return null;

  const allValues = getDetectedValues(objectType, attributeId);
  const matchingChildren = children.filter((item) => item.createdByAttributeId === attributeId);
  const childValues = new Set(matchingChildren.map((item) => item.matchingValue ?? item.label));
  const availableValues = allValues.filter((value) => !childValues.has(value.value));

  return {
    parentId,
    attributeId,
    createdCount: matchingChildren.length,
    totalCount: allValues.length,
    availableCount: availableValues.length,
    availableValues,
  };
}

/** Returns split configs owned by a parent (array for future multi-taxonomy support). */
export function getSplitConfigsForParent(
  parentId,
  nodes,
  objectType,
  getDetectedValues,
  rootSplitAttributeId = null,
) {
  const group = getSplitGroupForParent(
    parentId,
    nodes,
    objectType,
    getDetectedValues,
    rootSplitAttributeId,
  );
  return group ? [group] : [];
}

export function formatSplitConfigSummary(group) {
  if (!group) return '';
  const created = `${group.createdCount} created`;
  const available =
    group.availableCount > 0 ? `${group.availableCount} available` : '0 available';
  return `${created} • ${available}`;
}

export function formatSplitTaxonomyLabel(parentLabel, attributeName) {
  return `${parentLabel} by ${attributeName}`;
}

export function getSplitEditValueRows(parentId, nodes, objectType, attributeId, getDetectedValues) {
  const allValues = getDetectedValues(objectType, attributeId);
  const children = getDirectChildren(parentId, nodes).filter(
    (node) => node.createdByAttributeId === attributeId,
  );
  const childByValue = new Map(
    children.map((node) => [node.matchingValue ?? node.label, node]),
  );

  return allValues.map((item) => ({
    ...item,
    nodeId: childByValue.get(item.value)?.id ?? null,
    selected: childByValue.has(item.value),
  }));
}

export function clearDirectDescendants(state, parentId) {
  const directChildren = getDirectChildren(parentId, state.nodes);
  const removeIds = new Set();
  directChildren.forEach((child) => {
    getDescendantNodeIds(child.id, state.nodes).forEach((id) => removeIds.add(id));
  });
  const nodes = state.nodes.filter((node) => !removeIds.has(node.id));
  const expandedNodeIds = (state.expandedNodeIds ?? []).filter((id) => !removeIds.has(id));
  return { ...state, nodes, expandedNodeIds };
}

export function applySplitValueSelection(
  state,
  objectType,
  buildTaxonomyAsset,
  { parentId = null, attributeId, selectedValues, getDetectedValues },
) {
  const selected = new Set(selectedValues);
  const rows = getSplitEditValueRows(parentId, state.nodes, objectType, attributeId, getDetectedValues);
  let nextState = state;

  rows.forEach((row) => {
    if (row.nodeId && !selected.has(row.value)) {
      const removeIds = new Set(getDescendantNodeIds(row.nodeId, nextState.nodes));
      nextState = {
        ...nextState,
        nodes: nextState.nodes.filter((node) => !removeIds.has(node.id)),
        expandedNodeIds: (nextState.expandedNodeIds ?? []).filter((id) => !removeIds.has(id)),
      };
    }
  });

  const toAdd = rows.filter((row) => selected.has(row.value) && !row.nodeId);
  if (toAdd.length) {
    nextState = addValueNodesToTree(nextState, objectType, buildTaxonomyAsset, {
      parentId,
      attributeId,
      values: toAdd,
      expandParentId: parentId,
    });
  } else {
    nextState = syncTreeTaxonomy(objectType, nextState, buildTaxonomyAsset);
  }

  return nextState;
}

export function nodesToSubtypes(nodes) {
  return nodes.map((node) => ({
    id: node.id,
    label: node.label,
    matchingValue: node.matchingValue,
    recordCount: node.recordCount,
    parentId: node.parentId,
    createdByAttributeId: node.createdByAttributeId,
    hidden: false,
    description: node.description ?? '',
  }));
}

export function getTreeSubtypeEntries(state) {
  if (!state?.nodes?.length) return [];

  const taxonomy = state.taxonomy;
  const fallbackAttributeId =
    state.rootSplitAttributeId ?? state.nodes.find((node) => !node.parentId)?.createdByAttributeId;

  return nodesToSubtypes(state.nodes).map((subtype) => ({
    subtype,
    splitAttributeId: subtype.createdByAttributeId ?? fallbackAttributeId,
    taxonomy,
  }));
}

export function getSubtypeMappingRows(nodes, objectTypeName, getAttributeName) {
  return nodes.map((node) => {
    const parentNode = node.parentId ? nodes.find((item) => item.id === node.parentId) : null;
    return {
      id: node.id,
      subtype: node.label,
      parent: parentNode?.label ?? objectTypeName,
      splitAttribute: getAttributeName(node.createdByAttributeId),
      attributeValue: node.matchingValue ?? node.label,
      rows: node.recordCount ?? 0,
    };
  });
}

export function syncTreeTaxonomy(objectType, state, buildTaxonomyAsset) {
  if (!state.nodes.length) {
    return { ...state, taxonomy: null, rootSplitAttributeId: null };
  }

  const subtypes = nodesToSubtypes(state.nodes);
  const rootAttributeId =
    state.rootSplitAttributeId ?? state.nodes.find((node) => !node.parentId)?.createdByAttributeId;

  const taxonomy = state.taxonomy
    ? {
        ...state.taxonomy,
        subtypes,
        subtypeCount: subtypes.length,
      }
    : buildTaxonomyAsset(objectType, rootAttributeId, subtypes);

  return {
    ...state,
    taxonomy,
    rootSplitAttributeId: rootAttributeId,
  };
}

export function addValueNodesToTree(state, objectType, buildTaxonomyAsset, options) {
  const { parentId = null, attributeId, values, expandParentId = null } = options;
  if (!values?.length) return state;

  const existingChildren = getDirectChildren(parentId, state.nodes);
  if (existingChildren.length) {
    const existingAttributeId =
      existingChildren[0].createdByAttributeId ??
      (parentId == null ? state.rootSplitAttributeId : null);
    if (existingAttributeId && existingAttributeId !== attributeId) {
      return state;
    }
  }

  const siblingValues = new Set(
    state.nodes
      .filter((node) => (node.parentId ?? null) === parentId)
      .map((node) => node.matchingValue ?? node.label),
  );

  const newNodes = values
    .filter((value) => !siblingValues.has(value.value))
    .map((value) => ({
      id: createNodeId(value.value),
      label: value.value,
      matchingValue: value.value,
      recordCount: value.recordCount ?? 0,
      parentId,
      createdByAttributeId: attributeId,
      description: '',
    }));

  if (!newNodes.length) return state;

  const expanded = new Set(state.expandedNodeIds ?? []);
  if (expandParentId) expanded.add(expandParentId);
  newNodes.forEach((node) => {
    if (parentId) expanded.add(parentId);
  });

  const nextState = {
    ...state,
    nodes: [...state.nodes, ...newNodes],
    expandedNodeIds: [...expanded],
    rootSplitAttributeId:
      parentId == null && !state.rootSplitAttributeId ? attributeId : state.rootSplitAttributeId,
  };

  return syncTreeTaxonomy(objectType, nextState, buildTaxonomyAsset);
}

export function buildL1NavChildren(nodes, parentId, objectTypeId) {
  return nodes
    .filter((node) => (node.parentId ?? null) === parentId)
    .map((node) => ({
      id: node.id,
      label: node.label,
      assetType: 'subtype-object',
      parentObjectTypeId: objectTypeId,
      children: buildL1NavChildren(nodes, node.id, objectTypeId),
    }));
}
