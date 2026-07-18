import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getDetectedValues, getObjectType } from '../../../data/mockObjectTypes';
import {
  getDescendantNodeIds,
  getHierarchyStats,
  getSplitConfigsForParent,
  getUsedSplitAttributes,
  parentHasDirectSplit,
} from '../../../data/taxonomyTreeModel';
import { useObjectTypeWorkspace } from '../context/ObjectTypeWorkspaceContext';
import ObjectTypeSectionCard from '../sections/ObjectTypeSectionCard';
import HierarchyList from '../hierarchy/HierarchyList';
import { useHierarchyTreeAnimations } from '../hierarchy/useHierarchyTreeAnimations';
import SplitModal from '../hierarchy/SplitModal';
import styles from '../hierarchy/Hierarchy.module.css';

export default function TaxonomyTreeSection({
  objectTypeId,
  onOpenTaxonomy,
  onOpenSubtype,
  onPreviewSubtype,
}) {
  const objectType = getObjectType(objectTypeId);
  const {
    getTreeState,
    addSubtypeValues,
    renameTreeNode,
    deleteTreeNode,
    toggleNodeExpanded,
    getAttributeValuesForSplit,
    getSplitEditRows,
    saveSplitValueSelection,
    replaceParentSplitAttribute,
  } = useObjectTypeWorkspace();

  const treeState = getTreeState(objectTypeId);
  const stats = getHierarchyStats(treeState.nodes);
  const taxonomy = treeState.taxonomy;

  const [flow, setFlow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renamingNodeId, setRenamingNodeId] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [metadataVariant, setMetadataVariant] = useState('single-row');

  const { enteringNodeIds, expandingBranchParentIds } = useHierarchyTreeAnimations(
    treeState.nodes,
    treeState.expandedNodeIds,
  );

  const usedAttributeIds = useMemo(() => {
    if (!flow) return new Set();
    const used = getUsedSplitAttributes(flow.parentId, treeState.nodes);
    if (flow.attributeId) used.delete(flow.attributeId);
    return used;
  }, [flow, treeState.nodes]);

  const getSplitValueOptionCount = useMemo(() => {
    if (!flow || flow.mode === 'edit') return () => 0;
    return (attributeId) =>
      getAttributeValuesForSplit(objectTypeId, attributeId, flow.parentId ?? null).length;
  }, [flow, objectTypeId, getAttributeValuesForSplit]);

  const availableValues = useMemo(() => {
    if (!flow?.attributeId || flow.mode === 'edit') return [];
    return getAttributeValuesForSplit(objectTypeId, flow.attributeId, flow.parentId);
  }, [flow, objectTypeId, getAttributeValuesForSplit]);

  const editRows = useMemo(() => {
    if (!flow?.attributeId || flow.mode !== 'edit') return [];
    return getSplitEditRows(objectTypeId, flow.attributeId, flow.parentId);
  }, [flow, objectTypeId, getSplitEditRows]);

  const openSplitFlow = (parentId = null, parentLabel = objectType.name) => {
    const group = getSplitConfigsForParent(
      parentId,
      treeState.nodes,
      objectType,
      getDetectedValues,
      treeState.rootSplitAttributeId,
    )[0];

    if (parentHasDirectSplit(parentId, treeState.nodes) && group) {
      setFlow({
        mode: 'edit',
        step: 'values',
        parentId,
        parentLabel,
        attributeId: group.attributeId,
      });
      return;
    }

    setFlow({ mode: 'create', step: 'create', parentId, parentLabel, attributeId: null });
  };

  const openAddValuesFlow = ({ parentId, parentLabel, attributeId }) => {
    if (!attributeId) return;
    setFlow({
      mode: 'edit',
      parentId,
      parentLabel: parentLabel ?? objectType.name,
      step: 'values',
      attributeId,
    });
  };

  const closeFlow = () => setFlow(null);

  const handleCreateSelected = (values, attributeIdOverride) => {
    const attributeId = attributeIdOverride ?? flow?.attributeId;
    if (!attributeId || !values.length) return;
    addSubtypeValues(objectTypeId, {
      parentId: flow.parentId,
      attributeId,
      values,
    });
    closeFlow();
  };

  const handleSaveEdit = (selectedValues) => {
    if (!flow?.attributeId) return;
    saveSplitValueSelection(objectTypeId, {
      parentId: flow.parentId,
      attributeId: flow.attributeId,
      selectedValues,
    });
    closeFlow();
  };

  const handleSelectAttribute = (attributeId) => {
    if (flow?.mode === 'replace') {
      const label = flow.parentLabel ?? objectType.name;
      const confirmed = window.confirm(
        `Change the split attribute for "${label}"? All subtypes created from the current split will be removed from this hierarchy.`,
      );
      if (!confirmed) return;
      replaceParentSplitAttribute(objectTypeId, {
        parentId: flow.parentId,
        newAttributeId: attributeId,
      });
      setFlow({
        mode: 'replace',
        step: 'create',
        parentId: flow.parentId,
        parentLabel: flow.parentLabel,
        attributeId,
      });
      return;
    }
    setFlow((current) => ({ ...current, attributeId }));
  };

  const handleRenameStart = (node) => {
    setRenamingNodeId(node.id);
    setRenameDraft(node.label);
  };

  const handleRenameConfirm = () => {
    if (renamingNodeId && renameDraft.trim()) {
      renameTreeNode(objectTypeId, renamingNodeId, renameDraft.trim());
    }
    setRenamingNodeId(null);
    setRenameDraft('');
  };

  const nestedDeleteCount = deleteTarget
    ? getDescendantNodeIds(deleteTarget.id, treeState.nodes).length - 1
    : 0;

  const summary =
    stats.subtypeCount > 0
      ? `${stats.subtypeCount} subtype${stats.subtypeCount === 1 ? '' : 's'} over ${stats.maxLevel} level${stats.maxLevel === 1 ? '' : 's'}`
      : null;

  const headerActions =
    stats.subtypeCount > 0 && summary ? (
      <span className={styles.sectionSummary}>{summary}</span>
    ) : null;

  const toggleMetadataVariant = () => {
    setMetadataVariant((current) => (current === 'single-row' ? 'two-row' : 'single-row'));
  };

  return (
    <ObjectTypeSectionCard
      title="Subtype hierarchy"
      count={stats.subtypeCount || undefined}
      actions={headerActions}
      onTitleClick={stats.subtypeCount > 0 ? toggleMetadataVariant : undefined}
      headerAddon={
        stats.subtypeCount > 0 ? (
          <button
            type="button"
            className={styles.futureHierarchyBtn}
            disabled
            title="Future: add a separate hierarchy for this object (e.g. Facility by Country)"
            aria-label="Add hierarchy (coming soon)"
            onClick={(event) => event.stopPropagation()}
          >
            +
          </button>
        ) : null
      }
    >
      {stats.subtypeCount === 0 ? (
        <div className={styles.treeEmpty}>
          <p className={styles.treeEmptyCopy}>
            Split this object type into more specific business concepts.
          </p>
          <button type="button" className={styles.primaryBtn} onClick={() => openSplitFlow()}>
            Create subtypes
          </button>
        </div>
      ) : (
        <HierarchyList
          metadataVariant={metadataVariant}
          objectTypeId={objectTypeId}
          objectTypeName={objectType.name}
          nodes={treeState.nodes}
          rootSplitAttributeId={treeState.rootSplitAttributeId}
          expandedNodeIds={treeState.expandedNodeIds}
          taxonomyId={taxonomy?.id ?? null}
          taxonomyName={taxonomy?.name ?? null}
          onOpenTaxonomy={onOpenTaxonomy}
          onToggleExpand={(nodeId) => toggleNodeExpanded(objectTypeId, nodeId)}
          onOpenSubtype={(node) => onOpenSubtype?.(node.id)}
          onPreviewNode={(node) => onPreviewSubtype?.(node.id)}
          onSplitNode={(node) => openSplitFlow(node.id, node.label)}
          onEditSplitNode={(node) => openSplitFlow(node.id, node.label)}
          onEditRootSplit={() => openSplitFlow(null, objectType.name)}
          onRenameNode={handleRenameStart}
          onDeleteNode={setDeleteTarget}
          onAddSplitValues={openAddValuesFlow}
          renamingNodeId={renamingNodeId}
          renameDraft={renameDraft}
          onRenameDraftChange={setRenameDraft}
          onRenameConfirm={handleRenameConfirm}
          onRenameCancel={() => {
            setRenamingNodeId(null);
            setRenameDraft('');
          }}
          enteringNodeIds={enteringNodeIds}
          expandingBranchParentIds={expandingBranchParentIds}
        />
      )}

      <SplitModal
        open={Boolean(flow)}
        mode={flow?.mode ?? 'create'}
        step={flow?.step ?? 'attribute'}
        objectTypeId={objectTypeId}
        parentId={flow?.parentId ?? null}
        parentLabel={flow?.parentLabel ?? objectType.name}
        attributeId={flow?.attributeId}
        usedAttributeIds={usedAttributeIds}
        availableValues={availableValues}
        editRows={editRows}
        selectAllOnOpen={false}
        getSplitValueOptionCount={getSplitValueOptionCount}
        onSelectAttribute={handleSelectAttribute}
        onBackToAttributes={() =>
          setFlow((current) => ({ ...current, step: 'attribute', attributeId: null, mode: 'create' }))
        }
        onCreateSelected={handleCreateSelected}
        onSaveEdit={handleSaveEdit}
        onRequestChangeAttribute={() =>
          setFlow((current) => ({
            ...current,
            mode: 'replace',
            step: 'create',
            attributeId: null,
          }))
        }
        onClose={closeFlow}
      />

      {deleteTarget
        ? createPortal(
            <>
              <button
                type="button"
                className={styles.modalBackdrop}
                aria-label="Close delete dialog"
                onClick={() => setDeleteTarget(null)}
              />
              <div className={styles.deleteDialog} role="alertdialog">
                <h3 className={styles.deleteTitle}>Delete &ldquo;{deleteTarget.label}&rdquo;?</h3>
                <p className={styles.deleteCopy}>
                  {nestedDeleteCount > 0
                    ? `This subtype contains ${nestedDeleteCount} nested subtype${nestedDeleteCount === 1 ? '' : 's'}. Deleting ${deleteTarget.label} will also remove those descendants from this hierarchy.`
                    : `This will remove ${deleteTarget.label} from the subtype hierarchy.`}
                </p>
                <div className={styles.deleteActions}>
                  <button type="button" className={styles.secondaryBtn} onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => {
                      deleteTreeNode(objectTypeId, deleteTarget.id);
                      setDeleteTarget(null);
                    }}
                  >
                    Delete subtype
                  </button>
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </ObjectTypeSectionCard>
  );
}
