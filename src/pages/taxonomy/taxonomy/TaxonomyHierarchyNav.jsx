import { useEffect, useMemo, useState } from 'react';
import { UNGROUPED_GROUP_ID, buildNavTree } from '../../../data/taxonomyHierarchy';
import styles from './TaxonomyEditor.module.css';

function TreeNode({
  node,
  selectedGroupId,
  expandedIds,
  onToggleExpand,
  onSelectGroup,
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isActive = selectedGroupId === node.id;

  return (
    <li className={styles.treeItem}>
      <div className={styles.treeRow}>
        {hasChildren ? (
          <button
            type="button"
            className={styles.treeToggle}
            aria-label={isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
            onClick={() => onToggleExpand(node.id)}
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className={styles.treeToggleSpacer} aria-hidden />
        )}
        <button
          type="button"
          className={`${styles.treeButton} ${isActive ? styles.treeButtonActive : ''}`}
          onClick={() => onSelectGroup(node.id)}
        >
          <span className={styles.treeLabel}>{node.label}</span>
          <span className={styles.treeCount}>({node.memberCount})</span>
        </button>
      </div>
      {hasChildren && isExpanded && (
        <ul className={styles.treeChildren}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedGroupId={selectedGroupId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelectGroup={onSelectGroup}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TaxonomyHierarchyNav({
  taxonomyName,
  groups,
  subtypes,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
}) {
  const navTree = useMemo(() => buildNavTree(groups, subtypes), [groups, subtypes]);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  useEffect(() => {
    const next = new Set(navTree.roots.map((node) => node.id));
    navTree.roots.forEach((node) => {
      node.children.forEach((child) => next.add(child.id));
    });
    setExpandedIds(next);
  }, [taxonomyName, navTree.roots]);

  const toggleExpand = (groupId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <nav className={styles.hierarchyNav} aria-label="Taxonomy hierarchy">
      <div className={styles.hierarchyHeader}>
        <div className={styles.hierarchyHeaderRow}>
          <h3 className={styles.hierarchyTitle}>Hierarchy</h3>
          {onCreateGroup ? (
            <button
              type="button"
              className={styles.hierarchyAddBtn}
              onClick={onCreateGroup}
              aria-label="Create group"
              title="Create group"
            >
              +
            </button>
          ) : null}
        </div>
        <p className={styles.hierarchyTaxonomyName}>{taxonomyName}</p>
      </div>
      <div className={styles.hierarchyBody}>
        <ul className={styles.treeList}>
          {navTree.roots.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              selectedGroupId={selectedGroupId}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpand}
              onSelectGroup={onSelectGroup}
            />
          ))}
        </ul>
        <div className={styles.ungroupedItem}>
          <div className={styles.treeRow}>
            <span className={styles.treeToggleSpacer} aria-hidden />
            <button
              type="button"
              className={`${styles.treeButton} ${
                selectedGroupId === UNGROUPED_GROUP_ID ? styles.treeButtonActive : ''
              }`}
              onClick={() => onSelectGroup(UNGROUPED_GROUP_ID)}
            >
              <span className={styles.treeLabel}>Ungrouped</span>
              <span className={styles.treeCount}>({navTree.ungrouped.memberCount})</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
