import { CYCLE_RESOLUTION_COPY } from '../../../utils/cycleResolutionCopy';
import styles from './CycleResolutionInspector.module.css';

export default function CycleResolutionInspector({
  rows,
  alert,
  highlightedRelationshipId,
  onHighlightRelationship,
  onSelectRelationship,
  onRemoveRelationship,
}) {
  const loopRows = rows.filter((r) => r.isConflicting);

  return (
    <>
      {alert && (
        <div className={styles.intervention} role="alert">
          <p className={styles.interventionEyebrow}>{CYCLE_RESOLUTION_COPY.eyebrow}</p>
          <strong className={styles.interventionTitle}>
            {alert.title ?? CYCLE_RESOLUTION_COPY.title}
          </strong>
          <p className={styles.interventionMessage}>
            {alert.message ?? CYCLE_RESOLUTION_COPY.message}
          </p>
        </div>
      )}

      <p className={styles.hint}>{CYCLE_RESOLUTION_COPY.panelHint}</p>

      <ul className={styles.loopList}>
        {loopRows.map((row) => {
          const active = highlightedRelationshipId === row.id;

          return (
            <li key={row.id}>
              <div
                className={`${styles.loopCard} ${active ? styles.loopCardActive : ''}`}
                onMouseEnter={() => onHighlightRelationship(row.id)}
                onMouseLeave={() => onHighlightRelationship(null)}
              >
                <button
                  type="button"
                  className={styles.loopCardMain}
                  onClick={() => onSelectRelationship(row.id, true)}
                  onFocus={() => onHighlightRelationship(row.id)}
                  onBlur={() => onHighlightRelationship(null)}
                >
                  <span className={styles.loopName}>{row.name}</span>
                  <span className={styles.loopRoute}>
                    {row.source} → {row.target}
                  </span>
                  <span className={styles.loopMeta}>
                    <span className={styles.loopBadge}>In loop</span>
                  </span>
                </button>
                {onRemoveRelationship && (
                  <button
                    type="button"
                    className={styles.loopRemove}
                    onClick={() => onRemoveRelationship(row.id)}
                  >
                    <span className={styles.loopRemoveIcon} aria-hidden>
                      ✂
                    </span>
                    Remove this relationship
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
