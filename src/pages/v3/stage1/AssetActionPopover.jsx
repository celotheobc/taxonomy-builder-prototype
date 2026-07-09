import { useCallback, useEffect, useId, useRef } from 'react';
import styles from './AssetActionPopover.module.css';

export default function AssetActionPopover({
  label,
  disabled = false,
  open,
  onOpenChange,
  items,
  newItemLabel,
  onSelectItem,
  onSelectNew,
  menuAriaLabel,
  variant = 'secondary',
}) {
  const rootRef = useRef(null);
  const menuId = useId();

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const toggle = useCallback(() => {
    if (disabled) return;
    onOpenChange(!open);
  }, [disabled, onOpenChange, open]);

  useEffect(() => {
    if (!open) return undefined;

    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        close();
      }
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
        className={[
          styles.trigger,
          variant === 'secondary' ? styles.triggerSecondary : '',
          open ? styles.triggerOpen : '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={toggle}
      >
        {label}
      </button>

      {open && (
        <div
          id={menuId}
          className={styles.menu}
          role="menu"
          aria-label={menuAriaLabel}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.menuItem}
              role="menuitem"
              onClick={() => {
                onSelectItem(item);
                close();
              }}
            >
              {item.label}
            </button>
          ))}
          <div className={styles.divider} role="separator" />
          <button
            type="button"
            className={styles.menuItemNew}
            role="menuitem"
            onClick={() => {
              onSelectNew();
              close();
            }}
          >
            {newItemLabel}
          </button>
        </div>
      )}
    </div>
  );
}
