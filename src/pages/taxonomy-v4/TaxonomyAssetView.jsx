import { useEffect, useMemo, useState } from 'react';
import { getHierarchyStats } from '../../data/taxonomyTreeModel';
import { getObjectType } from '../../data/mockObjectTypes';
import { useObjectTypeWorkspace } from './context/ObjectTypeWorkspaceContext';
import TaxonomyEditorLayout from './layout/TaxonomyEditorLayout';
import TaxonomyAssetInspector from './inspector/TaxonomyAssetInspector';
import ObjectTypeSectionCard from './sections/ObjectTypeSectionCard';
import HierarchyList from './hierarchy/HierarchyList';
import TaxonomyOverview from './taxonomy/TaxonomyOverview';
import TaxonomyConfigurationSection from './taxonomy/TaxonomyConfigurationSection';
import TaxonomyValueDetailPanel from './taxonomy/TaxonomyValueDetailPanel';
import SubtypesSplitLayout from './subtypes/SubtypesSplitLayout';
import splitStyles from './subtypes/SubtypesSection.module.css';
import { useSubtypesSplitWidth } from './subtypes/useSubtypesSplitWidth';
import { usePanelDimensionsV5 } from '../v5/layout/usePanelDimensionsV5';
import styles from './taxonomy/TaxonomyEditor.module.css';

function formatUpdatedAt(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function buildLeadCopy(taxonomy) {
  const attribute = taxonomy.splitAttributeName;
  const object = taxonomy.sourceObjectTypeName;
  return `Generated taxonomy organising ${object} subtypes using the ${attribute} attribute.`;
}

export default function TaxonomyAssetView({
  taxonomyId,
  onOpenObjectType,
  onOpenSubtype,
}) {
  const {
    getTaxonomy,
    getTreeState,
    toggleNodeExpanded,
    ensureNodesExpanded,
    getAncestorIds,
  } = useObjectTypeWorkspace();

  const taxonomy = getTaxonomy(taxonomyId);
  const objectTypeId = taxonomy?.sourceObjectTypeId;
  const treeState = objectTypeId ? getTreeState(objectTypeId) : { nodes: [], expandedNodeIds: [] };
  const objectType = objectTypeId ? getObjectType(objectTypeId) : null;

  const { leftWidth, adjustLeftWidth } = useSubtypesSplitWidth();
  const { rightWidth, adjustRightWidth } = usePanelDimensionsV5();
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  useEffect(() => {
    setSelectedNodeId(null);
  }, [taxonomyId]);

  const hierarchyStats = useMemo(
    () => getHierarchyStats(treeState.nodes),
    [treeState.nodes],
  );

  const selectedNode = useMemo(
    () => treeState.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [treeState.nodes, selectedNodeId],
  );

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

  return (
    <TaxonomyEditorLayout
      mainContent={
        <div className={styles.workArea}>
          <header className={styles.pageHeader}>
            <div className={styles.pageHeaderMain}>
              <p className={styles.eyebrow}>Taxonomy</p>
              <h1 className={styles.pageTitle}>{taxonomy.name}</h1>
              <p className={styles.pageLead}>{buildLeadCopy(taxonomy)}</p>
            </div>
          </header>

          <div className={styles.taxonomyEditorScroll}>
            <TaxonomyOverview
              taxonomy={taxonomy}
              hierarchyStats={hierarchyStats}
              onOpenObjectType={onOpenObjectType}
            />

            <TaxonomyConfigurationSection />

            <ObjectTypeSectionCard title="Taxonomy structure">
              {treeState.nodes.length === 0 ? (
                <p className={styles.structureEmpty}>
                  No values yet. Create subtypes on the source object to populate this taxonomy.
                </p>
              ) : (
                <div className={styles.structureSplitWrap}>
                  <SubtypesSplitLayout
                    leftWidth={leftWidth}
                    onAdjustLeftWidth={adjustLeftWidth}
                    left={
                      <div className={`${splitStyles.splitColumn} ${splitStyles.splitColumnBody} ${styles.structureTreePane}`}>
                        <HierarchyList
                          metadataVariant="taxonomy"
                          objectTypeId={objectTypeId}
                          objectTypeName={objectType.name}
                          nodes={treeState.nodes}
                          rootSplitAttributeId={treeState.rootSplitAttributeId}
                          expandedNodeIds={treeState.expandedNodeIds}
                          selectedNodeId={selectedNodeId}
                          onToggleExpand={(nodeId) => toggleNodeExpanded(objectTypeId, nodeId)}
                          onSelectNode={handleSelectNode}
                          readOnly
                        />
                      </div>
                    }
                    right={
                      <div className={`${splitStyles.splitColumn} ${styles.structureDetailPane}`}>
                        <TaxonomyValueDetailPanel
                          node={selectedNode}
                          allNodes={treeState.nodes}
                          objectType={objectType}
                          sourceObjectTypeId={taxonomy.sourceObjectTypeId}
                          onOpenSubtype={onOpenSubtype}
                        />
                      </div>
                    }
                  />
                </div>
              )}
            </ObjectTypeSectionCard>
          </div>
        </div>
      }
      rightInspector={
        <TaxonomyAssetInspector
          taxonomy={taxonomy}
          collapsed={false}
          onToggle={() => {}}
          width={rightWidth}
          onResizeWidth={adjustRightWidth}
          lastUpdated={formatUpdatedAt(taxonomy.generatedAt)}
        />
      }
      bottomPanel={null}
    />
  );
}
