import {
  buildNodeTree,
  getDirectChildCount,
  getSplitConfigsForParent,
  parentHasDirectSplit,
} from '../../../data/taxonomyTreeModel';
import { getDetectedValues, getObjectType } from '../../../data/mockObjectTypes';
import { buildSplitMetadataProps } from './SplitMetadata';
import { SubtypeRow } from './HierarchyRowParts';
import SplitConfigBlock from './SplitConfigBlock';
import { RootObjectRow, RootSplitMetaRow } from './RootObjectRow';
import styles from './Hierarchy.module.css';

function SplitConfigsForParent({
  parentId,
  parentLabel,
  allNodes,
  branchDepth,
  ancestorContinues,
  isLastInBranch,
  objectType,
  rootSplitAttributeId,
  rowProps,
  metadataVariant,
}) {
  if (metadataVariant === 'single-row') return null;

  const configs = getSplitConfigsForParent(
    parentId,
    allNodes,
    objectType,
    getDetectedValues,
    rootSplitAttributeId,
  );

  if (!configs.length) return null;

  return configs.map((group) => (
    <SplitConfigBlock
      key={`${parentId ?? 'root'}-${group.attributeId}`}
      group={group}
      objectType={objectType}
      parentLabel={parentLabel}
      branchDepth={branchDepth}
      ancestorContinues={ancestorContinues}
      isLastInBranch={isLastInBranch}
      readOnly={rowProps.readOnly}
      taxonomyId={rowProps.taxonomyId}
      taxonomyName={parentId == null ? rowProps.taxonomyName : undefined}
      onOpenTaxonomy={rowProps.onOpenTaxonomy}
      onAddValues={() =>
        rowProps.onAddSplitValues?.({
          parentId,
          parentLabel,
          attributeId: group.attributeId,
        })
      }
    />
  ));
}

function getPrimarySplitGroup(parentId, allNodes, objectType, rootSplitAttributeId) {
  const configs = getSplitConfigsForParent(
    parentId,
    allNodes,
    objectType,
    getDetectedValues,
    rootSplitAttributeId,
  );
  return configs[0] ?? null;
}

function buildMetaFromGroup(group, ctx) {
  if (!group) return null;
  return buildSplitMetadataProps({
    group,
    objectType: ctx.objectType,
    parentLabel: ctx.parentLabel,
    taxonomyId: ctx.taxonomyId,
    taxonomyName: ctx.taxonomyName,
    readOnly: ctx.readOnly,
    onOpenTaxonomy: ctx.onOpenTaxonomy,
    onAddValues: ctx.onAddValues,
  });
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
  metadataVariant,
}) {
  return nodes.map((node, index) => {
    const isLast = index === nodes.length - 1;
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = expandedIds.has(node.id);
    const childCount = getDirectChildCount(node.id, allNodes);
    const childAncestorContinues = [...ancestorContinues, !isLast];
    const hasExistingSplit = parentHasDirectSplit(node.id, allNodes);
    const splitGroup = hasExistingSplit
      ? getPrimarySplitGroup(node.id, allNodes, objectType, rootSplitAttributeId)
      : null;
    const splitMeta =
      metadataVariant === 'single-row' && splitGroup
        ? buildMetaFromGroup(splitGroup, {
            objectType,
            parentLabel: node.label,
            taxonomyId: rowProps.taxonomyId,
            readOnly: rowProps.readOnly,
            onOpenTaxonomy: rowProps.onOpenTaxonomy,
            onAddValues: () =>
              rowProps.onAddSplitValues?.({
                parentId: node.id,
                parentLabel: node.label,
                attributeId: splitGroup.attributeId,
              }),
          })
        : null;

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
          hasExistingSplit={hasExistingSplit}
          splitMeta={splitMeta}
          metadataVariant={metadataVariant}
          onToggleExpand={rowProps.onToggleExpand}
          {...rowProps}
        />

        {hasChildren && isExpanded ? (
          <>
            {metadataVariant === 'two-row' ? (
              <SplitConfigsForParent
                parentId={node.id}
                parentLabel={node.label}
                allNodes={allNodes}
                branchDepth={branchDepth}
                ancestorContinues={ancestorContinues}
                isLastInBranch={false}
                objectType={objectType}
                rootSplitAttributeId={rootSplitAttributeId}
                rowProps={rowProps}
                metadataVariant={metadataVariant}
              />
            ) : null}
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
                metadataVariant={metadataVariant}
              />
            </ul>
          </>
        ) : null}
      </li>
    );
  });
}

export default function HierarchyView({
  objectTypeId,
  objectTypeName,
  nodes,
  rootSplitAttributeId,
  expandedNodeIds,
  taxonomyId,
  taxonomyName,
  metadataVariant = 'two-row',
  rowProps,
}) {
  const objectType = getObjectType(objectTypeId);
  const tree = buildNodeTree(nodes);
  const expandedIds = new Set(expandedNodeIds);

  if (!nodes.length) return null;

  const rootHasSplit = parentHasDirectSplit(null, nodes);
  const rootSplitGroup = rootHasSplit
    ? getPrimarySplitGroup(null, nodes, objectType, rootSplitAttributeId)
    : null;
  const rootSplitMeta = rootSplitGroup
    ? buildMetaFromGroup(rootSplitGroup, {
        objectType,
        parentLabel: objectTypeName,
        taxonomyId,
        taxonomyName,
        readOnly: rowProps.readOnly,
        onOpenTaxonomy: rowProps.onOpenTaxonomy,
        onAddValues: () =>
          rowProps.onAddSplitValues?.({
            parentId: null,
            parentLabel: objectTypeName,
            attributeId: rootSplitGroup.attributeId,
          }),
      })
    : null;

  const mergedRowProps = { ...rowProps, taxonomyId, taxonomyName };

  return (
    <div
      className={`${styles.hierarchyTreeWrap} ${metadataVariant === 'single-row' ? styles.hierarchyMetaSingleRow : styles.hierarchyMetaTwoRow}`}
      role="tree"
      aria-label={`${objectTypeName} subtype hierarchy`}
    >
      <RootObjectRow
        objectTypeName={objectTypeName}
        splitMeta={rootSplitMeta}
        metadataVariant={metadataVariant}
        hasSplit={rootHasSplit}
        readOnly={rowProps.readOnly}
        onEditSplit={() => rowProps.onEditRootSplit?.()}
      />
      <RootSplitMetaRow splitMeta={rootSplitMeta} metadataVariant={metadataVariant} />

      <ul className={styles.hierarchyList}>
        <HierarchyBranch
          nodes={tree}
          allNodes={nodes}
          branchDepth={0}
          ancestorContinues={[]}
          expandedIds={expandedIds}
          objectType={objectType}
          rootSplitAttributeId={rootSplitAttributeId}
          rowProps={mergedRowProps}
          metadataVariant={metadataVariant}
        />
      </ul>
    </div>
  );
}
