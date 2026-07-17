import { useEffect, useMemo } from 'react';
import { getAttribute, getObjectType } from '../../../data/mockObjectTypes';
import styles from './TaxonomyTree.module.css';

export default function ValuePickerPopover({
  open,
  objectTypeId,
  attributeId,
  parentId,
  nodes,
  parentLabel,
  onAddValue,
  onAddAll,
  onBack,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const objectType = getObjectType(objectTypeId);
  const attribute = getAttribute(objectType, attributeId);
  const values = useMemo(() => {
    const all = objectType.attributeValues[attributeId] ?? [];
    const existing = new Set(
      nodes
        .filter((node) => (node.parentId ?? null) === parentId)
        .map((node) => node.matchingValue ?? node.label),
    );
    return all.filter((item) => !existing.has(item.value));
  }, [objectType, attributeId, nodes, parentId]);

  const totalRows = useMemo(
    () => values.reduce((sum, item) => sum + (item.recordCount ?? 0), 0),
    [values],
  );

  if (!open || !attribute) return null;

  const title = parentId
    ? `Add subtypes under "${parentLabel}" from ${attribute.name}`
    : `Add subtypes from ${attribute.name}`;

  return (
    <>
      <button
        type="button"
        className={styles.treePopoverBackdrop}
        aria-label="Close value picker"
        onClick={onClose}
      />
      <div className={styles.treePopover} role="dialog" aria-modal="true">
        <header className={styles.treePopoverHeader}>
          <p className={styles.treePopoverEyebrow}>Subtype values</p>
          <h2 className={styles.treePopoverTitle}>{title}</h2>
        </header>

        <div className={styles.treePopoverBody}>
          {values.length ? (
            values.map((item) => (
              <div key={item.value} className={styles.valueRow}>
                <span className={styles.valueRowName}>{item.value}</span>
                <span className={styles.valueRowMeta}>
                  {item.recordCount.toLocaleString()} rows
                </span>
                <button
                  type="button"
                  className={styles.valueAddBtn}
                  onClick={() => onAddValue(item)}
                >
                  Add
                </button>
              </div>
            ))
          ) : (
            <p className={styles.treeEmptyCopy}>All values from this attribute are already in the tree.</p>
          )}
        </div>

        <footer className={styles.treePopoverFooter}>
          <button type="button" className={styles.treeSecondaryBtn} onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className={styles.valueAddAllBtn}
            disabled={!values.length}
            onClick={() => onAddAll(values)}
          >
            Add all
          </button>
        </footer>
      </div>
    </>
  );
}
