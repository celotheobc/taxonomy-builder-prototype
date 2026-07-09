import styles from './SummaryStrip.module.css';

export default function SummaryStrip({
  objectCount,
  eventCount,
  relationshipCount,
  validationStatus,
}) {
  const statusClass =
    validationStatus === 'Valid'
      ? styles.valid
      : validationStatus === 'Needs resolution'
        ? styles.warning
        : styles.incomplete;

  return (
    <div className={styles.strip}>
      <div className={styles.counts}>
        <span>
          <strong>{objectCount}</strong> objects
        </span>
        <span className={styles.divider}>·</span>
        <span>
          <strong>{eventCount}</strong> event sources
        </span>
        <span className={styles.divider}>·</span>
        <span>
          <strong>{relationshipCount}</strong> relationships
        </span>
      </div>
      <span className={`${styles.status} ${statusClass}`}>{validationStatus}</span>
    </div>
  );
}
