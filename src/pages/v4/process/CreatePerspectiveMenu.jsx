import { useCallback, useEffect, useId, useRef } from 'react';
import styles from './CreatePerspectiveMenu.module.css';

export default function CreatePerspectiveMenu({
  open,
  onOpenChange,
  onCreateEntire,
  onSelectSubset,
}) {
  const rootRef = useRef(null);
  const menuId = useId();

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return undefined;

    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => onOpenChange(!open)}
      >
        Create perspective
        <span className={styles.chevron} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div id={menuId} className={styles.menu} role="menu" aria-label="Create perspective">
          <button
            type="button"
            className={styles.menuItem}
            role="menuitem"
            onClick={() => {
              onCreateEntire();
              close();
            }}
          >
            <span className={styles.menuTitle}>Create from entire process</span>
            <span className={styles.menuDesc}>
              Create a perspective containing all objects and events from this process.
            </span>
          </button>
          <button
            type="button"
            className={styles.menuItem}
            role="menuitem"
            onClick={() => {
              onSelectSubset();
              close();
            }}
          >
            <span className={styles.menuTitle}>Select subset</span>
            <span className={styles.menuDesc}>
              Choose specific objects and events from this process before creating a perspective.
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
