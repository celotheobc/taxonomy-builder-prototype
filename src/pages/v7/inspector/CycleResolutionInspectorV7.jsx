import { useEffect, useMemo, useRef, useState } from 'react';
import { rankCycleResolutionOptions } from '../data/cycleResolutionRecommendation';
import styles from './CycleResolutionInspectorV7.module.css';

function ResolutionOptionCard({
  row,
  summary,
  isLowestImpact = false,
  wouldCreateCycle = false,
  previewing,
  graphRemoveHover,
  panelHover,
  cardRef,
  onPreviewImpact,
  onRemoveRelationship,
  onHoverStart,
  onHoverEnd,
}) {
  return (
    <li ref={cardRef}>
      <div
        className={`${styles.loopCard} ${isLowestImpact ? styles.loopCardRecommended : ''} ${previewing ? styles.loopCardPreviewing : ''} ${graphRemoveHover ? styles.loopCardRemoveHover : ''} ${panelHover ? styles.loopCardHover : ''}`}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        <div className={styles.loopCardHeader}>
          <p className={styles.loopName}>{row.name}</p>
          {isLowestImpact && (
            <span className={`${styles.optionBadge} ${styles.optionBadgeRecommended}`}>
              Lowest impact
            </span>
          )}
        </div>

        {wouldCreateCycle && (
          <div className={styles.optionBadges}>
            <span className={`${styles.optionBadge} ${styles.optionBadgeCycle}`}>
              Creates cycle
            </span>
          </div>
        )}

        <p className={styles.loopHint}>{summary}</p>

        <div className={styles.loopActions}>
          {onPreviewImpact && (
            <button
              type="button"
              className={styles.loopPreviewPrimary}
              onClick={() => onPreviewImpact(row.id)}
            >
              Preview consequences
            </button>
          )}
          {onRemoveRelationship && (
            <button
              type="button"
              className={styles.loopRemoveSecondary}
              onClick={() => onRemoveRelationship(row.id)}
            >
              Remove this relationship
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export default function CycleResolutionInspectorV7({
  rows,
  highlightedRelationshipId,
  previewRelationshipId,
  onHighlightRelationship,
  onPreviewImpact,
  onRemoveRelationship,
}) {
  const loopRows = rows.filter((r) => r.isConflicting);
  const rankedOptions = useMemo(
    () => rankCycleResolutionOptions(loopRows),
    [loopRows],
  );
  const cardRefs = useRef(new Map());
  const hoveredFromPanelRef = useRef(false);
  const [panelHoveredId, setPanelHoveredId] = useState(null);

  const restoreHighlight = () => {
    onHighlightRelationship(previewRelationshipId ?? null);
  };

  useEffect(() => {
    if (!highlightedRelationshipId || hoveredFromPanelRef.current) return;
    cardRefs.current.get(highlightedRelationshipId)?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [highlightedRelationshipId]);

  const bindCardRef = (id) => (el) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  };

  const bindHover = (id) => ({
    onHoverStart: () => {
      hoveredFromPanelRef.current = true;
      setPanelHoveredId(id);
      onHighlightRelationship(id);
    },
    onHoverEnd: () => {
      hoveredFromPanelRef.current = false;
      setPanelHoveredId(null);
      restoreHighlight();
    },
  });

  const cardState = (id) => ({
    previewing: previewRelationshipId === id,
    graphRemoveHover:
      highlightedRelationshipId === id &&
      previewRelationshipId !== id &&
      panelHoveredId !== id,
    panelHover: panelHoveredId === id,
  });

  if (!rankedOptions.length) return null;

  return (
    <ul className={styles.loopList}>
      {rankedOptions.map((row) => (
        <ResolutionOptionCard
          key={row.id}
          row={row}
          summary={row.summary}
          isLowestImpact={row.isLowestImpact}
          wouldCreateCycle={row.wouldCreateCycle}
          cardRef={bindCardRef(row.id)}
          onPreviewImpact={onPreviewImpact}
          onRemoveRelationship={onRemoveRelationship}
          {...cardState(row.id)}
          {...bindHover(row.id)}
        />
      ))}
    </ul>
  );
}
