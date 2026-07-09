import { memo, useCallback } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/react';
import CutRelationshipIcon from '../icons/CutRelationshipIcon';
import { edgeMarker, edgePathStyle, getEdgeVisual } from '../../utils/edgeVisual';
import styles from './RouteEdge.module.css';

function isWithinScissorsTarget(relId, target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(`[data-scissors-for="${relId}"]`));
}

function RouteEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) {
  const {
    included,
    potential,
    pruned,
    highlightCycle,
    showScissors,
    onPrune,
    onHoverEdge,
    relId,
    isPreviewBridge,
    previewBridgeCreatesCycle,
    highlightFromTable,
    highlightFromTableCycle,
    isInspectorSelected,
    contextOverview,
    directPath,
    cycleResolutionCard,
  } = data ?? {};

  const visual = getEdgeVisual({
    included,
    potential,
    pruned,
    highlightCycle,
    isPreviewBridge,
    previewBridgeCreatesCycle,
    highlightFromTable,
    highlightFromTableCycle,
    contextOverview,
  });

  const useStraight = Boolean(
    contextOverview ||
    directPath ||
    isPreviewBridge ||
      highlightFromTable ||
      potential ||
      highlightCycle ||
      (included && !highlightCycle),
  );

  let sx = sourceX;
  let sy = sourceY;
  let tx = targetX;
  let ty = targetY;

  let edgePath;
  let labelX;
  let labelY;

  if (useStraight) {
    [edgePath, labelX, labelY] = getStraightPath({
      sourceX: sx,
      sourceY: sy,
      targetX: tx,
      targetY: ty,
    });
  } else {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX: sx,
      sourceY: sy,
      targetX: tx,
      targetY: ty,
      sourcePosition,
      targetPosition,
      borderRadius: 16,
    });
  }

  const edgeClass = [
    styles.edge,
    included && styles.included,
    potential && !isPreviewBridge && styles.potential,
    pruned && styles.pruned,
    highlightCycle && styles.cycle,
    highlightFromTable &&
      (highlightFromTableCycle
        ? styles.tableHighlightCycle
        : included
          ? styles.tableHighlight
          : styles.tableHighlightMuted),
    isInspectorSelected && styles.inspectorSelected,
    isPreviewBridge &&
      (previewBridgeCreatesCycle
        ? styles.previewBridgeCycle
        : styles.previewBridgeSafe),
  ]
    .filter(Boolean)
    .join(' ');

  const labelTransform = `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`;
  const scissorsHighlighted = Boolean(showScissors && highlightFromTable);
  const hoverCard = cycleResolutionCard ?? null;

  const handleScissorsEnter = useCallback(() => {
    onHoverEdge?.(relId);
  }, [onHoverEdge, relId]);

  const handleScissorsLeave = useCallback((event) => {
    if (isWithinScissorsTarget(relId, event?.relatedTarget)) return;
    onHoverEdge?.(null);
  }, [onHoverEdge, relId]);

  const handleScissorsClick = useCallback(() => {
    onPrune?.(relId);
  }, [onPrune, relId]);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={edgeClass}
        style={edgePathStyle(visual)}
        markerEnd={edgeMarker(visual.markerColor)}
        interactionWidth={showScissors ? 0 : 24}
      />
      {showScissors && !pruned && (
        <EdgeLabelRenderer>
          <div
            className={`${styles.labelWrap} ${scissorsHighlighted ? styles.labelWrapActive : ''}`}
            style={{ transform: labelTransform }}
          >
            <div
              className={`${styles.scissorsWrap} ${scissorsHighlighted ? styles.scissorsWrapActive : ''}`}
              data-scissors-for={relId}
              onMouseEnter={handleScissorsEnter}
              onMouseLeave={handleScissorsLeave}
              onClick={handleScissorsClick}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleScissorsClick();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={hoverCard?.name ? `Remove relationship: ${hoverCard.name}` : 'Remove relationship'}
            >
              <CutRelationshipIcon size={18} className={styles.scissorsIcon} />
            </div>
            {hoverCard && (
              <div className={styles.scissorsHoverCard} role="tooltip">
                <div className={styles.scissorsHoverCardHeader}>
                  <p className={styles.scissorsHoverCardTitle}>{hoverCard.name}</p>
                  {hoverCard.isRecommended && (
                    <span className={styles.scissorsHoverCardBadge}>Lowest impact</span>
                  )}
                </div>
                <p className={styles.scissorsHoverCardSummary}>{hoverCard.summary}</p>
                <hr className={styles.scissorsHoverCardDivider} />
                <p className={styles.scissorsHoverCardAction}>Click to remove</p>
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(RouteEdgeComponent);
