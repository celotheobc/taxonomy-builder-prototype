import styles from './SubtypesSection.module.css';

function formatPercent(recordCount, totalRows) {
  if (!totalRows) return '0%';
  return `${((recordCount / totalRows) * 100).toFixed(totalRows >= 1000 ? 0 : 1)}%`;
}

export default function GeneratedSubtypeList({
  subtypes,
  totalRows,
  label = 'Generated object subtypes',
  onOpenObjectType,
}) {
  return (
    <div className={styles.detailSection}>
      {label && <span className={styles.detailLabel}>{label}</span>}
      <ul className={styles.generatedSubtypeList}>
        {subtypes.map((subtype) => (
          <li key={subtype.id} className={styles.generatedSubtypeCard}>
            <div className={styles.generatedSubtypeMain}>
              <span className={styles.subtypeObjectIcon} aria-hidden />
              <div className={styles.generatedSubtypeText}>
                <span className={styles.generatedSubtypeTitle}>{subtype.label}</span>
                <span className={styles.generatedSubtypeMeta}>
                  {subtype.recordCount.toLocaleString()} rows (
                  {formatPercent(subtype.recordCount, totalRows)})
                </span>
              </div>
            </div>
            <button
              type="button"
              className={styles.generatedSubtypeOpenBtn}
              onClick={() => onOpenObjectType?.(subtype.id)}
            >
              Open Object Type
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
