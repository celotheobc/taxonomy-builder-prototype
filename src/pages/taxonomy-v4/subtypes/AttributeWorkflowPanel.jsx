import { useEffect, useState } from 'react';
import TaxonomyStackIcon from '../../../components/icons/TaxonomyStackIcon';
import {
  getAttribute,
  getAttributeRecommendationReason,
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
import { OpenIcon, PreviewIcon, DeleteIcon } from './SubtypeRowIcons';
import DetailKpis from './DetailKpis';
import GeneratedSubtypePanel from './GeneratedSubtypePanel';
import HierarchyTree from '../../../components/hierarchy/HierarchyTree';
import SubtypeDistribution from './SubtypeDistribution';
import { formatSubtypeRowStats } from './subtypeRowStats';
import styles from './SubtypesSection.module.css';

const RECOMMENDATION_CLASS = {
  Recommended: styles.badgeRecommended,
  'Not recommended': styles.badgeNotRecommended,
};

function buildSelectionStatus(selectedCount, valueCount) {
  return `${selectedCount} of ${valueCount} object subtype${valueCount === 1 ? '' : 's'} selected.`;
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
  const hasCreated = hasSubtypesForAttribute(splitState, selectedAttributeId);

  const attributeValues = selectedAttributeId
    ? getDetectedValues(objectType, selectedAttributeId)
    : [];
  const candidate = selectedAttributeId
    ? getAttributeSplitCandidate(objectType, selectedAttributeId)
    : null;
  const recommendationReason = selectedAttributeId
    ? getAttributeRecommendationReason(objectType, selectedAttributeId)
    : '';
  const distributionItems = attributeValues.length ? attributeValues : [];
  const previewValueCount = distributionItems.length;
  const uniqueValues = selectedAttributeId
    ? previewValueCount || getDetectedValueCount(objectType, selectedAttributeId)
    : 0;
  const totalRows = selectedAttributeId
    ? getAttributeTotalRows(objectType, selectedAttributeId)
    : 0;
  const visibleSubtypes = activeSplit?.subtypes.filter((subtype) => !subtype.hidden) ?? [];
  const usedValues = new Set(visibleSubtypes.map((subtype) => subtype.matchingValue));
  const availableValues = distributionItems.filter((item) => !usedValues.has(item.value));

  const [selectedValues, setSelectedValues] = useState(() => new Set());
  const [creatingValue, setCreatingValue] = useState(null);

  useEffect(() => {
    setSelectedValues(new Set(distributionItems.map((item) => item.value)));
    setCreatingValue(null);
  }, [selectedAttributeId, objectTypeId]);

  useEffect(() => {
    if (!isRegenerating) setCreatingValue(null);
  }, [isRegenerating]);

  const selectedCount = distributionItems.filter((item) => selectedValues.has(item.value)).length;
  const canCreateSelection = canGenerate && selectedCount > 0;
  const recommendationClass = candidate ? RECOMMENDATION_CLASS[candidate.recommendation] : null;
  const showRecommendationBadge =
    !hasCreated &&
    candidate?.recommendation !== 'Caution' &&
    Boolean(recommendationClass);

  const handleToggleValue = (valueKey) => {
    setSelectedValues((prev) => {
      const next = new Set(prev);
      if (next.has(valueKey)) next.delete(valueKey);
      else next.add(valueKey);
      return next;
    });
  };

  const handleCreate = () => {
    if (!canCreateSelection) return;
    const matchingValues = distributionItems
      .map((item) => item.value)
      .filter((value) => selectedValues.has(value));
    onGenerate(matchingValues);
  };

  const handleCreateAvailableSubtype = (value) => {
    if (!value || isRegenerating) return;
    setCreatingValue(value);
    const matchingValues = [...visibleSubtypes.map((subtype) => subtype.matchingValue), value];
    onRegenerate(matchingValues);
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
            <div className={styles.detailAttributeRow}>
              <h4 className={styles.detailAttribute}>{selectedAttribute.name}</h4>
              {showRecommendationBadge ? (
                <span className={`${styles.recommendationBadge} ${recommendationClass}`}>
                  {candidate.recommendation}
                </span>
              ) : null}
            </div>
            <div className={styles.detailSummarySwap} key={hasCreated ? 'created' : 'preview'}>
              {hasCreated ? (
                activeSplit?.taxonomy ? (
                  <div className={`${styles.detailTaxonomyRow} ${styles.workflowSummaryEnter}`}>
                    <span className={styles.detailTaxonomyLabel}>Linked taxonomy:</span>
                    <TaxonomyStackIcon size={22} title="" />
                    <button
                      type="button"
                      className={styles.detailTaxonomyNameLink}
                      onClick={() => onOpenTaxonomy?.(activeSplit.taxonomy.id)}
                    >
                      {activeSplit.taxonomy.name}
                    </button>
                  </div>
                ) : null
              ) : recommendationReason ? (
                <p className={`${styles.detailSummary} ${styles.workflowSummaryEnter}`}>
                  {recommendationReason}
                </p>
              ) : null}
            </div>
          </div>

          <DetailKpis uniqueValues={uniqueValues} rows={totalRows} compact />
        </div>

        <div
          className={styles.workflowContentStage}
          key={hasCreated ? 'created-content' : 'preview-content'}
        >
          {hasCreated ? (
            <div className={styles.workflowContentEnter}>
              <HierarchyTree
                nodes={visibleSubtypes}
                renderMeta={(node) => formatSubtypeRowStats(node.recordCount, totalRows)}
                renderActions={(node) => (
                  <>
                    <button
                      type="button"
                      className={styles.subtypeTableIconBtn}
                      aria-label={`Preview data for ${node.label}`}
                      title="Preview Data"
                      onClick={() => onPreviewSubtype?.(node.id)}
                    >
                      <PreviewIcon />
                    </button>
                    <button
                      type="button"
                      className={`${styles.subtypeTableIconBtn} ${styles.subtypeTableIconBtnPrimary}`}
                      aria-label={`Open ${node.label}`}
                      title="Open subtype"
                      onClick={() => onOpenObjectType?.(node.id)}
                    >
                      <OpenIcon />
                    </button>
                    <button
                      type="button"
                      className={`${styles.subtypeTableIconBtn} ${styles.subtypeTableIconBtnDanger}`}
                      aria-label={`Delete ${node.label}`}
                      title="Delete"
                      onClick={() => onDeleteSubtype?.(node.id)}
                    >
                      <DeleteIcon />
                    </button>
                  </>
                )}
              />

              {availableValues.length > 0 ? (
                <GeneratedSubtypePanel
                  subtypes={[]}
                  availableValues={availableValues}
                  totalRows={totalRows}
                  onCreateAvailableSubtype={handleCreateAvailableSubtype}
                  isCreatingSubtypes={isRegenerating}
                  creatingValue={creatingValue}
                  onOpenObjectType={onOpenObjectType}
                  onPreviewSubtype={onPreviewSubtype}
                  onDeleteSubtype={onDeleteSubtype}
                  availableOnly
                />
              ) : null}
            </div>
          ) : (
            <div className={styles.workflowContentEnter}>
              {distributionItems.length > 0 && (
                <SubtypeDistribution
                  label="The following object subtypes will be created"
                  items={distributionItems}
                  totalRows={totalRows}
                  selectable
                  selectedValues={selectedValues}
                  onToggleValue={handleToggleValue}
                />
              )}

              {!distributionItems.length && (
                <p className={styles.detailEmptyCopy}>
                  No subtype options are available for this attribute.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={`${styles.detailFooter} ${styles.workflowFooterEnter}`}
        key={hasCreated ? 'created-footer' : 'preview-footer'}
      >
        {hasCreated ? (
          <div className={styles.detailFooterActions}>
            <button type="button" className={styles.dangerBtn} onClick={onDeleteSplit}>
              Delete all ({visibleSubtypes.length})
            </button>
          </div>
        ) : (
          <>
            <div className={styles.detailFooterStart}>
              {distributionItems.length > 0 && (
                <p className={styles.detailFooterStatus}>
                  {buildSelectionStatus(selectedCount, distributionItems.length)}
                </p>
              )}
            </div>
            <div className={styles.detailFooterActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={!canCreateSelection || isGenerating}
                onClick={handleCreate}
              >
                {isGenerating ? (
                  <>
                    <span className={styles.btnSpinner} aria-hidden />
                    Generating…
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
