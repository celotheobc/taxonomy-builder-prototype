import { getDirectChildren } from '../../../data/taxonomyTreeModel';
import { getAttribute } from '../../../data/mockObjectTypes';

export function getTaxonomyValueContext(node, allNodes, objectType) {
  if (!node) return null;

  const splitAttribute = node.createdByAttributeId
    ? getAttribute(objectType, node.createdByAttributeId)
    : null;
  const parent = node.parentId ? allNodes.find((item) => item.id === node.parentId) : null;
  const children = getDirectChildren(node.id, allNodes);

  return {
    label: node.label,
    classificationAttribute: splitAttribute?.name ?? '—',
    classificationValue: node.matchingValue ?? node.label,
    parentLabel: parent?.label ?? null,
    childLabels: children.map((child) => child.label),
    memberCount: children.length > 0 ? children.length : 1,
  };
}
