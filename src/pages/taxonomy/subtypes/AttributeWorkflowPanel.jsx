import { useEffect, useState } from 'react';
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
import GeneratedSubtypeList from './GeneratedSubtypeList';
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
  onPreview,
  onManage,
  onRegenerate,
  onDeleteSplit,
  onOpenTaxonomy,
  onOpenObjectType,
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
  const uniqueValues = selectedAttributeId
    ? getDetectedValueCount(objectType, selectedAttributeId)
    : 0;
  const totalRows = selectedAttributeId
    ? getAttributeTotalRows(objectType, selectedAttributeId)
    : 0;
  const distributionItems = detectedValues.length ? detectedValues : [];
  const visibleSubtypes = activeSplit?.subtypes.filter((subtype) => !subtype.hidden) ?? [];

  const [selectedValues, setSelectedValues] = useState(() => new Set());

  useEffect(() => {
    setSelectedValues(new Set(distributionItems.map((item) => item.value)));
  }, [selectedAttributeId, objectTypeId]);

  const selectedCount = distributionItems.filter((item) => selectedValues.has(item.value)).length;
  const canGenerateSelection = canGenerate && selectedCount > 0;

  const handleToggleValue = (valueKey) => {
    setSelectedValues((prev) => {
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

  if (!selectedAttribute) {
    return (
      <div className={styles.detailEmpty}>
        <p className={styles.detailEmptyTitle}>Choose an attribute to generate subtypes.</p>
        <p className={styles.detailEmptyCopy}>
          Select an attribute on the left to preview the object subtypes that will be created.
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
                <p className={`${styles.detailSummary} ${styles.workflowSummaryEnter}`}>
                  <span className={styles.statusGenerated}>Subtypes generated</span>
                  {activeSplit?.taxonomy && (
                    <>
                      {' '}
                      · organised by{' '}
                      <button
                        type="button"
                        className={styles.inlineLinkBtn}
                        onClick={() => onOpenTaxonomy?.(activeSplit.taxonomy.id)}
                      >
                        {activeSplit.taxonomy.name}
                      </button>
                    </>
                  )}
                </p>
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
          key={hasGenerated ? 'generated-content' : 'preview-content'}
        >
          {hasGenerated ? (
            <div className={styles.workflowContentEnter}>
              <GeneratedSubtypeList
                subtypes={visibleSubtypes}
                totalRows={totalRows}
                onOpenObjectType={onOpenObjectType}
              />
            </div>
          ) : (
            <div className={styles.workflowContentEnter}>
              {distributionItems.length > 0 && (
                <SubtypeDistribution
                  label="Potential object subtypes"
                  items={distributionItems}
                  totalRows={totalRows}
                  totalUniqueCount={uniqueValues}
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
        key={hasGenerated ? 'generated-footer' : 'preview-footer'}
      >
        {hasGenerated ? (
          <>
            <button type="button" className={styles.secondaryBtn} onClick={onPreview}>
              Preview
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={onManage}>
              Manage
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              disabled={isRegenerating}
              onClick={onRegenerate}
            >
              {isRegenerating ? (
                <>
                  <span className={styles.btnSpinnerDark} aria-hidden />
                  Regenerating…
                </>
              ) : (
                'Regenerate'
              )}
            </button>
            <button type="button" className={styles.dangerBtn} onClick={onDeleteSplit}>
              Delete
            </button>
          </>
        ) : (
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
        )}
      </div>
    </div>
  );
}
