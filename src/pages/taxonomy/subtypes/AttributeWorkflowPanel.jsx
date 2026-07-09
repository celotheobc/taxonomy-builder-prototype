import { useEffect, useState } from 'react';
import TaxonomyStackIcon from '../../../components/icons/TaxonomyStackIcon';
import {
  getAttribute,
  getAttributeSplitCandidate,
  getAttributeTotalRows,
  getDetectedValueCount,
  getDetectedValues,
  getObjectType,
} from '../../../data/mockObjectTypes';
import {
  getSplitForAttribute,
  hasSubtypesForAttribute,
} from '../context/ObjectTypeWorkspaceContext';
import DetailKpis from './DetailKpis';
import GeneratedSubtypePanel from './GeneratedSubtypePanel';
import SubtypeDistribution from './SubtypeDistribution';
import styles from './SubtypesSection.module.css';

function buildPreviewSummary(objectType, attributeId, candidate, valueCount, selectedCount) {
  if (candidate.recommendation === 'Not recommended' && candidate.uniquenessPercent >= 90) {
    const totalCount = getDetectedValueCount(objectType, attributeId);
    return `This attribute has ${totalCount.toLocaleString()} unique values (one per row). Splitting would create too many subtypes.`;
  }

  if (selectedCount === valueCount) {
    return `Select one or more values to become subtypes.`;
  }

  return `${selectedCount.toLocaleString()} of ${valueCount.toLocaleString()} attributes selected.`;
}

export default function AttributeWorkflowPanel({
  objectTypeId,
  splitState,
  selectedAttributeId,
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
}) {
  const objectType = getObjectType(objectTypeId);
  const selectedAttribute = selectedAttributeId
    ? getAttribute(objectType, selectedAttributeId)
    : null;
  const activeSplit = getSplitForAttribute(splitState, selectedAttributeId);
  const hasGenerated = hasSubtypesForAttribute(splitState, selectedAttributeId);

  const detectedValues = selectedAttributeId
    ? getDetectedValues(objectType, selectedAttributeId)
    : [];
  const candidate = selectedAttributeId
    ? getAttributeSplitCandidate(objectType, selectedAttributeId)
    : null;
  const distributionItems = detectedValues.length ? detectedValues : [];
  const previewValueCount = distributionItems.length;
  const uniqueValues = selectedAttributeId
    ? previewValueCount || getDetectedValueCount(objectType, selectedAttributeId)
    : 0;
  const totalRows = selectedAttributeId
    ? getAttributeTotalRows(objectType, selectedAttributeId)
    : 0;
  const visibleSubtypes = activeSplit?.subtypes.filter((subtype) => !subtype.hidden) ?? [];
  const usedValues = new Set(visibleSubtypes.map((subtype) => subtype.matchingValue));
  const unusedValues = distributionItems.filter((item) => !usedValues.has(item.value));

  const [selectedValues, setSelectedValues] = useState(() => new Set());
  const [selectedUnusedValues, setSelectedUnusedValues] = useState(() => new Set());
  const [isEditingSelection, setIsEditingSelection] = useState(false);
  const [editSelectedValues, setEditSelectedValues] = useState(() => new Set());

  useEffect(() => {
    setSelectedValues(new Set(distributionItems.map((item) => item.value)));
    setSelectedUnusedValues(new Set());
    setIsEditingSelection(false);
  }, [selectedAttributeId, objectTypeId]);

  useEffect(() => {
    setSelectedUnusedValues(new Set());
  }, [hasGenerated, unusedValues.length]);

  const selectedCount = distributionItems.filter((item) => selectedValues.has(item.value)).length;
  const canGenerateSelection = canGenerate && selectedCount > 0;
  const editSelectedCount = distributionItems.filter((item) =>
    editSelectedValues.has(item.value),
  ).length;
  const selectedUnusedCount = unusedValues.filter((item) =>
    selectedUnusedValues.has(item.value),
  ).length;

  const handleToggleValue = (valueKey) => {
    setSelectedValues((prev) => {
      const next = new Set(prev);
      if (next.has(valueKey)) next.delete(valueKey);
      else next.add(valueKey);
      return next;
    });
  };

  const handleToggleUnusedValue = (valueKey) => {
    setSelectedUnusedValues((prev) => {
      const next = new Set(prev);
      if (next.has(valueKey)) next.delete(valueKey);
      else next.add(valueKey);
      return next;
    });
  };

  const handleToggleEditValue = (valueKey) => {
    setEditSelectedValues((prev) => {
      const next = new Set(prev);
      if (next.has(valueKey)) next.delete(valueKey);
      else next.add(valueKey);
      return next;
    });
  };

  const handleGenerate = () => {
    if (!canGenerateSelection) return;
    const matchingValues = distributionItems
      .map((item) => item.value)
      .filter((value) => selectedValues.has(value));
    onGenerate(matchingValues);
  };

  const handleStartEditSelection = () => {
    setEditSelectedValues(new Set(visibleSubtypes.map((subtype) => subtype.matchingValue)));
    setIsEditingSelection(true);
  };

  const handleCancelEditSelection = () => {
    setIsEditingSelection(false);
  };

  const handleUpdateSubtypes = () => {
    if (!editSelectedCount || isRegenerating) return;
    const matchingValues = distributionItems
      .map((item) => item.value)
      .filter((value) => editSelectedValues.has(value));
    onRegenerate(matchingValues);
    setIsEditingSelection(false);
  };

  const handleAddUnusedSubtypes = () => {
    if (!selectedUnusedCount || isRegenerating) return;
    const matchingValues = [
      ...visibleSubtypes.map((subtype) => subtype.matchingValue),
      ...unusedValues
        .map((item) => item.value)
        .filter((value) => selectedUnusedValues.has(value)),
    ];
    onRegenerate(matchingValues);
    setSelectedUnusedValues(new Set());
  };

  if (!selectedAttribute) {
    return (
      <div className={styles.detailEmpty}>
        <svg className={styles.detailEmptyIcon} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 4l7.07 16.97 2.51-7.39 7.39-2.51L4 4z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M13 13l6 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
        <p className={styles.detailEmptyCopy}>
          Select an attribute to preview potential object subtypes.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailBody}>
        <div className={styles.detailHeaderRow}>
          <div className={styles.detailIntro}>
            <h4 className={styles.detailAttribute}>{selectedAttribute.name}</h4>
            <div className={styles.detailSummarySwap} key={hasGenerated ? 'generated' : 'preview'}>
              {hasGenerated ? (
                isEditingSelection ? (
                  <p className={`${styles.detailSummary} ${styles.workflowSummaryEnter}`}>
                    Update which values become subtypes.
                  </p>
                ) : activeSplit?.taxonomy ? (
                  <button
                    type="button"
                    className={`${styles.detailTaxonomyLink} ${styles.workflowSummaryEnter}`}
                    onClick={() => onOpenTaxonomy?.(activeSplit.taxonomy.id)}
                    aria-label={`Open taxonomy ${activeSplit.taxonomy.name}`}
                  >
                    <TaxonomyStackIcon size={22} title="" />
                    <span>{activeSplit.taxonomy.name}</span>
                  </button>
                ) : null
              ) : (
                <p className={`${styles.detailSummary} ${styles.workflowSummaryEnter}`}>
                  {buildPreviewSummary(
                    objectType,
                    selectedAttributeId,
                    candidate,
                    distributionItems.length || uniqueValues,
                    selectedCount,
                  )}
                </p>
              )}
            </div>
          </div>

          <DetailKpis uniqueValues={uniqueValues} rows={totalRows} compact />
        </div>

        <div
          className={styles.workflowContentStage}
          key={
            hasGenerated
              ? isEditingSelection
                ? 'edit-content'
                : 'generated-content'
              : 'preview-content'
          }
        >
          {hasGenerated ? (
            isEditingSelection ? (
              <div className={styles.workflowContentEnter}>
                <SubtypeDistribution
                  label="Object subtypes"
                  items={distributionItems}
                  totalRows={totalRows}
                  selectable
                  selectedValues={editSelectedValues}
                  onToggleValue={handleToggleEditValue}
                />
              </div>
            ) : (
              <div className={styles.workflowContentEnter}>
                <GeneratedSubtypePanel
                  subtypes={visibleSubtypes}
                  unusedValues={unusedValues}
                  selectedUnusedValues={selectedUnusedValues}
                  onToggleUnusedValue={handleToggleUnusedValue}
                  onAddUnusedSubtypes={handleAddUnusedSubtypes}
                  isAddingSubtypes={isRegenerating}
                  onOpenObjectType={onOpenObjectType}
                  onPreviewSubtype={onPreviewSubtype}
                  onDeleteSubtype={onDeleteSubtype}
                />
              </div>
            )
          ) : (
            <div className={styles.workflowContentEnter}>
              {distributionItems.length > 0 && (
                <SubtypeDistribution
                  label="Potential object subtypes"
                  items={distributionItems}
                  totalRows={totalRows}
                  selectable
                  selectedValues={selectedValues}
                  onToggleValue={handleToggleValue}
                />
              )}

              {!distributionItems.length && (
                <p className={styles.detailEmptyCopy}>No attribute values available for this attribute.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={`${styles.detailFooter} ${styles.workflowFooterEnter}`}
        key={
          hasGenerated
            ? isEditingSelection
              ? 'edit-footer'
              : 'generated-footer'
            : 'preview-footer'
        }
      >
        {hasGenerated ? (
          isEditingSelection ? (
            <div className={styles.detailFooterActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                disabled={isRegenerating}
                onClick={handleCancelEditSelection}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={!editSelectedCount || isRegenerating}
                onClick={handleUpdateSubtypes}
              >
                {isRegenerating ? (
                  <>
                    <span className={styles.btnSpinner} aria-hidden />
                    Updating…
                  </>
                ) : (
                  `Update ${editSelectedCount} subtype${editSelectedCount === 1 ? '' : 's'}`
                )}
              </button>
            </div>
          ) : (
            <div className={styles.detailFooterActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                disabled={isRegenerating}
                onClick={handleStartEditSelection}
              >
                Edit selection
              </button>
              <button type="button" className={styles.dangerBtn} onClick={onDeleteSplit}>
                Delete All ({visibleSubtypes.length})
              </button>
            </div>
          )
        ) : (
          <div className={styles.detailFooterActions}>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={!canGenerateSelection || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <span className={styles.btnSpinner} aria-hidden />
                  Generating…
                </>
              ) : (
                `Generate ${selectedCount} Subtype${selectedCount === 1 ? '' : 's'}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
