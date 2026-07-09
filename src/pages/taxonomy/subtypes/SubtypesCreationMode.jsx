import AttributeCandidateList from './AttributeCandidateList';
import AttributeWorkflowPanel from './AttributeWorkflowPanel';
import SubtypesSplitLayout from './SubtypesSplitLayout';

export default function SubtypesCreationMode({
  objectTypeId,
  splitState,
  selectedAttributeId,
  onSelectAttribute,
  onGenerate,
  canGenerate,
  isGenerating,
  isRegenerating,
  onPreview,
  onManage,
  onRegenerate,
  onDeleteSplit,
  onOpenTaxonomy,
  onOpenObjectType,
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
        <AttributeWorkflowPanel
          objectTypeId={objectTypeId}
          splitState={splitState}
          selectedAttributeId={selectedAttributeId}
          onGenerate={onGenerate}
          canGenerate={canGenerate}
          isGenerating={isGenerating}
          isRegenerating={isRegenerating}
          onPreview={onPreview}
          onManage={onManage}
          onRegenerate={onRegenerate}
          onDeleteSplit={onDeleteSplit}
          onOpenTaxonomy={onOpenTaxonomy}
          onOpenObjectType={onOpenObjectType}
        />
      }
    />
  );
}
