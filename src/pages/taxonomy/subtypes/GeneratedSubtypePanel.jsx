import tableStyles from '../sections/ObjectTypeSectionCard.module.css';
import { DeleteIcon, OpenIcon, PreviewIcon } from './SubtypeRowIcons';
import styles from './SubtypesSection.module.css';

export default function GeneratedSubtypePanel({
  subtypes,
  unusedValues,
  selectedUnusedValues,
  onToggleUnusedValue,
  onAddUnusedSubtypes,
  isAddingSubtypes,
  onOpenObjectType,
  onPreviewSubtype,
  onDeleteSubtype,
}) {
  const selectedUnusedSet =
    selectedUnusedValues instanceof Set ? selectedUnusedValues : new Set(selectedUnusedValues ?? []);
  const selectedUnusedCount = unusedValues.filter((item) => selectedUnusedSet.has(item.value)).length;

  return (
    <>
      <div className={styles.detailSection}>
        <div className={styles.generatedTableCard}>
          <div className={styles.subtypeTableWrap}>
            <table className={`${tableStyles.table} ${styles.generatedSubtypeTable}`}>
              <colgroup>
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th className={styles.subtypeTableSectionHead}>
                    Generated object subtypes ({subtypes.length})
                  </th>
                  <th className={styles.subtypeTableRowsHead}>Rows</th>
                  <th className={styles.subtypeTableActionsHead} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {subtypes.map((subtype) => (
                  <tr key={subtype.id}>
                    <td>
                      <div className={styles.subtypeTableNameCell}>
                        <span className={styles.subtypeObjectIcon} aria-hidden />
                        <span className={styles.subtypeTableNameStatic}>{subtype.label}</span>
                      </div>
                    </td>
                    <td className={styles.subtypeTableNumeric}>
                      {subtype.recordCount.toLocaleString()}
                    </td>
                    <td className={styles.subtypeTableActionsCell}>
                      <div className={styles.subtypeTableActions}>
                        <button
                          type="button"
                          className={`${styles.subtypeTableIconBtn} ${styles.subtypeTableIconBtnPrimary}`}
                          aria-label={`Open ${subtype.label}`}
                          title="Open Object Type"
                          onClick={() => onOpenObjectType?.(subtype.id)}
                        >
                          <OpenIcon />
                        </button>
                        <button
                          type="button"
                          className={styles.subtypeTableIconBtn}
                          aria-label={`Preview rows for ${subtype.label}`}
                          title="Preview rows"
                          onClick={() => onPreviewSubtype?.(subtype.id)}
                        >
                          <PreviewIcon />
                        </button>
                        <button
                          type="button"
                          className={`${styles.subtypeTableIconBtn} ${styles.subtypeTableIconBtnDanger}`}
                          aria-label={`Remove ${subtype.label} from subtypes`}
                          title="Remove from subtypes"
                          onClick={() => onDeleteSubtype?.(subtype.id)}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={`${styles.detailSection} ${styles.detailSectionSpaced}`}>
        {selectedUnusedCount > 0 && (
          <div className={styles.detailSectionHeader}>
            <span />
            <button
              type="button"
              className={styles.addUnusedBtn}
              disabled={isAddingSubtypes}
              onClick={onAddUnusedSubtypes}
            >
              {isAddingSubtypes ? (
                <>
                  <span className={styles.btnSpinnerDark} aria-hidden />
                  Adding…
                </>
              ) : (
                `Add ${selectedUnusedCount} subtype${selectedUnusedCount === 1 ? '' : 's'}`
              )}
            </button>
          </div>
        )}
        <div className={styles.generatedTableCard}>
          <div className={styles.subtypeTableWrap}>
            <table className={`${tableStyles.table} ${styles.generatedSubtypeTable}`}>
              <colgroup>
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th className={styles.subtypeTableSectionHead}>
                    Unused values ({unusedValues.length})
                  </th>
                  <th className={styles.subtypeTableRowsHead}>Rows</th>
                  <th className={styles.subtypeTableActionsHead} aria-hidden />
                </tr>
              </thead>
              <tbody>
                {unusedValues.map((item) => {
                  const isSelected = selectedUnusedSet.has(item.value);
                  return (
                    <tr
                      key={item.value}
                      className={isSelected ? styles.unusedRowSelected : undefined}
                    >
                      <td>
                        <div className={styles.subtypeTableNameCell}>
                          <label className={styles.unusedCheckboxLabel}>
                            <input
                              type="checkbox"
                              className={styles.distributionCheckbox}
                              checked={isSelected}
                              onChange={() => onToggleUnusedValue?.(item.value)}
                            />
                            <span className={styles.srOnly}>Add {item.value} as subtype</span>
                          </label>
                          <span className={styles.subtypeTableNameStatic}>{item.value}</span>
                        </div>
                      </td>
                      <td className={styles.subtypeTableNumeric}>
                        {item.recordCount.toLocaleString()}
                      </td>
                      <td className={styles.subtypeTableActionsCell} aria-hidden />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
