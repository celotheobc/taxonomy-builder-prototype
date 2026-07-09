import { useEffect, useRef, useState } from 'react';
import { CYCLE_RESOLUTION_COPY } from '../../../utils/cycleResolutionCopy';
import { getCycleConsequencePreview } from '../data/cycleConsequencePreviews';
import styles from './CycleResolutionInspector.module.css';

const MAX_VISIBLE_BULLETS = 2;

function ConsequenceBullets({ bullets }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = bullets.length > MAX_VISIBLE_BULLETS;
  const visible = expanded || !hasMore ? bullets : bullets.slice(0, MAX_VISIBLE_BULLETS);

  return (
    <>
      <ul className={styles.consequenceList}>
        {visible.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          className={styles.consequenceShowMore}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show less' : 'Show all'}
        </button>
      )}
    </>
  );
}

export default function CycleResolutionInspector({
  rows,
  alert,
  highlightedRelationshipId,
  onHighlightRelationship,
  onSelectRelationship,
  onRemoveRelationship,
}) {
  const loopRows = rows.filter((r) => r.isConflicting);
  const cardRefs = useRef(new Map());
  const hoveredFromPanelRef = useRef(false);

  useEffect(() => {
    if (!highlightedRelationshipId || hoveredFromPanelRef.current) return;
    cardRefs.current.get(highlightedRelationshipId)?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [highlightedRelationshipId]);

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
          const consequence = getCycleConsequencePreview(row.id);

          return (
            <li
              key={row.id}
              ref={(el) => {
                if (el) cardRefs.current.set(row.id, el);
                else cardRefs.current.delete(row.id);
              }}
            >
              <div
                className={`${styles.loopCard} ${active ? styles.loopCardActive : ''}`}
                onMouseEnter={() => {
                  hoveredFromPanelRef.current = true;
                  onHighlightRelationship(row.id);
                }}
                onMouseLeave={() => {
                  hoveredFromPanelRef.current = false;
                  onHighlightRelationship(null);
                }}
              >
                <button
                  type="button"
                  className={styles.loopCardMain}
                  onClick={() => onSelectRelationship(row.id, true)}
                  onFocus={() => onHighlightRelationship(row.id)}
                  onBlur={() => onHighlightRelationship(null)}
                >
                  <span className={styles.loopName}>{row.name}</span>
                </button>

                <ConsequenceBullets bullets={consequence.bullets} />

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
