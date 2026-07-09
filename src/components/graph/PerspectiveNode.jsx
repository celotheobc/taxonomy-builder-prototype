import { memo, useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ContextModelIcon } from '../icons/ContextModelIcons';
import styles from './PerspectiveNode.module.css';

const SIDES = [
  { position: Position.Top, id: 'top' },
  { position: Position.Right, id: 'right' },
  { position: Position.Bottom, id: 'bottom' },
  { position: Position.Left, id: 'left' },
];

function NodeIcon({ kind }) {
  if (kind === 'metric') {
    return (
      <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <span className={styles.nodeTypeIcon}>
      <ContextModelIcon kind={kind} size={18} monochrome />
    </span>
  );
}

function PerspectiveNodeComponent({ data }) {
  const {
    label,
    kind,
    state,
    isHub,
    showPlus,
    onPlusClick,
    canRefocus,
    onRefocusExpansion,
    isSelectedContext,
    isInspectorSelected,
    inspectorSelectionMode,
    visualVariant,
    basketSelected,
    cmNeighbor,
    explorerUnselectable,
    explorerMuted,
    explorerSelectable,
    cmAssetPicker,
    showLabel = true,
  } = data;

  const kindClass =
    kind === 'eventSource'
      ? styles.event
      : kind === 'metric'
        ? styles.metric
        : kind === 'process'
          ? styles.process
          : styles.object;

  const stateClass =
    state === 'included'
      ? styles.included
      : state === 'pending'
        ? styles.pending
        : state === 'bridgePreview'
          ? styles.bridgePreview
          : state === 'ghost'
          ? styles.ghost
          : state === 'dimmed'
            ? styles.dimmed
            : styles.available;

  const showSelectionFrame =
    isSelectedContext || isInspectorSelected || basketSelected;

  const [returnHover, setReturnHover] = useState(false);

  useEffect(() => {
    if (!basketSelected) {
      setReturnHover(false);
    }
  }, [basketSelected]);

  const handleAssetPickerLeave = () => {
    if (!cmAssetPicker || !basketSelected) return;
    setReturnHover(true);
  };

  return (
    <div
      className={[
        styles.root,
        kindClass,
        stateClass,
        isHub ? styles.hub : '',
        canRefocus ? styles.refocusable : '',
        inspectorSelectionMode && state !== 'dimmed' && !explorerUnselectable
          ? styles.selectable
          : '',
        isSelectedContext ? styles.contextSelected : '',
        isInspectorSelected ? styles.inspectorSelected : '',
        visualVariant === 'explorer' ? styles.explorer : '',
        basketSelected ? styles.basketSelected : '',
        cmNeighbor ? styles.cmNeighbor : '',
        explorerUnselectable ? styles.explorerUnselectable : '',
        explorerMuted ? styles.explorerMuted : '',
        explorerSelectable ? styles.explorerSelectable : '',
        cmAssetPicker ? styles.cmAssetPicker : '',
        cmAssetPicker && returnHover ? styles.returnHover : '',
        !showLabel ? styles.labelHidden : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={label}
      onMouseLeave={cmAssetPicker ? handleAssetPickerLeave : undefined}
      onClick={
        canRefocus && !inspectorSelectionMode
          ? (e) => {
              e.stopPropagation();
              onRefocusExpansion?.();
            }
          : undefined
      }
      onKeyDown={
        canRefocus && !inspectorSelectionMode
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRefocusExpansion?.();
              }
            }
          : undefined
      }
      tabIndex={canRefocus && !inspectorSelectionMode ? 0 : undefined}
      title={
        state === 'pending'
          ? 'Choose a connection path to link this object'
          : state === 'bridgePreview'
            ? 'Will be added with this connection path'
            : canRefocus && !inspectorSelectionMode
              ? 'Show next steps from this object'
              : undefined
      }
    >
      {SIDES.map(({ position, id }) => (
        <span key={id}>
          <Handle
            type="target"
            position={position}
            id={`t-${id}`}
            className={styles.handle}
          />
          <Handle
            type="source"
            position={position}
            id={`s-${id}`}
            className={styles.handle}
          />
        </span>
      ))}

      <div className={styles.floorShadow} aria-hidden />

      <div className={styles.nodeContent}>
        {showSelectionFrame && (
          <div className={styles.selectionFrame} aria-hidden />
        )}

        <div className={styles.puck}>
          <div className={styles.puckTop}>
            {cmAssetPicker ? (
              <>
                <span className={styles.cmPickerIcon} aria-hidden>
                  <NodeIcon kind={kind} />
                </span>
                <span
                  className={`${styles.cmPickerPlus} ${styles.cmPickerRaised}`}
                  aria-hidden
                >
                  +
                </span>
                <span className={styles.cmPickerCheck} aria-hidden>
                  ✓
                </span>
                <span
                  className={`${styles.cmPickerMinus} ${styles.cmPickerRaised}`}
                  aria-hidden
                >
                  −
                </span>
              </>
            ) : (
              <NodeIcon kind={kind} />
            )}
            {showPlus && (
              <button
                type="button"
                className={styles.plusBtn}
                aria-label={`Add ${label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlusClick?.();
                }}
              >
                +
              </button>
            )}
          </div>
          <div className={styles.puckSide} aria-hidden />
        </div>

        {showLabel && (
          <div className={styles.label}>
            <span className={styles.labelText}>{label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(PerspectiveNodeComponent);
