import { getAttribute, getDetectedValues, getObjectType } from '../../../data/mockObjectTypes';
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
  isRegenerating,
}) {
  const objectType = getObjectType(objectTypeId);
  const attribute = getAttribute(objectType, attributeId);
  const visibleSubtypes = split.subtypes.filter((subtype) => !subtype.hidden);
  const usedValues = new Set(visibleSubtypes.map((subtype) => subtype.matchingValue));
  const unusedValues = getDetectedValues(objectType, attributeId).filter(
    (item) => !usedValues.has(item.value),
  );

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailBody}>
        <div className={styles.detailIntro}>
          <h4 className={styles.detailAttribute}>{attribute?.name}</h4>
          <p className={styles.detailSummary}>
            <span className={styles.statusGenerated}>Subtypes generated</span>
            {split.taxonomy && (
              <>
                {' '}
                · organised by{' '}
                <button
                  type="button"
                  className={styles.inlineLinkBtn}
                  onClick={() => onOpenTaxonomy?.(split.taxonomy.id)}
                >
                  {split.taxonomy.name}
                </button>
              </>
            )}
          </p>
        </div>

        <GeneratedSubtypePanel
          subtypes={visibleSubtypes}
          unusedValues={unusedValues}
          onOpenObjectType={onOpenObjectType}
          onPreviewSubtype={onPreviewSubtype}
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
              Regenerating…
            </>
          ) : (
            'Regenerate'
          )}
        </button>
        <button type="button" className={styles.dangerBtn} onClick={onDelete}>
          Delete All ({visibleSubtypes.length})
        </button>
      </div>
    </div>
  );
}
