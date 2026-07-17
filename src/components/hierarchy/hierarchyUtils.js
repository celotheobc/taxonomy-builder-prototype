/** Shared hierarchy tree helpers for Object and Taxonomy surfaces. */

export function buildTreeFromFlatNodes(nodes, { idKey = 'id', parentKey = 'parentId' } = {}) {
  const byId = new Map();
  const roots = [];

  nodes.forEach((node) => {
    byId.set(node[idKey], { ...node, children: [] });
  });

  byId.forEach((node) => {
    const parentId = node[parentKey];
    if (parentId && byId.has(parentId)) {
      byId.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function flattenSubtypeTree(nodes, parentId = null) {
  const result = [];
  nodes.forEach((node) => {
    const { children, ...rest } = node;
    result.push({ ...rest, parentId });
    if (children?.length) {
      result.push(...flattenSubtypeTree(children, node.id));
    }
  });
  return result;
}

export function countTreeNodes(nodes) {
  return nodes.reduce((sum, node) => sum + 1 + countTreeNodes(node.children ?? []), 0);
}

export function walkTree(nodes, visitor, depth = 0) {
  nodes.forEach((node) => {
    visitor(node, depth);
    if (node.children?.length) walkTree(node.children, visitor, depth + 1);
  });
}
