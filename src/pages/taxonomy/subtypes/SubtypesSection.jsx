import { useState } from 'react';
import { canGenerateSubtypesFromAttribute, getObjectType } from '../../../data/mockObjectTypes';
import {
  SUBTYPES_UI_MODE,
  useObjectTypeWorkspace,
} from '../context/ObjectTypeWorkspaceContext';
import ObjectTypeSectionCard from '../sections/ObjectTypeSectionCard';
import SubtypesCreationMode from './SubtypesCreationMode';
import SubtypesManagementMode from './SubtypesManagementMode';
import { useSubtypesSplitWidth } from './useSubtypesSplitWidth';
import styles from './SubtypesSection.module.css';

const GENERATION_DELAY_MS = 1400;

export default function SubtypesSection({
  objectTypeId,
  onTaxonomyGenerated,
  onPreviewSubtype,
  onOpenTaxonomy,
  onOpenObjectType,
}) {
  const objectType = getObjectType(objectTypeId);
  const { leftWidth, adjustLeftWidth } = useSubtypesSplitWidth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const {
    getSplitState,
    hasSubtypes,
    setSubtypesUiMode,
    selectSplitAttribute,
    generateSubtypes,
    regenerateSubtypes,
    deleteSplitForAttribute,
    renameSubtype,
    deleteSubtype,
    getAllSubtypeEntries,
  } = useObjectTypeWorkspace();

  const splitState = getSplitState(objectTypeId);
  const subtypeEntries = getAllSubtypeEntries(splitState);
  const generated = hasSubtypes(objectTypeId);
  const uiMode = splitState.uiMode;
  const isCreation = uiMode === SUBTYPES_UI_MODE.CREATION;
  const activeAttributeId = splitState.selectedAttributeId;
  const canGenerate = Boolean(
    activeAttributeId &&
      canGenerateSubtypesFromAttribute(objectType, activeAttributeId) &&
      !isGenerating &&
      !isRegenerating,
  );

  const handleGenerate = async (selectedMatchingValues) => {
    if (!canGenerate || !activeAttributeId || !selectedMatchingValues?.length) return;
    setIsGenerating(true);
    await new Promise((resolve) => {
      window.setTimeout(resolve, GENERATION_DELAY_MS);
    });
    const taxonomy = generateSubtypes(objectTypeId, activeAttributeId, selectedMatchingValues);
    setIsGenerating(false);
    if (!taxonomy) return;

    onTaxonomyGenerated?.(taxonomy);
  };

  const handleRegenerate = async (selectedMatchingValues) => {
    if (!activeAttributeId || isRegenerating) return;

    const splitStateNow = getSplitState(objectTypeId);
    const activeSplit = splitStateNow.splitsByAttributeId?.[activeAttributeId];
    const matchingValues =
      selectedMatchingValues?.length > 0
        ? selectedMatchingValues
        : (activeSplit?.subtypes ?? [])
            .filter((subtype) => !subtype.hidden)
            .map((subtype) => subtype.matchingValue);
    if (!matchingValues.length) return;

    setIsRegenerating(true);
    await new Promise((resolve) => {
      window.setTimeout(resolve, GENERATION_DELAY_MS);
    });
    regenerateSubtypes(objectTypeId, activeAttributeId, matchingValues);
    setIsRegenerating(false);
  };

  const handleDeleteSplit = () => {
    if (!activeAttributeId) return;
    if (window.confirm('Delete all subtypes created from this attribute?')) {
      deleteSplitForAttribute(objectTypeId, activeAttributeId);
    }
  };

  const cardActions = (
    <div className={styles.modeToggle} role="tablist" aria-label="Subtype views">
      <button
        type="button"
        role="tab"
        aria-selected={isCreation}
        className={isCreation ? styles.modeBtnActive : styles.modeBtn}
        onClick={() => setSubtypesUiMode(objectTypeId, SUBTYPES_UI_MODE.CREATION)}
      >
        By Attribute
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={!isCreation}
        className={!isCreation ? styles.modeBtnActive : styles.modeBtn}
        onClick={() => setSubtypesUiMode(objectTypeId, SUBTYPES_UI_MODE.MANAGEMENT)}
      >
        By Subtype and Taxonomy
      </button>
    </div>
  );

  return (
    <ObjectTypeSectionCard
      title="Subtypes"
      count={generated ? subtypeEntries.length : undefined}
      actions={cardActions}
    >
      <div className={styles.subtypesBody}>
        {isCreation ? (
          <SubtypesCreationMode
            objectTypeId={objectTypeId}
            splitState={splitState}
            selectedAttributeId={activeAttributeId}
            onSelectAttribute={(attributeId) => selectSplitAttribute(objectTypeId, attributeId)}
            onGenerate={handleGenerate}
            canGenerate={canGenerate}
            isGenerating={isGenerating}
            isRegenerating={isRegenerating}
            onRegenerate={handleRegenerate}
            onDeleteSplit={handleDeleteSplit}
            onOpenTaxonomy={onOpenTaxonomy}
            onOpenObjectType={(subtypeId) => onOpenObjectType?.(objectTypeId, subtypeId)}
            onPreviewSubtype={onPreviewSubtype}
            onDeleteSubtype={(subtypeId) => deleteSubtype(objectTypeId, subtypeId)}
            leftWidth={leftWidth}
            onAdjustLeftWidth={adjustLeftWidth}
          />
        ) : (
          <SubtypesManagementMode
            objectTypeId={objectTypeId}
            subtypeEntries={subtypeEntries}
            onRenameSubtype={(subtypeId, label) => renameSubtype(objectTypeId, subtypeId, label)}
            onPreviewSubtype={onPreviewSubtype}
            onOpenObjectType={(subtypeId) => onOpenObjectType?.(objectTypeId, subtypeId)}
            onOpenTaxonomy={onOpenTaxonomy}
            onDeleteSubtype={(subtypeId) => {
              if (window.confirm('Delete this subtype?')) {
                deleteSubtype(objectTypeId, subtypeId);
              }
            }}
          />
        )}
      </div>
    </ObjectTypeSectionCard>
  );
}
