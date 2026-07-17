import { useEffect, useMemo, useState } from 'react';
import { getAttributeTotalRows, getObjectType } from '../../data/mockObjectTypes';
import { UNGROUPED_GROUP_ID } from '../../data/taxonomyHierarchy';
import { useObjectTypeWorkspace } from './context/ObjectTypeWorkspaceContext';
import TaxonomyEditorLayout from './layout/TaxonomyEditorLayout';
import TaxonomyAssetInspector from './inspector/TaxonomyAssetInspector';
import TaxonomyAssetBottomPanel from './panels/TaxonomyAssetBottomPanel';
import SubtypesSplitLayout from './subtypes/SubtypesSplitLayout';
import splitStyles from './subtypes/SubtypesSection.module.css';
import { useSubtypesSplitWidth } from './subtypes/useSubtypesSplitWidth';
import TaxonomyGroupDetailPanel from './taxonomy/TaxonomyGroupDetailPanel';
import TaxonomyHierarchyNav from './taxonomy/TaxonomyHierarchyNav';
import { usePanelDimensionsV5 } from '../v5/layout/usePanelDimensionsV5';
import styles from './taxonomy/TaxonomyEditor.module.css';

export default function TaxonomyAssetView({
  taxonomyId,
  onOpenObjectType,
  onOpenSubtype,
}) {
  const {
    getTaxonomy,
    getTaxonomyHierarchy,
    addTaxonomyGroup,
    renameTaxonomyGroup,
    deleteTaxonomyGroup,
    updateTaxonomyGroupDescription,
    addMembersToTaxonomyGroup,
    removeMemberFromTaxonomyGroup,
  } = useObjectTypeWorkspace();

  const taxonomy = getTaxonomy(taxonomyId);
  const hierarchy = getTaxonomyHierarchy(taxonomyId);
  const { leftWidth, adjustLeftWidth } = useSubtypesSplitWidth();
  const { rightWidth, bottomHeight, adjustRightWidth, adjustBottomHeight } = usePanelDimensionsV5();

  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(true);
  const [bottomTab, setBottomTab] = useState('preview');
  const [selectedGroupId, setSelectedGroupId] = useState(UNGROUPED_GROUP_ID);
  const [previewSubtypeId, setPreviewSubtypeId] = useState(null);

  useEffect(() => {
    setSelectedGroupId(UNGROUPED_GROUP_ID);
    setPreviewSubtypeId(null);
    setBottomCollapsed(true);
  }, [taxonomyId]);

  const handleCreateGroup = (label) => {
    const groupId = addTaxonomyGroup(taxonomyId, {
      label,
      parentId: null,
      description: '',
    });
    if (groupId) setSelectedGroupId(groupId);
  };

  const subtypes = useMemo(
    () => taxonomy?.subtypes.filter((subtype) => !subtype.hidden) ?? [],
    [taxonomy],
  );

  const actualTotalRows = useMemo(() => {
    if (!taxonomy) return 0;
    const objectType = getObjectType(taxonomy.sourceObjectTypeId);
    return getAttributeTotalRows(objectType, taxonomy.splitAttributeId);
  }, [taxonomy]);

  const previewSubtype = subtypes.find((subtype) => subtype.id === previewSubtypeId) ?? null;

  if (!taxonomy) {
    return <div className={styles.missing}>Taxonomy asset not found. Create subtypes from an Object Type first.</div>;
  }

  const openPreview = (subtypeId, tab = 'preview') => {
    setPreviewSubtypeId(subtypeId);
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
              Organise subtype members created from{' '}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => onOpenObjectType?.(taxonomy.sourceObjectTypeId)}
              >
                {taxonomy.sourceObjectTypeName}
              </button>{' '}
              · split by {taxonomy.splitAttributeName}
            </p>
          </header>

          <div className={styles.editorShell}>
            <div className={styles.editorPanel}>
            <SubtypesSplitLayout
              leftWidth={leftWidth}
              onAdjustLeftWidth={adjustLeftWidth}
              left={
                <div className={splitStyles.splitColumn}>
                  <TaxonomyHierarchyNav
                  taxonomyName={taxonomy.name}
                  groups={hierarchy.groups}
                  subtypes={subtypes}
                  selectedGroupId={selectedGroupId}
                  onSelectGroup={setSelectedGroupId}
                  onCreateGroup={() => {
                    const label = window.prompt('New group name', 'Planning');
                    if (label?.trim()) handleCreateGroup(label.trim());
                  }}
                />
                </div>
              }
              right={
                <div className={splitStyles.splitColumn}>
                  <div className={splitStyles.splitColumnBody}>
                    <TaxonomyGroupDetailPanel
                  selectedGroupId={selectedGroupId}
                  groups={hierarchy.groups}
                  subtypes={subtypes}
                  totalRows={actualTotalRows}
                  onUpdateDescription={(groupId, description) =>
                    updateTaxonomyGroupDescription(taxonomy.id, groupId, description)
                  }
                  onRenameGroup={(groupId, label) =>
                    renameTaxonomyGroup(taxonomy.id, groupId, label)
                  }
                  onDeleteGroup={(groupId) => {
                    deleteTaxonomyGroup(taxonomy.id, groupId);
                    setSelectedGroupId(UNGROUPED_GROUP_ID);
                  }}
                  onCreateGroup={handleCreateGroup}
                  onAddChildGroup={(parentId, label) => {
                    const childId = addTaxonomyGroup(taxonomy.id, {
                      label,
                      parentId,
                      description: '',
                    });
                    if (childId) setSelectedGroupId(childId);
                  }}
                  onAddMembers={(groupId, memberIds) =>
                    addMembersToTaxonomyGroup(taxonomy.id, groupId, memberIds)
                  }
                  onMoveMemberToGroup={(groupId, memberId) =>
                    addMembersToTaxonomyGroup(taxonomy.id, groupId, [memberId])
                  }
                  onRemoveMember={(groupId, memberId) =>
                    removeMemberFromTaxonomyGroup(taxonomy.id, groupId, memberId)
                  }
                  onPreviewMember={(subtypeId) => openPreview(subtypeId, 'preview')}
                  onOpenMember={(subtypeId) =>
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
          groups={hierarchy.groups}
          subtypes={subtypes}
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
