import { useMemo, useState } from 'react';
import TaxonomyStackIcon from '../../../components/icons/TaxonomyStackIcon';
import { getObjectType } from '../../../data/mockObjectTypes';
import { useObjectTypeWorkspace } from '../context/ObjectTypeWorkspaceContext';
import ObjectTypeSectionCard from '../sections/ObjectTypeSectionCard';
import AttributePickerPopover from './AttributePickerPopover';
import TaxonomyTreeEditor from './TaxonomyTreeEditor';
import ValuePickerPopover from './ValuePickerPopover';
import styles from './TaxonomyTree.module.css';

export default function TaxonomyTreeSection({
  objectTypeId,
  onOpenTaxonomy,
}) {
  const objectType = getObjectType(objectTypeId);
  const {
    getTreeState,
    addSubtypeValues,
    renameTreeNode,
    deleteTreeNode,
  } = useObjectTypeWorkspace();

  const treeState = getTreeState(objectTypeId);
  const nodeCount = treeState.nodes.length;
  const taxonomy = treeState.taxonomy;

  const [flow, setFlow] = useState(null);
  // { parentId, parentLabel, step: 'attribute' | 'values', attributeId? }

  const parentNode = useMemo(() => {
    if (!flow?.parentId) return null;
    return treeState.nodes.find((node) => node.id === flow.parentId) ?? null;
  }, [flow, treeState.nodes]);

  const openCreateFlow = (parentId = null, parentLabel = objectType.name) => {
    setFlow({ parentId, parentLabel, step: 'attribute' });
  };

  const closeFlow = () => setFlow(null);

  const handleSelectAttribute = (attributeId) => {
    setFlow((current) => ({ ...current, step: 'values', attributeId }));
  };

  const handleAddValue = (value) => {
    if (!flow?.attributeId) return;
    addSubtypeValues(objectTypeId, {
      parentId: flow.parentId,
      attributeId: flow.attributeId,
      values: [value],
    });
    closeFlow();
  };

  const handleAddAll = (values) => {
    if (!flow?.attributeId || !values?.length) return;
    addSubtypeValues(objectTypeId, {
      parentId: flow.parentId,
      attributeId: flow.attributeId,
      values,
    });
    closeFlow();
  };

  const handleRenameNode = (node) => {
    const nextLabel = window.prompt('Rename subtype', node.label);
    if (nextLabel?.trim()) renameTreeNode(objectTypeId, node.id, nextLabel.trim());
  };

  const handleDeleteNode = (node) => {
    const confirmed = window.confirm(
      `Delete "${node.label}" and all nested subtypes beneath it?`,
    );
    if (confirmed) deleteTreeNode(objectTypeId, node.id);
  };

  return (
    <ObjectTypeSectionCard title="Subtype hierarchy" count={nodeCount || undefined}>
      <div className={styles.treeSection}>
        {taxonomy ? (
          <div className={styles.treeLinkedTaxonomy}>
            <span>Linked taxonomy:</span>
            <TaxonomyStackIcon size={18} title="" />
            <button
              type="button"
              className={styles.treeLinkedTaxonomyLink}
              onClick={() => onOpenTaxonomy?.(taxonomy.id)}
            >
              {taxonomy.name}
            </button>
          </div>
        ) : null}

        {nodeCount === 0 ? (
          <div className={styles.treeEmpty}>
            <h4 className={styles.treeEmptyTitle}>Specialise this object type</h4>
            <p className={styles.treeEmptyCopy}>
              Subtypes let you progressively specialise an object type into more specific business
              concepts. Start a hierarchy by splitting on an attribute, then continue splitting any
              node to any depth.
            </p>
            <button
              type="button"
              className={styles.treePrimaryBtn}
              onClick={() => openCreateFlow()}
            >
              Create subtype hierarchy
            </button>
          </div>
        ) : (
          <TaxonomyTreeEditor
            objectTypeName={objectType.name}
            nodes={treeState.nodes}
            onSplitNode={(node) => openCreateFlow(node.id, node.label)}
            onRenameNode={handleRenameNode}
            onDeleteNode={handleDeleteNode}
          />
        )}
      </div>

      <AttributePickerPopover
        open={flow?.step === 'attribute'}
        objectTypeId={objectTypeId}
        nodes={treeState.nodes}
        parentId={flow?.parentId ?? null}
        parentLabel={flow?.parentLabel ?? objectType.name}
        onSelectAttribute={handleSelectAttribute}
        onClose={closeFlow}
      />

      <ValuePickerPopover
        open={flow?.step === 'values'}
        objectTypeId={objectTypeId}
        attributeId={flow?.attributeId}
        parentId={flow?.parentId ?? null}
        parentLabel={flow?.parentLabel ?? objectType.name}
        nodes={treeState.nodes}
        onAddValue={handleAddValue}
        onAddAll={handleAddAll}
        onBack={() => setFlow((current) => ({ ...current, step: 'attribute', attributeId: undefined }))}
        onClose={closeFlow}
      />
    </ObjectTypeSectionCard>
  );
}
