import { getAttribute, getObjectType } from '../../../data/mockObjectTypes';
import GeneratedSubtypeList from './GeneratedSubtypeList';
import styles from './SubtypesSection.module.css';

export default function AttributeMaintenancePanel({
  objectTypeId,
  attributeId,
  split,
  onPreview,
  onManage,
  onRegenerate,
  onDelete,
  onOpenTaxonomy,
  onOpenObjectType,
  isRegenerating,
}) {
  const objectType = getObjectType(objectTypeId);
  const attribute = getAttribute(objectType, attributeId);
  const visibleSubtypes = split.subtypes.filter((subtype) => !subtype.hidden);
  const totalRows = visibleSubtypes.reduce((sum, subtype) => sum + subtype.recordCount, 0);

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

        <GeneratedSubtypeList
          subtypes={visibleSubtypes}
          totalRows={totalRows}
          onOpenObjectType={onOpenObjectType}
        />
      </div>

      <div className={styles.detailFooter}>
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
        <button type="button" className={styles.dangerBtn} onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
