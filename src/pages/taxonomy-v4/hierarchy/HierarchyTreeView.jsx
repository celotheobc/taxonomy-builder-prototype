import { buildNodeTree, getDirectChildCount, getSplitGroupForParent } from '../../../data/taxonomyTreeModel';
import { getAttribute, getDetectedValues, getObjectType } from '../../../data/mockObjectTypes';
import { formatSplitStatus, SubtypeRow, TreeGuides } from './HierarchyRowParts';
import styles from './Hierarchy.module.css';

function SplitGroupRow({
  group,
  objectType,
  branchDepth,
  ancestorContinues,
  isLast,
  readOnly,
  onAddValues,
}) {
  if (!group) return null;

  const attribute = getAttribute(objectType, group.attributeId);
  const attributeName = attribute?.name ?? group.attributeId;
  const isRootSplit = branchDepth === 0;
  const status = formatSplitStatus(group);
  const showAdd = group.availableCount > 0 && !readOnly;

  return (
    <li role="none">
      <div className={styles.splitGroupRow}>
        <TreeGuides
          levels={branchDepth + 1}
          ancestorContinues={ancestorContinues}
          isLast={isLast}
        />
        <div className={styles.splitGroupBody}>
          <span className={styles.chevronBtnPlaceholder} aria-hidden />
          <div className={styles.splitGroupMain}>
            <span className={styles.splitGroupDot} aria-hidden />
            <span className={styles.splitGroupLabel}>{attributeName}</span>
            {isRootSplit ? (
              <>
                <span className={styles.splitGroupMetaSep} aria-hidden>·</span>
                <span className={styles.splitGroupStatus}>{status}</span>
              </>
            ) : group.createdCount > 0 ? (
              <span className={styles.splitGroupCountChip}>
                {group.createdCount} subtype{group.createdCount === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>
          <div className={styles.rowMetaCol}>
            {showAdd ? (
              <button type="button" className={styles.splitGroupAddLink} onClick={onAddValues}>
                Add {group.availableCount} available
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

function HierarchyBranch({
  nodes,
  allNodes,
  branchDepth,
  ancestorContinues,
  expandedIds,
  objectType,
  rootSplitAttributeId,
  rowProps,
}) {
  return nodes.map((node, index) => {
    const isLast = index === nodes.length - 1;
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = expandedIds.has(node.id);
    const childCount = getDirectChildCount(node.id, allNodes);
    const splitGroup = hasChildren
      ? getSplitGroupForParent(node.id, allNodes, objectType, getDetectedValues, rootSplitAttributeId)
      : null;
    const childAncestorContinues = [...ancestorContinues, !isLast];

    return (
      <li key={node.id} role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
        <SubtypeRow
          node={node}
          allNodes={allNodes}
          branchDepth={branchDepth}
          ancestorContinues={ancestorContinues}
          isLast={isLast}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          childCount={childCount}
          onToggleExpand={rowProps.onToggleExpand}
          {...rowProps}
        />

        {hasChildren && isExpanded ? (
          <ul className={styles.hierarchyList} role="group">
            <SplitGroupRow
              group={splitGroup}
              objectType={objectType}
              branchDepth={branchDepth + 1}
              ancestorContinues={childAncestorContinues}
              isLast={node.children.length === 0}
              readOnly={rowProps.readOnly}
              onAddValues={() =>
                rowProps.onAddSplitValues?.({
                  parentId: node.id,
                  parentLabel: node.label,
                  attributeId: splitGroup?.attributeId,
                })
              }
            />
            <HierarchyBranch
              nodes={node.children}
              allNodes={allNodes}
              branchDepth={branchDepth + 1}
              ancestorContinues={childAncestorContinues}
              expandedIds={expandedIds}
              objectType={objectType}
              rootSplitAttributeId={rootSplitAttributeId}
              rowProps={rowProps}
            />
          </ul>
        ) : null}
      </li>
    );
  });
}

export default function HierarchyTreeView({
  objectTypeId,
  objectTypeName,
  nodes,
  rootSplitAttributeId,
  expandedNodeIds,
  rowProps,
}) {
  const objectType = getObjectType(objectTypeId);
  const tree = buildNodeTree(nodes);
  const expandedIds = new Set(expandedNodeIds);
  const rootSplitGroup = getSplitGroupForParent(
    null,
    nodes,
    objectType,
    getDetectedValues,
    rootSplitAttributeId,
  );

  if (!nodes.length) return null;

  return (
    <div className={styles.hierarchyTreeWrap} role="tree" aria-label={`${objectTypeName} subtype hierarchy`}>
      <div className={styles.hierarchyRoot}>{objectTypeName}</div>
      <ul className={styles.hierarchyList}>
        <SplitGroupRow
          group={rootSplitGroup}
          objectType={objectType}
          branchDepth={0}
          ancestorContinues={[]}
          isLast={tree.length === 0}
          readOnly={rowProps.readOnly}
          onAddValues={() =>
            rowProps.onAddSplitValues?.({
              parentId: null,
              parentLabel: objectTypeName,
              attributeId: rootSplitGroup?.attributeId,
            })
          }
        />
        <HierarchyBranch
          nodes={tree}
          allNodes={nodes}
          branchDepth={0}
          ancestorContinues={[]}
          expandedIds={expandedIds}
          objectType={objectType}
          rootSplitAttributeId={rootSplitAttributeId}
          rowProps={rowProps}
        />
      </ul>
    </div>
  );
}
