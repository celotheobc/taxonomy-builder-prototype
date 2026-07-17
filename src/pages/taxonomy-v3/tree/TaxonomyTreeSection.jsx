import { useMemo, useState } from 'react';
import TaxonomyStackIcon from '../../../components/icons/TaxonomyStackIcon';
import { getObjectType } from '../../../data/mockObjectTypes';
import {
  getDescendantNodeIds,
  getHierarchyStats,
  getUsedSplitAttributes,
} from '../../../data/taxonomyTreeModel';
import { useObjectTypeWorkspace } from '../context/ObjectTypeWorkspaceContext';
import ObjectTypeSectionCard from '../sections/ObjectTypeSectionCard';
import HierarchyList from '../hierarchy/HierarchyList';
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
  } = useObjectTypeWorkspace();

  const treeState = getTreeState(objectTypeId);
  const stats = getHierarchyStats(treeState.nodes);
  const taxonomy = treeState.taxonomy;

  const [flow, setFlow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renamingNodeId, setRenamingNodeId] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [presentation, setPresentation] = useState('tree');

  const usedAttributeIds = useMemo(() => {
    if (!flow) return new Set();
    const used = getUsedSplitAttributes(flow.parentId, treeState.nodes);
    if (flow.attributeId) used.delete(flow.attributeId);
    return used;
  }, [flow, treeState.nodes]);

  const availableValues = useMemo(() => {
    if (!flow?.attributeId) return [];
    return getAttributeValuesForSplit(objectTypeId, flow.attributeId, flow.parentId);
  }, [flow, objectTypeId, getAttributeValuesForSplit]);

  const isAddValuesFlow = Boolean(
    flow?.step === 'values' &&
      flow?.attributeId &&
      treeState.nodes.some(
        (node) =>
          (node.parentId ?? null) === (flow.parentId ?? null) &&
          node.createdByAttributeId === flow.attributeId,
      ),
  );

  const openCreateFlow = (parentId = null, parentLabel = objectType.name) => {
    setFlow({ parentId, parentLabel, step: 'attribute', attributeId: null });
  };

  const openAddValuesFlow = ({ parentId, parentLabel, attributeId }) => {
    if (!attributeId) return;
    setFlow({
      parentId,
      parentLabel: parentLabel ?? objectType.name,
      step: 'values',
      attributeId,
    });
  };

  const closeFlow = () => setFlow(null);

  const handleCreateSelected = (values) => {
    if (!flow?.attributeId || !values.length) return;
    addSubtypeValues(objectTypeId, {
      parentId: flow.parentId,
      attributeId: flow.attributeId,
      values,
    });
    closeFlow();
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
      ? `${stats.subtypeCount} subtype${stats.subtypeCount === 1 ? '' : 's'} · ${stats.maxLevel} level${stats.maxLevel === 1 ? '' : 's'}`
      : null;

  return (
    <ObjectTypeSectionCard
      title="Subtype hierarchy"
      count={stats.subtypeCount || undefined}
      actions={
        stats.subtypeCount > 0 ? (
          <div className={styles.headerActions}>
            <div className={styles.presentationToggle} role="group" aria-label="Hierarchy presentation">
              <button
                type="button"
                className={presentation === 'headers' ? styles.presentationOptionActive : styles.presentationOption}
                aria-pressed={presentation === 'headers'}
                onClick={() => setPresentation('headers')}
              >
                Headers
              </button>
              <button
                type="button"
                className={presentation === 'tree' ? styles.presentationOptionActive : styles.presentationOption}
                aria-pressed={presentation === 'tree'}
                onClick={() => setPresentation('tree')}
              >
                Tree
              </button>
            </div>
            {summary ? <span className={styles.sectionSummary}>{summary}</span> : null}
          </div>
        ) : null
      }
    >
      {taxonomy ? (
        <div className={styles.linkedTaxonomy}>
          <span>Linked taxonomy:</span>
          <TaxonomyStackIcon size={18} title="" />
          <button
            type="button"
            className={styles.linkedTaxonomyBtn}
            onClick={() => onOpenTaxonomy?.(taxonomy.id)}
          >
            {taxonomy.name}
          </button>
        </div>
      ) : null}

      {stats.subtypeCount === 0 ? (
        <div className={styles.treeEmpty}>
          <h4 className={styles.treeEmptyTitle}>Subtype hierarchy</h4>
          <p className={styles.treeEmptyCopy}>
            Specialise this object type into more specific business concepts by splitting it on an
            attribute. 
          </p>
          <button type="button" className={styles.primaryBtn} onClick={() => openCreateFlow()}>
            Create subtype hierarchy
          </button>
        </div>
      ) : (
        <HierarchyList
          presentation={presentation}
          objectTypeId={objectTypeId}
          objectTypeName={objectType.name}
          nodes={treeState.nodes}
          rootSplitAttributeId={treeState.rootSplitAttributeId}
          expandedNodeIds={treeState.expandedNodeIds}
          onToggleExpand={(nodeId) => toggleNodeExpanded(objectTypeId, nodeId)}
          onOpenSubtype={(node) => onOpenSubtype?.(node.id)}
          onPreviewNode={(node) => onPreviewSubtype?.(node.id)}
          onSplitNode={(node) => openCreateFlow(node.id, node.label)}
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
        />
      )}

      <SplitModal
        open={Boolean(flow)}
        step={flow?.step ?? 'attribute'}
        objectTypeId={objectTypeId}
        parentId={flow?.parentId ?? null}
        parentLabel={flow?.parentLabel ?? objectType.name}
        attributeId={flow?.attributeId}
        usedAttributeIds={usedAttributeIds}
        availableValues={availableValues}
        selectAllOnOpen={!isAddValuesFlow}
        onSelectAttribute={(attributeId) =>
          setFlow((current) => ({ ...current, step: 'values', attributeId }))
        }
        onBackToAttributes={() =>
          setFlow((current) => ({ ...current, step: 'attribute', attributeId: null }))
        }
        onCreateSelected={handleCreateSelected}
        onClose={closeFlow}
      />

      {deleteTarget ? (
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
        </>
      ) : null}
    </ObjectTypeSectionCard>
  );
}
