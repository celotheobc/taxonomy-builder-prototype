import { getAttribute, getAttributeTotalRows, getDetectedValues, getObjectType } from '../../../data/mockObjectTypes';
import GeneratedSubtypePanel from './GeneratedSubtypePanel';
import styles from './SubtypesSection.module.css';

export default function AttributeMaintenancePanel({
  objectTypeId,
  attributeId,
  split,
  onPreviewSubtype,
  onRegenerate,
  onDelete,
  onOpenTaxonomy,
  onOpenObjectType,
  onDeleteSubtype,
  isRegenerating,
}) {
  const objectType = getObjectType(objectTypeId);
  const attribute = getAttribute(objectType, attributeId);
  const visibleSubtypes = split.subtypes.filter((subtype) => !subtype.hidden);
  const usedValues = new Set(visibleSubtypes.map((subtype) => subtype.matchingValue));
  const availableValues = getDetectedValues(objectType, attributeId).filter(
    (item) => !usedValues.has(item.value),
  );
  const totalRows = getAttributeTotalRows(objectType, attributeId);

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailBody}>
        <div className={styles.detailIntro}>
          <h4 className={styles.detailAttribute}>{attribute?.name}</h4>
          {split.taxonomy ? (
          <div className={styles.detailTaxonomyRow}>
            <span className={styles.detailTaxonomyLabel}>Linked taxonomy:</span>
            <button
              type="button"
              className={styles.detailTaxonomyNameLink}
              onClick={() => onOpenTaxonomy?.(split.taxonomy.id)}
            >
              {split.taxonomy.name}
            </button>
          </div>
        ) : null}
        </div>

        <GeneratedSubtypePanel
          subtypes={visibleSubtypes}
          availableValues={availableValues}
          totalRows={totalRows}
          onOpenObjectType={onOpenObjectType}
          onPreviewSubtype={onPreviewSubtype}
          onDeleteSubtype={onDeleteSubtype}
        />
      </div>

      <div className={styles.detailFooter}>
        <button
          type="button"
          className={styles.secondaryBtn}
          disabled={isRegenerating}
          onClick={onRegenerate}
        >
          {isRegenerating ? (
            <>
              <span className={styles.btnSpinnerDark} aria-hidden />
              Updating…
            </>
          ) : (
            'Edit selection'
          )}
        </button>
        <button type="button" className={styles.dangerBtn} onClick={onDelete}>
          Delete all ({visibleSubtypes.length})
        </button>
      </div>
    </div>
  );
}
