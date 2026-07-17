import HierarchyHeadersView from './HierarchyHeadersView';
import HierarchyTreeView from './HierarchyTreeView';

export default function HierarchyList({
  presentation = 'tree',
  objectTypeId,
  objectTypeName,
  nodes,
  rootSplitAttributeId = null,
  expandedNodeIds = [],
  selectedNodeId,
  onToggleExpand,
  onOpenSubtype,
  onSelectNode,
  onPreviewNode,
  onSplitNode,
  onRenameNode,
  onDeleteNode,
  onAddSplitValues,
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
    onRename: (node) => onRenameNode?.(node),
    onDelete: onDeleteNode,
    onAddSplitValues,
    onRenameDraftChange,
    onRenameConfirm,
    onRenameCancel,
  };

  const viewProps = {
    objectTypeId,
    objectTypeName,
    nodes,
    rootSplitAttributeId,
    expandedNodeIds,
    rowProps,
  };

  if (presentation === 'headers') {
    return <HierarchyHeadersView {...viewProps} />;
  }

  return <HierarchyTreeView {...viewProps} />;
}
