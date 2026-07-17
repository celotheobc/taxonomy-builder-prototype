import HierarchyView from './HierarchyView';

export default function HierarchyList({
  metadataVariant = 'two-row',
  objectTypeId,
  objectTypeName,
  nodes,
  rootSplitAttributeId = null,
  expandedNodeIds = [],
  selectedNodeId,
  taxonomyId = null,
  taxonomyName = null,
  onToggleExpand,
  onOpenSubtype,
  onSelectNode,
  onPreviewNode,
  onSplitNode,
  onEditSplitNode,
  onEditRootSplit,
  onRenameNode,
  onDeleteNode,
  onAddSplitValues,
  onOpenTaxonomy,
  readOnly = false,
  renamingNodeId,
  renameDraft,
  onRenameDraftChange,
  onRenameConfirm,
  onRenameCancel,
}) {
  const rowProps = {
    selectedId: selectedNodeId,
    readOnly,
    renamingNodeId,
    renameDraft,
    onToggleExpand,
    onOpenSubtype,
    onSelectNode,
    onPreviewNode,
    onSplit: onSplitNode,
    onEditSplit: onEditSplitNode,
    onEditRootSplit,
    onRename: (node) => onRenameNode?.(node),
    onDelete: onDeleteNode,
    onAddSplitValues,
    onOpenTaxonomy,
    onRenameDraftChange,
    onRenameConfirm,
    onRenameCancel,
  };

  return (
    <HierarchyView
      objectTypeId={objectTypeId}
      objectTypeName={objectTypeName}
      nodes={nodes}
      rootSplitAttributeId={rootSplitAttributeId}
      expandedNodeIds={expandedNodeIds}
      taxonomyId={taxonomyId}
      taxonomyName={taxonomyName}
      metadataVariant={metadataVariant}
      rowProps={rowProps}
    />
  );
}
