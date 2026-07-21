import {
  createNodeId,
  getDirectChildren,
  syncTreeTaxonomy,
} from '../../../data/taxonomyTreeModel';

export const SPLIT_METHODS = {
  ATTRIBUTE_VALUES: 'attribute-values',
  RULES: 'rules',
};

function parentKey(parentId) {
  return parentId ?? '__root__';
}

export function getSplitMethodForParent(state, parentId) {
  return state.splitMethodsByParent?.[parentKey(parentId)] ?? null;
}

function setSplitMethod(state, parentId, method) {
  const key = parentKey(parentId);
  return {
    ...state,
    splitMethodsByParent: { ...state.splitMethodsByParent, [key]: method },
  };
}

function getExistingSourceValues(parentId, nodes) {
  const values = new Set();
  nodes
    .filter((node) => (node.parentId ?? null) === parentId)
    .forEach((node) => {
      if (node.sourceValues?.length) {
        node.sourceValues.forEach((value) => values.add(value));
      } else {
        values.add(node.matchingValue ?? node.label);
      }
    });
  return values;
}

/** @typedef {{ label: string, sourceValues: string[], recordCount?: number }} SubtypeGroupInput */

export function addGroupedSubtypeNodes(
  state,
  objectType,
  buildTaxonomyAsset,
  { parentId = null, attributeId, groups, expandParentId = null },
) {
  if (!groups?.length || !attributeId) return state;

  const existingChildren = getDirectChildren(parentId, state.nodes);
  if (existingChildren.length) {
    const existingAttributeId =
      existingChildren[0].createdByAttributeId ??
      (parentId == null ? state.rootSplitAttributeId : null);
    if (existingAttributeId && existingAttributeId !== attributeId) return state;
  }

  const taken = getExistingSourceValues(parentId, state.nodes);
  const newNodes = [];

  groups.forEach((group) => {
    const label = group.label?.trim();
    if (!label) return;

    const sourceValues = (group.sourceValues ?? []).filter((value) => !taken.has(value));
    if (!sourceValues.length) {
      newNodes.push({
        id: createNodeId(label),
        label,
        matchingValue: label,
        sourceValues: [],
        recordCount: group.recordCount ?? 0,
        parentId,
        createdByAttributeId: attributeId,
        description: '',
        creationMethod: SPLIT_METHODS.ATTRIBUTE_VALUES,
      });
      return;
    }

    sourceValues.forEach((value) => taken.add(value));
    newNodes.push({
      id: createNodeId(label),
      label,
      matchingValue: sourceValues[0],
      sourceValues,
      recordCount: group.recordCount ?? 0,
      parentId,
      createdByAttributeId: attributeId,
      description: '',
      creationMethod: SPLIT_METHODS.ATTRIBUTE_VALUES,
    });
  });

  if (!newNodes.length) return state;

  const expanded = new Set(state.expandedNodeIds ?? []);
  if (expandParentId) expanded.add(expandParentId);
  if (parentId) expanded.add(parentId);

  let nextState = {
    ...state,
    nodes: [...state.nodes, ...newNodes],
    expandedNodeIds: [...expanded],
    rootSplitAttributeId:
      parentId == null && !state.rootSplitAttributeId ? attributeId : state.rootSplitAttributeId,
  };

  nextState = setSplitMethod(nextState, parentId, SPLIT_METHODS.ATTRIBUTE_VALUES);
  return syncTreeTaxonomy(objectType, nextState, buildTaxonomyAsset);
}

/** @typedef {{ label: string, conditions: Array<{ fieldId: string, operator: string, value: string }>, recordCount?: number }} RuleSubtypeInput */

export function addRuleBasedSubtypeNodes(
  state,
  objectType,
  buildTaxonomyAsset,
  { parentId = null, attributeId, ruleSubtypes, expandParentId = null },
) {
  if (!ruleSubtypes?.length) return state;

  const existingChildren = getDirectChildren(parentId, state.nodes);
  if (existingChildren.length) return state;

  const newNodes = ruleSubtypes.map((rule) => ({
    id: createNodeId(rule.label),
    label: rule.label,
    matchingValue: rule.label,
    recordCount: rule.recordCount ?? 0,
    parentId,
    createdByAttributeId: attributeId ?? null,
    description: '',
    creationMethod: SPLIT_METHODS.RULES,
    ruleDefinition: rule.conditions,
  }));

  const expanded = new Set(state.expandedNodeIds ?? []);
  if (expandParentId) expanded.add(expandParentId);
  if (parentId) expanded.add(parentId);

  let nextState = {
    ...state,
    nodes: [...state.nodes, ...newNodes],
    expandedNodeIds: [...expanded],
    rootSplitAttributeId:
      parentId == null && !state.rootSplitAttributeId
        ? attributeId ?? state.rootSplitAttributeId
        : state.rootSplitAttributeId,
  };

  nextState = setSplitMethod(nextState, parentId, SPLIT_METHODS.RULES);
  return syncTreeTaxonomy(objectType, nextState, buildTaxonomyAsset);
}

export function getNodeSourceValues(node) {
  if (node.sourceValues?.length) return node.sourceValues;
  const value = node.matchingValue ?? node.label;
  return value ? [value] : [];
}
