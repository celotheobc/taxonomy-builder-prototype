import styles from './SubtypesSection.module.css';

export default function DetailKpis({ uniqueValues, rows, compact = false }) {
  return (
    <div className={compact ? styles.kpiRowCompact : styles.kpiRow}>
      <div className={compact ? styles.kpiCardCompact : styles.kpiCard}>
        <span className={compact ? styles.kpiValueCompact : styles.kpiValue}>
          {uniqueValues.toLocaleString()}
        </span>
        <span className={styles.kpiLabel}>Unique values</span>
      </div>
      <div className={compact ? styles.kpiCardCompact : styles.kpiCard}>
        <span className={compact ? styles.kpiValueCompact : styles.kpiValue}>
          {rows.toLocaleString()}
        </span>
        <span className={styles.kpiLabel}>Rows</span>
      </div>
    </div>
  );
}
