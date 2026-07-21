import { useState } from 'react';
import { buildNodeTree } from '../../../data/taxonomyTreeModel';
import styles from './TaxonomyTree.module.css';

function TreeBranch({ nodes, depth, onSplit, onRename, onDelete }) {
  return nodes.map((node) => (
    <div key={node.id} className={styles.treeBranch} style={{ paddingLeft: depth * 20 }}>
      <div className={styles.treeNodeRow}>
        <span className={styles.treeNodeLabel}>{node.label}</span>
        <div className={styles.treeNodeActions}>
          <button type="button" className={styles.treeNodeAction} onClick={() => onSplit(node)}>
            Split
          </button>
          <button type="button" className={styles.treeNodeAction} onClick={() => onRename(node)}>
            Rename
          </button>
          <button
            type="button"
            className={`${styles.treeNodeAction} ${styles.treeNodeActionDanger}`}
            onClick={() => onDelete(node)}
          >
            Delete
          </button>
          <button type="button" className={styles.treeNodeAction} disabled title="Coming soon">
            More
          </button>
        </div>
      </div>
      {node.children?.length ? (
        <TreeBranch
          nodes={node.children}
          depth={depth + 1}
          onSplit={onSplit}
          onRename={onRename}
          onDelete={onDelete}
        />
      ) : null}
    </div>
  ));
}

export default function TaxonomyTreeEditor({
  objectTypeName,
  nodes,
  onSplitNode,
  onRenameNode,
  onDeleteNode,
}) {
  const [expanded] = useState(true);
  const tree = buildNodeTree(nodes);

  if (!nodes.length) return null;

  return (
    <div className={styles.treeEditor} role="tree" aria-label={`${objectTypeName} subtype hierarchy`}>
      <div className={styles.treeRootLabel}>{objectTypeName}</div>
      {expanded ? (
        <TreeBranch
          nodes={tree}
          depth={1}
          onSplit={onSplitNode}
          onRename={onRenameNode}
          onDelete={onDeleteNode}
        />
      ) : null}
    </div>
  );
}
