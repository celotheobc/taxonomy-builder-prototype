import { useEffect, useRef } from 'react';
import {
  formatSubtypeOptionCount,
  getAttributeSplitCandidate,
  getDetectedValueCount,
  getObjectType,
} from '../../../data/mockObjectTypes';
import { getUsedSplitAttributes } from '../../../data/taxonomyTreeModel';
import styles from './TaxonomyTree.module.css';

const CHIP_CLASS = {
  Recommended: styles.pickerChipRecommended,
  'Not recommended': styles.pickerChipNotRecommended,
};

export default function AttributePickerPopover({
  open,
  objectTypeId,
  nodes,
  parentId,
  parentLabel,
  onSelectAttribute,
  onClose,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const objectType = getObjectType(objectTypeId);
  const usedAttributes = parentId ? getUsedSplitAttributes(parentId, nodes) : new Set();
  const title = parentId ? `Split "${parentLabel}" by` : 'Choose a split attribute';

  return (
    <>
      <button
        type="button"
        className={styles.treePopoverBackdrop}
        aria-label="Close attribute picker"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className={styles.treePopover}
        role="dialog"
        aria-modal="true"
        aria-labelledby="attribute-picker-title"
      >
        <header className={styles.treePopoverHeader}>
          <p className={styles.treePopoverEyebrow}>Split attribute</p>
          <h2 id="attribute-picker-title" className={styles.treePopoverTitle}>
            {title}
          </h2>
        </header>

        <div className={styles.treePopoverBody}>
          {objectType.attributes.map((attribute) => {
            const candidate = getAttributeSplitCandidate(objectType, attribute.id);
            const valueCount = getDetectedValueCount(objectType, attribute.id);
            const isUsed = usedAttributes.has(attribute.id);
            const showChip =
              candidate.recommendation === 'Recommended' ||
              candidate.recommendation === 'Not recommended';
            const chipClass = CHIP_CLASS[candidate.recommendation];

            return (
              <button
                key={attribute.id}
                type="button"
                className={isUsed ? styles.pickerRowDisabled : styles.pickerRow}
                disabled={isUsed}
                onClick={() => onSelectAttribute(attribute.id)}
              >
                <span className={styles.pickerRowName}>{attribute.name}</span>
                <span className={styles.pickerRowMeta}>
                  {formatSubtypeOptionCount(valueCount)}
                </span>
                {showChip ? (
                  <span className={`${styles.pickerChip} ${chipClass}`}>
                    {candidate.recommendation}
                  </span>
                ) : (
                  <span aria-hidden />
                )}
              </button>
            );
          })}
        </div>

        <footer className={styles.treePopoverFooter}>
          <button type="button" className={styles.treeSecondaryBtn} onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </>
  );
}
