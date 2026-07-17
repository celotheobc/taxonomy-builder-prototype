import { useEffect, useMemo, useState } from 'react';
import {
  formatSubtypeOptionCount,
  getAttribute,
  getAttributeSplitCandidate,
  getDetectedValueCount,
  getObjectType,
} from '../../../data/mockObjectTypes';
import styles from './Hierarchy.module.css';

const CHIP_CLASS = {
  Recommended: styles.chipRecommended,
  'Not recommended': styles.chipNotRecommended,
};

const RECOMMENDATION_COPY = {
  Recommended:
    'Recommended because this attribute contains a small, stable set of meaningful business categories.',
  'Not recommended':
    'Not recommended because this attribute behaves like an identifier and would create too many highly specific subtypes.',
};

function ChevronIcon({ open }) {
  return (
    <svg
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
    >
      <path
        d="M3 2 7 5 3 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SplitModal({
  open,
  step,
  objectTypeId,
  parentId,
  parentLabel,
  attributeId,
  usedAttributeIds,
  availableValues,
  onSelectAttribute,
  onBackToAttributes,
  onCreateSelected,
  onClose,
  selectAllOnOpen = true,
}) {
  const [selectedValues, setSelectedValues] = useState(() => new Set());
  const [chipPopoverId, setChipPopoverId] = useState(null);
  const objectType = getObjectType(objectTypeId);

  useEffect(() => {
    if (!open || step !== 'values') return;
    setSelectedValues(
      selectAllOnOpen
        ? new Set(availableValues.map((item) => item.value))
        : new Set(),
    );
  }, [open, step, attributeId, availableValues, selectAllOnOpen]);

  useEffect(() => {
    if (!open) {
      setChipPopoverId(null);
      setSelectedValues(new Set());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const attribute = attributeId ? getAttribute(objectType, attributeId) : null;
  const selectedCount = selectedValues.size;

  const title = useMemo(() => {
    if (step === 'attribute') {
      return parentId ? `Split "${parentLabel}" by` : 'Choose a split attribute';
    }
    if (parentId) {
      return `Add subtypes under "${parentLabel}" from ${attribute?.name ?? 'attribute'}`;
    }
    return `Add subtypes from ${attribute?.name ?? 'attribute'}`;
  }, [step, parentId, parentLabel, attribute]);

  if (!open) return null;

  const toggleValue = (value) => {
    setSelectedValues((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const selectAll = () => setSelectedValues(new Set(availableValues.map((item) => item.value)));
  const clearSelection = () => setSelectedValues(new Set());

  const handleCreate = () => {
    const values = availableValues.filter((item) => selectedValues.has(item.value));
    onCreateSelected(values);
  };

  return (
    <>
      <button type="button" className={styles.modalBackdrop} aria-label="Close" onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="split-modal-title">
        <header className={styles.modalHeader}>
          <p className={styles.modalEyebrow}>
            {step === 'attribute' ? 'Split attribute' : 'Subtype values'}
          </p>
          <h2 id="split-modal-title" className={styles.modalTitle}>
            {title}
          </h2>
        </header>

        <div className={styles.modalBody}>
          {step === 'attribute'
            ? objectType.attributes.map((attr) => {
                const candidate = getAttributeSplitCandidate(objectType, attr.id);
                const valueCount = getDetectedValueCount(objectType, attr.id);
                const isUsed = usedAttributeIds.has(attr.id);
                const showChip =
                  candidate.recommendation === 'Recommended' ||
                  candidate.recommendation === 'Not recommended';

                return (
                  <button
                    key={attr.id}
                    type="button"
                    className={isUsed ? styles.attrRowDisabled : styles.attrRow}
                    disabled={isUsed}
                    onClick={() => onSelectAttribute(attr.id)}
                  >
                    <span className={styles.attrName}>{attr.name}</span>
                    <span className={styles.attrMeta}>{formatSubtypeOptionCount(valueCount)}</span>
                    {showChip ? (
                      <span className={styles.chipWrap}>
                        <button
                          type="button"
                          className={`${styles.chipBtn} ${CHIP_CLASS[candidate.recommendation]}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setChipPopoverId((prev) => (prev === attr.id ? null : attr.id));
                          }}
                        >
                          {candidate.recommendation}
                        </button>
                        {chipPopoverId === attr.id ? (
                          <span className={styles.chipPopover} role="tooltip">
                            {RECOMMENDATION_COPY[candidate.recommendation] ?? candidate.reason}
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      <span aria-hidden />
                    )}
                  </button>
                );
              })
            : availableValues.map((item) => (
                <div key={item.value} className={styles.valueRow}>
                  <input
                    type="checkbox"
                    checked={selectedValues.has(item.value)}
                    onChange={() => toggleValue(item.value)}
                    aria-label={`Select ${item.value}`}
                  />
                  <label className={styles.valueLabel} onClick={() => toggleValue(item.value)}>
                    {item.value}
                  </label>
                  <span className={styles.valueMeta}>{item.recordCount.toLocaleString()} rows</span>
                </div>
              ))}
        </div>

        <footer className={styles.modalFooter}>
          {step === 'values' ? (
            <>
              <div className={styles.modalFooterStart}>
                <button type="button" className={styles.modalLinkBtn} onClick={selectAll}>
                  Select all
                </button>
                <button type="button" className={styles.modalLinkBtn} onClick={clearSelection}>
                  Clear selection
                </button>
              </div>
              <div className={styles.modalFooterEnd}>
                <button type="button" className={styles.secondaryBtn} onClick={onBackToAttributes}>
                  Back
                </button>
                <button type="button" className={styles.secondaryBtn} onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  disabled={!selectedCount}
                  onClick={handleCreate}
                >
                  Create selected ({selectedCount})
                </button>
              </div>
            </>
          ) : (
            <div className={styles.modalFooterEnd}>
              <button type="button" className={styles.secondaryBtn} onClick={onClose}>
                Cancel
              </button>
            </div>
          )}
        </footer>
      </div>
    </>
  );
}
