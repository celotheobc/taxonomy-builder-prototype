import { useRef, useState } from 'react';
import { getAttribute, getObjectType } from '../../data/mockObjectTypes';
import { useObjectTypeWorkspace } from './context/ObjectTypeWorkspaceContext';
import TaxonomyEditorLayout from './layout/TaxonomyEditorLayout';
import TaxonomyRightInspector from './inspector/TaxonomyRightInspector';
import TaxonomyBottomPanel from './panels/TaxonomyBottomPanel';
import ObjectTypePageHeader from './sections/ObjectTypePageHeader';
import AttributesBindingsSection from './sections/AttributesBindingsSection';
import SubtypeNestingSection from './sections/SubtypeNestingSection';
import RelationshipsSection from './sections/RelationshipsSection';
import AgentContextSection from './sections/AgentContextSection';
import TaxonomyTreeSection from './tree/TaxonomyTreeSection';
import { usePanelDimensionsV5 } from '../v5/layout/usePanelDimensionsV5';
import { SELECTION_TYPES, useObjectTypeSelection } from './selection/useObjectTypeSelection';
import styles from './TaxonomyRefineView.module.css';

export default function TaxonomyRefineView({
  objectTypeId,
  subtypeId = null,
  onOpenTaxonomy,
  onOpenObjectType,
  onNavigateToParent,
}) {
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(true);
  const [bottomTab, setBottomTab] = useState('preview');
  const [previewSubtypeId, setPreviewSubtypeId] = useState(subtypeId);
  const treeSectionRef = useRef(null);
  const { rightWidth, bottomHeight, adjustRightWidth, adjustBottomHeight } =
    usePanelDimensionsV5();
  const { getSplitState, getAllSubtypeEntries, getSubtypeMapping } = useObjectTypeWorkspace();
  const objectType = getObjectType(objectTypeId);
  const splitState = getSplitState(objectTypeId);
  const subtypeEntries = getAllSubtypeEntries(splitState);
  const subtypeEntry =
    subtypeId != null
      ? subtypeEntries.find((entry) => entry.subtype.id === subtypeId) ?? null
      : null;
  const isSubtypeView = Boolean(subtypeEntry);
  const visibleSubtypes = subtypeEntries.map((entry) => entry.subtype);
  const primaryEntry = subtypeEntry ?? subtypeEntries[0] ?? null;
  const splitAttribute = primaryEntry
    ? getAttribute(objectType, primaryEntry.splitAttributeId)
    : null;

  const {
    selection,
    selectAttribute,
    selectBinding,
    selectRelationship,
  } = useObjectTypeSelection();

  const selectedAttributeId =
    selection.type === SELECTION_TYPES.ATTRIBUTE ? selection.id : null;
  const selectedBindingId = selection.type === SELECTION_TYPES.BINDING ? selection.id : null;
  const selectedRelationshipId =
    selection.type === SELECTION_TYPES.RELATIONSHIP ? selection.id : null;

  const mappingRows = getSubtypeMapping(objectTypeId);

  const scrollToHierarchy = () => {
    treeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePreviewSubtype = (nextSubtypeId) => {
    setPreviewSubtypeId(nextSubtypeId);
    setBottomTab('preview');
    setBottomCollapsed(false);
  };

  if (subtypeId && !subtypeEntry) {
    return (
      <div className={styles.missingSubtype}>
        Subtype not found. It may have been removed from {objectType?.name ?? 'the parent object'}.
      </div>
    );
  }

  const activePreviewSubtypeId = previewSubtypeId ?? subtypeId;

  return (
    <TaxonomyEditorLayout
      mainContent={
        <div className={styles.workArea}>
          <ObjectTypePageHeader
            objectTypeId={objectTypeId}
            subtypeEntry={subtypeEntry}
            onNavigateToParent={onNavigateToParent}
          />
          <AttributesBindingsSection
            objectTypeId={objectTypeId}
            splitState={splitState}
            selectedAttributeId={selectedAttributeId}
            selectedBindingId={selectedBindingId}
            onSelectAttribute={selectAttribute}
            onSelectBinding={selectBinding}
            onScrollToHierarchy={scrollToHierarchy}
          />
          {isSubtypeView ? (
            <SubtypeNestingSection
              parentObjectTypeName={objectType.name}
              onOpenParent={onNavigateToParent}
            />
          ) : (
            <div ref={treeSectionRef}>
              <TaxonomyTreeSection
                objectTypeId={objectTypeId}
                onOpenTaxonomy={onOpenTaxonomy}
                onOpenSubtype={(subtypeId) => onOpenObjectType?.(objectTypeId, subtypeId)}
                onPreviewSubtype={handlePreviewSubtype}
              />
            </div>
          )}
          <RelationshipsSection
            objectTypeId={objectTypeId}
            selectedRelationshipId={selectedRelationshipId}
            onSelectRelationship={selectRelationship}
          />
          <AgentContextSection objectTypeId={objectTypeId} />
        </div>
      }
      rightInspector={
        <TaxonomyRightInspector
          objectTypeId={objectTypeId}
          subtypeEntry={subtypeEntry}
          collapsed={rightCollapsed}
          onToggle={() => setRightCollapsed((value) => !value)}
          width={rightWidth}
          onResizeWidth={adjustRightWidth}
          onOpenTaxonomy={onOpenTaxonomy}
        />
      }
      bottomPanel={
        <TaxonomyBottomPanel
          objectTypeId={objectTypeId}
          objectTypeName={objectType.name}
          treeNodes={splitState.nodes}
          mappingRows={mappingRows}
          activeTab={bottomTab}
          onTabChange={setBottomTab}
          collapsed={bottomCollapsed}
          onToggle={() => setBottomCollapsed((value) => !value)}
          height={bottomHeight}
          onResizeHeight={adjustBottomHeight}
          generatedTaxonomy={splitState.taxonomy ?? primaryEntry?.taxonomy ?? null}
          previewSubtypeId={activePreviewSubtypeId}
          onPreviewSubtype={handlePreviewSubtype}
        />
      }
    />
  );
}
