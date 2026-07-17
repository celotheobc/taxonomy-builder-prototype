import { useEffect, useMemo, useState } from 'react';
import { getHierarchyStats } from '../../data/taxonomyTreeModel';
import { getObjectType } from '../../data/mockObjectTypes';
import { useObjectTypeWorkspace } from './context/ObjectTypeWorkspaceContext';
import TaxonomyEditorLayout from './layout/TaxonomyEditorLayout';
import TaxonomyAssetInspector from './inspector/TaxonomyAssetInspector';
import TaxonomyAssetBottomPanel from './panels/TaxonomyAssetBottomPanel';
import SubtypesSplitLayout from './subtypes/SubtypesSplitLayout';
import splitStyles from './subtypes/SubtypesSection.module.css';
import { useSubtypesSplitWidth } from './subtypes/useSubtypesSplitWidth';
import HierarchyList from './hierarchy/HierarchyList';
import TaxonomyNodeDetailPanel from './hierarchy/TaxonomyNodeDetailPanel';
import { usePanelDimensionsV5 } from '../v5/layout/usePanelDimensionsV5';
import styles from './taxonomy/TaxonomyEditor.module.css';

export default function TaxonomyAssetView({
  taxonomyId,
  onOpenObjectType,
  onOpenSubtype,
  onOpenTaxonomy,
}) {
  const {
    getTaxonomy,
    getTreeState,
    renameTreeNode,
    updateTreeNodeDescription,
    toggleNodeExpanded,
    ensureNodesExpanded,
    getAncestorIds,
  } = useObjectTypeWorkspace();

  const taxonomy = getTaxonomy(taxonomyId);
  const objectTypeId = taxonomy?.sourceObjectTypeId;
  const treeState = objectTypeId ? getTreeState(objectTypeId) : { nodes: [], expandedNodeIds: [] };
  const objectType = objectTypeId ? getObjectType(objectTypeId) : null;

  const { leftWidth, adjustLeftWidth } = useSubtypesSplitWidth();
  const { rightWidth, bottomHeight, adjustRightWidth, adjustBottomHeight } = usePanelDimensionsV5();

  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(true);
  const [bottomTab, setBottomTab] = useState('preview');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [previewSubtypeId, setPreviewSubtypeId] = useState(null);

  useEffect(() => {
    setSelectedNodeId(null);
    setPreviewSubtypeId(null);
    setBottomCollapsed(true);
  }, [taxonomyId]);

  const selectedNode = useMemo(
    () => treeState.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [treeState.nodes, selectedNodeId],
  );

  const parentLabel = useMemo(() => {
    if (!selectedNode) return objectType?.name ?? '';
    if (!selectedNode.parentId) return objectType?.name ?? '';
    return treeState.nodes.find((node) => node.id === selectedNode.parentId)?.label ?? objectType?.name ?? '';
  }, [selectedNode, treeState.nodes, objectType?.name]);

  const subtypes = useMemo(
    () => taxonomy?.subtypes.filter((subtype) => !subtype.hidden) ?? [],
    [taxonomy],
  );

  const previewSubtype = subtypes.find((subtype) => subtype.id === previewSubtypeId) ?? null;

  const hierarchyStats = getHierarchyStats(treeState.nodes);

  if (!taxonomy || !objectType) {
    return (
      <div className={styles.missing}>
        Taxonomy asset not found. Create subtypes from an Object Type first.
      </div>
    );
  }

  const handleSelectNode = (node) => {
    setSelectedNodeId(node.id);
    ensureNodesExpanded(objectTypeId, getAncestorIds(node.id, treeState.nodes));
  };

  const openPreview = (subtypeId, tab = 'preview') => {
    setPreviewSubtypeId(subtypeId);
    setSelectedNodeId(subtypeId);
    setBottomTab(tab);
    setBottomCollapsed(false);
  };

  return (
    <TaxonomyEditorLayout
      mainContent={
        <div className={styles.workArea}>
          <header className={styles.pageHeader}>
            <p className={styles.eyebrow}>Taxonomy</p>
            <h1 className={styles.pageTitle}>{taxonomy.name}</h1>
            <p className={styles.pageSubtitle}>
              Specialisation hierarchy for{' '}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => onOpenObjectType?.(taxonomy.sourceObjectTypeId)}
              >
                {taxonomy.sourceObjectTypeName}
              </button>
            </p>
          </header>

          <div className={styles.editorShell}>
            <div className={styles.editorPanel}>
              <SubtypesSplitLayout
                leftWidth={leftWidth}
                onAdjustLeftWidth={adjustLeftWidth}
                left={
                  <div className={`${splitStyles.splitColumn} ${splitStyles.splitColumnBody}`}>
                    <HierarchyList
                      objectTypeId={objectTypeId}
                      objectTypeName={objectType.name}
                      nodes={treeState.nodes}
                      rootSplitAttributeId={treeState.rootSplitAttributeId}
                      expandedNodeIds={treeState.expandedNodeIds}
                      selectedNodeId={selectedNodeId}
                      taxonomyId={taxonomy.id}
                      taxonomyName={taxonomy.name}
                      onToggleExpand={(nodeId) => toggleNodeExpanded(objectTypeId, nodeId)}
                      onSelectNode={handleSelectNode}
                      onOpenTaxonomy={onOpenTaxonomy}
                      readOnly
                    />
                  </div>
                }
                right={
                  <div className={splitStyles.splitColumn}>
                    <div className={splitStyles.splitColumnBody}>
                      <TaxonomyNodeDetailPanel
                        objectTypeId={objectTypeId}
                        node={selectedNode}
                        allNodes={treeState.nodes}
                        parentLabel={parentLabel}
                        onRename={(nodeId, label) => renameTreeNode(objectTypeId, nodeId, label)}
                        onUpdateDescription={(nodeId, description) =>
                          updateTreeNodeDescription(objectTypeId, nodeId, description)
                        }
                        onPreview={(subtypeId) => openPreview(subtypeId, 'preview')}
                        onOpenSubtype={(subtypeId) =>
                          onOpenSubtype?.(taxonomy.sourceObjectTypeId, subtypeId)
                        }
                      />
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      }
      rightInspector={
        <TaxonomyAssetInspector
          taxonomy={taxonomy}
          hierarchyStats={hierarchyStats}
          collapsed={rightCollapsed}
          onToggle={() => setRightCollapsed((value) => !value)}
          width={rightWidth}
          onResizeWidth={adjustRightWidth}
          onOpenObjectType={onOpenObjectType}
        />
      }
      bottomPanel={
        <TaxonomyAssetBottomPanel
          activeTab={bottomTab}
          onTabChange={setBottomTab}
          collapsed={bottomCollapsed}
          onToggle={() => setBottomCollapsed((value) => !value)}
          height={bottomHeight}
          onResizeHeight={adjustBottomHeight}
          objectTypeId={taxonomy.sourceObjectTypeId}
          previewSubtypeId={previewSubtypeId}
          previewSubtypeLabel={previewSubtype?.label}
          sourceAttributeName={taxonomy.splitAttributeName}
          sourceRecords={previewSubtype ? [previewSubtype] : []}
        />
      }
    />
  );
}
