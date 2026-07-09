import AttributeCandidateList from './AttributeCandidateList';
import AttributeWorkflowPanel from './AttributeWorkflowPanel';
import SubtypesSplitLayout from './SubtypesSplitLayout';
import styles from './SubtypesSection.module.css';

export default function SubtypesCreationMode({
  objectTypeId,
  splitState,
  selectedAttributeId,
  onSelectAttribute,
  onGenerate,
  canGenerate,
  isGenerating,
  isRegenerating,
  onRegenerate,
  onDeleteSplit,
  onOpenTaxonomy,
  onOpenObjectType,
  onPreviewSubtype,
  onDeleteSubtype,
  leftWidth,
  onAdjustLeftWidth,
}) {
  return (
    <SubtypesSplitLayout
      leftWidth={leftWidth}
      onAdjustLeftWidth={onAdjustLeftWidth}
      left={
        <AttributeCandidateList
          objectTypeId={objectTypeId}
          splitState={splitState}
          selectedAttributeId={selectedAttributeId}
          onSelectAttribute={onSelectAttribute}
        />
      }
      right={
        <div className={styles.splitColumn}>
          <h3 className={styles.splitColumnTitle}>Attribute details</h3>
          <div className={styles.splitColumnBody}>
            <AttributeWorkflowPanel
              objectTypeId={objectTypeId}
              splitState={splitState}
              selectedAttributeId={selectedAttributeId}
              onGenerate={onGenerate}
              canGenerate={canGenerate}
              isGenerating={isGenerating}
              isRegenerating={isRegenerating}
              onRegenerate={onRegenerate}
              onDeleteSplit={onDeleteSplit}
              onOpenTaxonomy={onOpenTaxonomy}
              onOpenObjectType={onOpenObjectType}
              onPreviewSubtype={onPreviewSubtype}
              onDeleteSubtype={onDeleteSubtype}
            />
          </div>
        </div>
      }
    />
  );
}
