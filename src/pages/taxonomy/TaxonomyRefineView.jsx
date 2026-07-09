import { useRef, useState } from 'react';
import { getAttribute, getObjectType } from '../../data/mockObjectTypes';
import { SUBTYPES_UI_MODE, useObjectTypeWorkspace } from './context/ObjectTypeWorkspaceContext';
import TaxonomyEditorLayout from './layout/TaxonomyEditorLayout';
import TaxonomyRightInspector from './inspector/TaxonomyRightInspector';
import TaxonomyBottomPanel from './panels/TaxonomyBottomPanel';
import ObjectTypePageHeader from './sections/ObjectTypePageHeader';
// Temporarily hidden — spoke graph overview panel
// import OverviewSection from './sections/OverviewSection';
import AttributesBindingsSection from './sections/AttributesBindingsSection';
import SubtypesSection from './subtypes/SubtypesSection';
import SubtypeNestingSection from './sections/SubtypeNestingSection';
import RelationshipsSection from './sections/RelationshipsSection';
import AgentContextSection from './sections/AgentContextSection';
import { usePanelDimensionsV5 } from '../v5/layout/usePanelDimensionsV5';
import { SELECTION_TYPES, useObjectTypeSelection } from './selection/useObjectTypeSelection';
import styles from './TaxonomyRefineView.module.css';

export default function TaxonomyRefineView({
  objectTypeId,
  subtypeId = null,
  onTaxonomyGenerated,
  onOpenTaxonomy,
  onOpenObjectType,
  onNavigateToParent,
}) {
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(true);
  const [bottomTab, setBottomTab] = useState('preview');
  const [previewSubtypeId, setPreviewSubtypeId] = useState(subtypeId);
  const subtypesSectionRef = useRef(null);
  const { rightWidth, bottomHeight, adjustRightWidth, adjustBottomHeight } =
    usePanelDimensionsV5();
  const { getSplitState, openCreationWithAttribute, setSubtypesUiMode, getAllSubtypeEntries } =
    useObjectTypeWorkspace();
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

  const handlePreviewSubtype = (nextSubtypeId) => {
    setPreviewSubtypeId(nextSubtypeId);
    setBottomTab('preview');
    setBottomCollapsed(false);
  };

  const handleCreateSubtypesFromAttribute = (attributeId) => {
    setSubtypesUiMode(objectTypeId, SUBTYPES_UI_MODE.CREATION);
    openCreationWithAttribute(objectTypeId, attributeId);
    subtypesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            onOpenTaxonomy={onOpenTaxonomy}
            onNavigateToParent={onNavigateToParent}
          />
          {/* <OverviewSection objectTypeId={objectTypeId} /> */}
          <AttributesBindingsSection
            objectTypeId={objectTypeId}
            splitState={splitState}
            selectedAttributeId={selectedAttributeId}
            selectedBindingId={selectedBindingId}
            onSelectAttribute={selectAttribute}
            onSelectBinding={selectBinding}
            onCreateSubtypesFromAttribute={isSubtypeView ? undefined : handleCreateSubtypesFromAttribute}
          />
          {isSubtypeView ? (
            <SubtypeNestingSection
              parentObjectTypeName={objectType.name}
              onOpenParent={onNavigateToParent}
            />
          ) : (
            <div ref={subtypesSectionRef}>
              <SubtypesSection
                objectTypeId={objectTypeId}
                onTaxonomyGenerated={onTaxonomyGenerated}
                onPreviewSubtype={handlePreviewSubtype}
                onOpenTaxonomy={onOpenTaxonomy}
                onOpenObjectType={onOpenObjectType}
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
          activeTab={bottomTab}
          onTabChange={setBottomTab}
          collapsed={bottomCollapsed}
          onToggle={() => setBottomCollapsed((value) => !value)}
          height={bottomHeight}
          onResizeHeight={adjustBottomHeight}
          subtypes={visibleSubtypes}
          generatedTaxonomy={primaryEntry?.taxonomy ?? null}
          splitAttribute={splitAttribute}
          previewSubtypeId={activePreviewSubtypeId}
        />
      }
    />
  );
}
