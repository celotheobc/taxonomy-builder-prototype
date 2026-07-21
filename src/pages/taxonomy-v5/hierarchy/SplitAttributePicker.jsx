import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatSubtypeOptionCount, getAttribute } from '../../../data/mockObjectTypes';
import styles from './Hierarchy.module.css';

export default function SplitAttributePicker({
  objectType,
  options,
  value,
  onChange,
  getValueCount,
  modalOpen,
  triggerId = 'split-attribute-select',
  labelledBy = 'split-attribute-label',
  compact = false,
  singleLineTrigger = false,
}) {
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const selected = value ? getAttribute(objectType, value) : null;
  const selectedCount = value ? getValueCount(value) : 0;

  useEffect(() => {
    if (modalOpen) return;
    setOpen(false);
  }, [modalOpen]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return undefined;

    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const maxHeight = 280;
      const gap = 6;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
      const available = openUp ? Math.min(maxHeight, spaceAbove) : Math.min(maxHeight, spaceBelow);
      setPopoverStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        maxHeight: Math.max(120, available),
        zIndex: 310,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + gap }
          : { top: rect.bottom + gap }),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const selectOption = (attrId) => {
    onChange(attrId);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const popover =
    open && popoverStyle
      ? createPortal(
          <ul
            ref={popoverRef}
            className={styles.splitAttributePopoverPortal}
            style={popoverStyle}
            role="listbox"
            aria-labelledby={labelledBy}
          >
            {options.map((attr) => {
              const valueCount = getValueCount(attr.id);
              const isSelected = attr.id === value;
              return (
                <li key={attr.id} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`${styles.splitAttributeOption} ${isSelected ? styles.splitAttributeOptionSelected : ''}`}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      selectOption(attr.id);
                    }}
                  >
                    <span className={styles.splitAttributePrimary}>{attr.name}</span>
                    <span className={styles.splitAttributeSecondary}>
                      {formatSubtypeOptionCount(valueCount)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div
      className={`${styles.splitAttributePicker} ${compact ? styles.splitAttributePickerCompact : ''} ${singleLineTrigger ? styles.splitAttributePickerSingleLine : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        ref={triggerRef}
        id={triggerId}
        className={`${styles.splitAttributeTrigger} ${open ? styles.splitAttributeTriggerOpen : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {selected ? (
          <span className={styles.splitAttributeTriggerText}>
            <span className={styles.splitAttributePrimary}>{selected.name}</span>
            {!singleLineTrigger ? (
              <span className={styles.splitAttributeSecondary}>
                {formatSubtypeOptionCount(selectedCount)}
              </span>
            ) : null}
          </span>
        ) : (
          <span className={styles.splitAttributePlaceholder}>Select attribute</span>
        )}
        <span className={styles.splitAttributeChevron} aria-hidden />
      </button>
      {popover}
    </div>
  );
}
