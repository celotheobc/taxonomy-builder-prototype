import { useEffect, useState } from 'react';
import {
  getAttribute,
  getAttributeSplitCandidate,
  getAttributeTotalRows,
  getDetectedValueCount,
  getDetectedValues,
  getObjectType,
} from '../../../data/mockObjectTypes';
import DetailKpis from './DetailKpis';
import SubtypeDistribution from './SubtypeDistribution';
import styles from './SubtypesSection.module.css';

function buildSummary(objectType, attributeId, candidate, valueCount, selectedCount) {
  if (candidate.recommendation === 'Not recommended' && candidate.uniquenessPercent >= 90) {
    const totalCount = getDetectedValueCount(objectType, attributeId);
    return `This attribute has ${totalCount.toLocaleString()} unique values (one per row). Splitting would create too many subtypes.`;
  }

  if (selectedCount === valueCount) {
    return `This attribute can generate ${valueCount.toLocaleString()} object subtype${valueCount === 1 ? '' : 's'}.`;
  }

  return `${selectedCount.toLocaleString()} of ${valueCount.toLocaleString()} selected.`;
}

export default function SplitDetailPanel({
  objectTypeId,
  selectedAttributeId,
  onGenerate,
  canGenerate,
  isGenerating,
}) {
  const objectType = getObjectType(objectTypeId);
  const selectedAttribute = selectedAttributeId
    ? getAttribute(objectType, selectedAttributeId)
    : null;
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
  const [selectedValues, setSelectedValues] = useState(() => new Set());

  useEffect(() => {
    setSelectedValues(new Set(distributionItems.map((item) => item.value)));
  }, [selectedAttributeId, objectTypeId]);

  const selectedCount = distributionItems.filter((item) => selectedValues.has(item.value)).length;
  const canGenerateSelection = canGenerate && selectedCount > 0;

  const handleToggleValue = (valueKey) => {
    setSelectedValues((prev) => {
      const next = new Set(prev);
      if (next.has(valueKey)) {
        next.delete(valueKey);
      } else {
        next.add(valueKey);
      }
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
            <p className={styles.detailSummary}>
              {buildSummary(
                objectType,
                selectedAttributeId,
                candidate,
                distributionItems.length || uniqueValues,
                selectedCount,
              )}
            </p>
          </div>

          <DetailKpis uniqueValues={uniqueValues} rows={totalRows} compact />
        </div>

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

      <div className={styles.detailFooter}>
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
    </div>
  );
}
