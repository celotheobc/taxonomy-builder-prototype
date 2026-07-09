import tableStyles from '../sections/ObjectTypeSectionCard.module.css';
import { DeleteIcon, OpenIcon, PreviewIcon } from './SubtypeRowIcons';
import { formatSubtypeRowStats } from './subtypeRowStats';
import styles from './SubtypesSection.module.css';

export default function GeneratedSubtypePanel({
  subtypes,
  availableValues,
  totalRows,
  onCreateAvailableSubtype,
  isCreatingSubtypes,
  creatingValue,
  onOpenObjectType,
  onPreviewSubtype,
  onDeleteSubtype,
}) {
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
                    Created subtypes ({subtypes.length})
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
                      {formatSubtypeRowStats(subtype.recordCount, totalRows)}
                    </td>
                    <td className={styles.subtypeTableActionsCell}>
                      <div className={styles.subtypeTableActions}>
                        <button
                          type="button"
                          className={`${styles.subtypeTableIconBtn} ${styles.subtypeTableIconBtnPrimary}`}
                          aria-label={`Open ${subtype.label} in new tab`}
                          title="Open in new tab"
                          onClick={() => onOpenObjectType?.(subtype.id)}
                        >
                          <OpenIcon />
                        </button>
                        <button
                          type="button"
                          className={styles.subtypeTableIconBtn}
                          aria-label={`Preview data for ${subtype.label}`}
                          title="Preview Data"
                          onClick={() => onPreviewSubtype?.(subtype.id)}
                        >
                          <PreviewIcon />
                        </button>
                        <button
                          type="button"
                          className={`${styles.subtypeTableIconBtn} ${styles.subtypeTableIconBtnDanger}`}
                          aria-label={`Delete ${subtype.label}`}
                          title="Delete"
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
                    Available to create ({availableValues.length})
                  </th>
                  <th className={styles.subtypeTableRowsHead}>Rows</th>
                  <th className={styles.subtypeTableActionsHead} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {availableValues.map((item) => {
                  const isCreatingThis = isCreatingSubtypes && creatingValue === item.value;
                  return (
                    <tr key={item.value} className={styles.availableRow}>
                      <td>
                        <span className={styles.subtypeTableNameStatic}>{item.value}</span>
                      </td>
                      <td className={styles.subtypeTableNumeric}>
                        {formatSubtypeRowStats(item.recordCount, totalRows)}
                      </td>
                      <td className={styles.subtypeTableActionsCell}>
                        <button
                          type="button"
                          className={`${styles.availableCreateBtn} ${isCreatingThis ? styles.availableCreateBtnVisible : ''}`}
                          disabled={isCreatingSubtypes}
                          onClick={() => onCreateAvailableSubtype?.(item.value)}
                        >
                          {isCreatingThis ? (
                            <>
                              <span className={styles.btnSpinnerDark} aria-hidden />
                              Creating…
                            </>
                          ) : (
                            'Create subtype'
                          )}
                        </button>
                      </td>
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
