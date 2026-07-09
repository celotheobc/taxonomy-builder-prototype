import { useEffect, useRef } from 'react';
import { objectName } from '../../../components/configuration/connectionPath/PathRouteLabel';
import ObjectAssetChip from '../../v5/components/ObjectAssetChip';
import { KEEP_DISCONNECTED_CHOICE } from '../data/connectionConsequencePreviews';
import styles from './CycleResolutionInspectorV7.module.css';

function connectsViaName(path, includedObjects) {
  const anchors = path.objectIds.filter(
    (id, index) => index > 0 && includedObjects.has(id),
  );
  return objectName(anchors[anchors.length - 1] ?? path.objectIds[path.objectIds.length - 1]);
}

function objectsToAdd(path, includedObjects) {
  return path.objectIds.filter((id) => !includedObjects.has(id));
}

function ConnectionPathCard({
  path,
  includedObjects,
  previewing,
  hovering,
  cardRef,
  onHoverStart,
  onHoverEnd,
  onPreviewConsequences,
  onAddConnection,
}) {
  const connectsVia = connectsViaName(path, includedObjects);
  const addedObjectIds = objectsToAdd(path, includedObjects);
  const addCount = addedObjectIds.length;

  return (
    <li ref={cardRef}>
      <div
        className={`${styles.loopCard} ${previewing ? styles.loopCardPreviewing : ''} ${hovering ? styles.loopCardHover : ''}`}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        <p className={styles.loopName}>Connect via {connectsVia}</p>

        {path.wouldCreateCycle && (
          <div className={styles.optionBadges}>
            <span className={`${styles.optionBadge} ${styles.optionBadgeCycle}`}>
              Creates cycle
            </span>
          </div>
        )}

        <p className={styles.objectsAddedLine}>
          <span className={styles.objectsAddedLabel}>
            {addCount} {addCount === 1 ? 'Object' : 'Objects'} will be added:
          </span>
          <span className={styles.objectChipRow}>
            {addedObjectIds.map((id) => (
              <ObjectAssetChip key={id}>{objectName(id)}</ObjectAssetChip>
            ))}
          </span>
        </p>

        <div className={styles.loopActions}>
          <button
            type="button"
            className={styles.loopPreviewPrimary}
            onClick={() => onPreviewConsequences(path.id)}
          >
            Preview consequences
          </button>
          <button
            type="button"
            className={styles.loopCommitSecondary}
            onClick={() => onAddConnection(path.id)}
          >
            Add connection
          </button>
        </div>
      </div>
    </li>
  );
}

export default function ConnectionDecisionInspectorV7({
  prompt,
  includedObjects,
  previewChoiceId,
  hoverChoiceId,
  onHoverChoice,
  onPreviewConsequences,
  onAddConnection,
  onKeepDisconnected,
}) {
  const cardRefs = useRef(new Map());
  const hoveredFromPanelRef = useRef(false);

  const restoreHover = () => {
    onHoverChoice(previewChoiceId ?? null);
  };

  useEffect(() => {
    if (!hoverChoiceId || hoveredFromPanelRef.current) return;
    cardRefs.current.get(hoverChoiceId)?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [hoverChoiceId]);

  if (!prompt) return null;

  const bindCardRef = (id) => (el) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  };

  const bindHover = (id) => ({
    onHoverStart: () => {
      hoveredFromPanelRef.current = true;
      onHoverChoice(id);
    },
    onHoverEnd: () => {
      hoveredFromPanelRef.current = false;
      restoreHover();
    },
  });

  const cardState = (id) => ({
    previewing: previewChoiceId === id,
    hovering: hoverChoiceId === id && previewChoiceId !== id,
  });

  return (
    <>
      <ul className={styles.loopList}>
        {prompt.paths.map((path) => (
          <ConnectionPathCard
            key={path.id}
            path={path}
            includedObjects={includedObjects}
            cardRef={bindCardRef(path.id)}
            onPreviewConsequences={onPreviewConsequences}
            onAddConnection={onAddConnection}
            {...cardState(path.id)}
            {...bindHover(path.id)}
          />
        ))}
      </ul>

      <div
        className={`${styles.loopCard} ${styles.keepCard} ${previewChoiceId === KEEP_DISCONNECTED_CHOICE ? styles.loopCardPreviewing : ''} ${hoverChoiceId === KEEP_DISCONNECTED_CHOICE && previewChoiceId !== KEEP_DISCONNECTED_CHOICE ? styles.loopCardHover : ''}`}
        onMouseEnter={() => {
          hoveredFromPanelRef.current = true;
          onHoverChoice(KEEP_DISCONNECTED_CHOICE);
        }}
        onMouseLeave={() => {
          hoveredFromPanelRef.current = false;
          restoreHover();
        }}
      >
        <p className={styles.loopName}>Keep disconnected</p>
        <p className={styles.loopHint}>
          Add only {objectName(prompt.addedId)} — no extra objects or relationships.
        </p>

        <div className={styles.loopActions}>
          <button
            type="button"
            className={styles.loopPreviewPrimary}
            onClick={() => onPreviewConsequences(KEEP_DISCONNECTED_CHOICE)}
          >
            Preview consequences
          </button>
          <button
            type="button"
            className={styles.loopCommitSecondary}
            onClick={onKeepDisconnected}
          >
            Keep disconnected
          </button>
        </div>
      </div>
    </>
  );
}
