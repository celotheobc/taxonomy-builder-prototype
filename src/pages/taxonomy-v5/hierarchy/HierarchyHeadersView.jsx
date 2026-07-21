import { buildNodeTree, getDirectChildCount, getSplitGroupForParent } from '../../../data/taxonomyTreeModel';
import { getAttribute, getDetectedValues, getObjectType } from '../../../data/mockObjectTypes';
import { formatSplitStatus, SubtypeRow } from './HierarchyRowParts';
import styles from './Hierarchy.module.css';

function BranchHeader({ group, objectType, branchDepth, readOnly, onAddValues }) {
  if (!group) return null;

  const attribute = getAttribute(objectType, group.attributeId);
  const status = formatSplitStatus(group);
  const attributeName = attribute?.name ?? group.attributeId;
  const blockIndent = 16 + branchDepth * 20;

  return (
    <li role="none" className={styles.branchHeaderItem}>
      <div className={styles.branchHeaderBlock} style={{ paddingLeft: blockIndent }}>
        <div className={styles.branchHeaderTop}>
          <span className={styles.branchHeaderTitle}>{attributeName}</span>
          {group.availableCount > 0 && !readOnly ? (
            <button type="button" className={styles.branchHeaderAddBtn} onClick={onAddValues}>
              Add {group.availableCount} available
            </button>
          ) : null}
        </div>
        <p className={styles.branchHeaderStatus}>{status}</p>
        <div className={styles.branchHeaderRule} aria-hidden />
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
          presentation="headers"
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
          <>
            <BranchHeader
              group={splitGroup}
              objectType={objectType}
              branchDepth={branchDepth + 1}
              readOnly={rowProps.readOnly}
              onAddValues={() =>
                rowProps.onAddSplitValues?.({
                  parentId: node.id,
                  parentLabel: node.label,
                  attributeId: splitGroup?.attributeId,
                })
              }
            />
            <ul className={styles.hierarchyList} role="group">
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
          </>
        ) : null}
      </li>
    );
  });
}

export default function HierarchyHeadersView({
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
    <div
      className={`${styles.hierarchyTreeWrap} ${styles.hierarchyHeadersWrap}`}
      role="tree"
      aria-label={`${objectTypeName} subtype hierarchy`}
    >
      <div className={styles.hierarchyRoot}>{objectTypeName}</div>
      <ul className={styles.hierarchyList}>
        <BranchHeader
          group={rootSplitGroup}
          objectType={objectType}
          branchDepth={0}
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
