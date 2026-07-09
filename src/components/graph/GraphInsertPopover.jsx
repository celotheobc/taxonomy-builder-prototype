import { useCallback, useEffect, useRef, useState } from 'react';
import InsertSearchPanel from '../configuration/InsertSearchPanel';
import CreateRelationshipModal from './CreateRelationshipModal';
import styles from './GraphInsertPopover.module.css';

const DEFAULT_HINT =
  'Add off the current frontier — try Accounts Hub for route options';

const SCOPE_HINTS = {
  object: 'Search object types to add to this perspective.',
  event: 'Search event sources to include in this perspective.',
  relationship: 'Search relationships — both endpoint objects will be included.',
};

const SCOPE_PLACEHOLDERS = {
  object: 'Search objects…',
  event: 'Search event sources…',
  relationship: 'Search relationships…',
};

const SCOPE_ARIA = {
  object: 'Add object to perspective',
  event: 'Add event source to perspective',
  relationship: 'Add relationship to perspective',
};

export default function GraphInsertPopover({
  onAddObject,
  onAddEvent,
  onAddMetric,
  onAddRelationship,
  lockedScope = null,
  hint,
  ariaLabel,
  variant = 'canvas',
  showLabel = false,
  flatResults = false,
  align = 'left',
  objectOptions,
  placeholder,
  showProcessFilter = false,
}) {
  const [open, setOpen] = useState(false);
  const [createRelationshipOpen, setCreateRelationshipOpen] = useState(false);
  const rootRef = useRef(null);

  const close = useCallback(() => {
    setCreateRelationshipOpen(false);
    setOpen(false);
  }, []);
  const closeCreateRelationship = useCallback(() => setCreateRelationshipOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;

    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        close();
      }
    };

    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (createRelationshipOpen) {
          closeCreateRelationship();
          return;
        }
        close();
      }
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, createRelationshipOpen, close, closeCreateRelationship]);

  const resolvedHint =
    variant === 'expansion'
      ? null
      : hint !== undefined
        ? hint
        : lockedScope
          ? SCOPE_HINTS[lockedScope]
          : showLabel
            ? null
            : DEFAULT_HINT;
  const resolvedPlaceholder =
    placeholder ??
    (variant === 'expansion'
      ? 'Search objects and events…'
      : lockedScope
        ? SCOPE_PLACEHOLDERS[lockedScope]
        : showLabel
          ? 'Search to add — connected or not…'
          : 'Search objects, events, and metrics…');
  const resolvedAria =
    ariaLabel ??
    (variant === 'expansion'
      ? 'Add to perspective'
      : lockedScope
        ? SCOPE_ARIA[lockedScope]
        : showLabel
          ? 'Search and add anything to perspective'
          : 'Add object, event, or metric to perspective');

  const triggerClass = [
    styles.trigger,
    variant === 'header' ? styles.triggerHeader : '',
    variant === 'toolbar' ? styles.triggerToolbar : '',
    variant === 'expansion' ? styles.triggerExpansion : '',
    showLabel || variant === 'expansion' ? styles.triggerLabeled : '',
    open ? styles.triggerOpen : '',
  ]
    .filter(Boolean)
    .join(' ');

  const popoverClass = [
    styles.popover,
    showLabel || variant === 'expansion' ? styles.popoverWide : '',
    align === 'right' ? styles.popoverAlignRight : '',
    variant === 'header' ? styles.popoverHeader : '',
    variant === 'expansion' ? styles.popoverExpansion : '',
  ]
    .filter(Boolean)
    .join(' ');

  const showTriggerLabel = showLabel || variant === 'expansion';

  return (
    <div
      className={`${styles.root} ${variant === 'expansion' ? styles.rootExpansion : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        className={triggerClass}
        aria-label={resolvedAria}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        {showTriggerLabel ? (
          <>
            <span className={styles.triggerIcon} aria-hidden>
              +
            </span>
            <span className={styles.triggerLabel}>Add</span>
          </>
        ) : (
          '+'
        )}
      </button>

      {open && (
        <div className={popoverClass} role="dialog" aria-label="Insert into perspective">
          {resolvedHint && <p className={styles.hint}>{resolvedHint}</p>}
          <InsertSearchPanel
            autoFocus
            lockedScope={lockedScope}
            objectOptions={objectOptions ?? { disconnected: true }}
            onSelectObject={onAddObject}
            onSelectEvent={onAddEvent}
            onSelectMetric={onAddMetric}
            onSelectRelationship={onAddRelationship}
            onClose={close}
            placeholder={resolvedPlaceholder}
            flatResults={flatResults || showLabel}
            showProcessFilter={showProcessFilter}
            variant={variant === 'expansion' ? 'expansion' : 'default'}
          />
          <div className={variant === 'expansion' ? styles.createRowExpansion : styles.createRow}>
            <button
              type="button"
              className={styles.createBtn}
              onClick={() => setCreateRelationshipOpen(true)}
            >
              {variant === 'expansion' ? 'Create Relationship…' : 'Create Relationship'}
            </button>
          </div>
        </div>
      )}

      <CreateRelationshipModal
        open={createRelationshipOpen}
        onClose={closeCreateRelationship}
      />
    </div>
  );
}
