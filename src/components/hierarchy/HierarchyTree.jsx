import { useCallback, useMemo, useState } from 'react';
import HierarchyTreeRow from './HierarchyTreeRow';
import { buildTreeFromFlatNodes } from './hierarchyUtils';
import styles from './HierarchyTree.module.css';

function collectExpandableIds(nodes, ids = new Set()) {
  nodes.forEach((node) => {
    if (node.children?.length) {
      ids.add(node.id);
      collectExpandableIds(node.children, ids);
    }
  });
  return ids;
}

function TreeBranch({
  nodes,
  depth,
  expandedIds,
  onToggle,
  selectedId,
  onSelectNode,
  renderMeta,
  renderActions,
}) {
  return nodes.map((node) => {
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = expandedIds.has(node.id);

    return (
      <div key={node.id}>
        <HierarchyTreeRow
          node={node}
          depth={depth}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          isSelected={selectedId === node.id}
          onToggle={() => onToggle(node.id)}
          onSelect={() => onSelectNode?.(node)}
          meta={renderMeta?.(node)}
          actions={renderActions?.(node)}
        />
        {hasChildren && isExpanded ? (
          <TreeBranch
            nodes={node.children}
            depth={depth + 1}
            expandedIds={expandedIds}
            onToggle={onToggle}
            selectedId={selectedId}
            onSelectNode={onSelectNode}
            renderMeta={renderMeta}
            renderActions={renderActions}
          />
        ) : null}
      </div>
    );
  });
}

export default function HierarchyTree({
  nodes,
  selectedId,
  onSelectNode,
  defaultExpandAll = true,
  renderMeta,
  renderActions,
  emptyMessage = 'No items in this hierarchy yet.',
}) {
  const tree = useMemo(() => buildTreeFromFlatNodes(nodes), [nodes]);

  const [expandedIds, setExpandedIds] = useState(() => {
    if (!defaultExpandAll) return new Set();
    return collectExpandableIds(tree);
  });

  const handleToggle = useCallback((nodeId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  if (!tree.length) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.tree} role="tree">
      <TreeBranch
        nodes={tree}
        depth={0}
        expandedIds={expandedIds}
        onToggle={handleToggle}
        selectedId={selectedId}
        onSelectNode={onSelectNode}
        renderMeta={renderMeta}
        renderActions={renderActions}
      />
    </div>
  );
}
