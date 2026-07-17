import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  formatSubtypeOptionCount,
  getAttribute,
  getAttributeSplitCandidate,
  getDetectedValueCount,
  getObjectType,
  getObjectTypeTableAttributes,
  getSplitAttributeOptions,
} from '../../../data/mockObjectTypes';
import { SplitHierarchyIcon } from './HierarchyRowParts';
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

function formatCreateSubtypesLabel(count) {
  const n = Number(count) || 0;
  if (n === 0) return 'Create subtypes';
  return `Create ${n.toLocaleString()} subtype${n === 1 ? '' : 's'}`;
}

function formatRowCount(count) {
  const n = Number(count) || 0;
  return `${n.toLocaleString()} ${n === 1 ? 'row' : 'rows'}`;
}

function SplitAttributePicker({
  objectType,
  options,
  value,
  onChange,
  getValueCount,
  modalOpen,
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
            aria-labelledby="split-attribute-label"
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
    <div className={styles.splitAttributePicker} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        id="split-attribute-select"
        className={`${styles.splitAttributeTrigger} ${open ? styles.splitAttributeTriggerOpen : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {selected ? (
          <span className={styles.splitAttributeTriggerText}>
            <span className={styles.splitAttributePrimary}>{selected.name}</span>
            <span className={styles.splitAttributeSecondary}>
              {formatSubtypeOptionCount(selectedCount)}
            </span>
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

function SubtypeValuesBlock({
  valueRows,
  selectedValues,
  onToggleValue,
  onToggleAll,
  showEmptyPrompt,
  emptyPrompt,
  emptyStateIcon = false,
}) {
  const headerCheckboxRef = useRef(null);
  const hasRows = valueRows.length > 0;
  const allSelected = hasRows && valueRows.every((row) => selectedValues.has(row.value));
  const someSelected = valueRows.some((row) => selectedValues.has(row.value));

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  return (
    <div className={styles.modalValuesSection}>
      <div className={styles.modalValuesHeader}>
        <label className={styles.modalValuesHeaderCheckLabel}>
          <input
            ref={headerCheckboxRef}
            type="checkbox"
            checked={allSelected}
            disabled={!hasRows}
            onChange={onToggleAll}
            aria-label="Select all subtype values"
          />
        </label>
        <span className={styles.modalValuesColHeader}>Attribute values</span>
        <span className={`${styles.modalValuesColHeader} ${styles.modalValuesColHeaderEnd}`}>Rows</span>
      </div>
      <div className={styles.modalValuesScroll}>
        {showEmptyPrompt ? (
          <div className={styles.modalValuesEmpty}><br/><br/><br/><br/><br/><br/><br/><br/>image.png
            {emptyStateIcon ? (
              <SplitHierarchyIcon size={26} className={styles.modalValuesEmptyIcon} />
            ) : null}
            <p className={styles.modalValuesEmptyText}>{emptyPrompt}</p>
          </div>
        ) : (
          valueRows.map((item) => (
            <div key={item.value} className={styles.valueRow}>
              <input
                type="checkbox"
                checked={selectedValues.has(item.value)}
                onChange={() => onToggleValue(item.value)}
                aria-label={`Select ${item.value}`}
              />
              <label className={styles.valueLabel} onClick={() => onToggleValue(item.value)}>
                {item.value}
              </label>
              <span className={styles.valueMeta}>{formatRowCount(item.recordCount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function SplitModal({
  open,
  mode = 'create',
  step,
  objectTypeId,
  parentId,
  parentLabel,
  attributeId,
  usedAttributeIds,
  availableValues = [],
  editRows = [],
  onSelectAttribute,
  onBackToAttributes,
  onCreateSelected,
  onSaveEdit,
  onRequestChangeAttribute,
  onClose,
  selectAllOnOpen = false,
  getSplitValueOptionCount,
}) {
  const [draftAttributeId, setDraftAttributeId] = useState('');
  const [selectedValues, setSelectedValues] = useState(() => new Set());
  const [chipPopoverId, setChipPopoverId] = useState(null);
  const objectType = getObjectType(objectTypeId);
  const isEdit = mode === 'edit';
  const isReplace = mode === 'replace';
  const isUnifiedCreate = mode === 'create' && step === 'create';
  const isLegacyAttributeStep = step === 'attribute';
  const isValuesStep = step === 'values' || isUnifiedCreate;

  const activeAttributeId = isUnifiedCreate ? draftAttributeId : attributeId;
  const valueRows = isEdit ? editRows : availableValues;

  useEffect(() => {
    if (!open) {
      setDraftAttributeId('');
      setSelectedValues(new Set());
      setChipPopoverId(null);
      return;
    }
    if (isUnifiedCreate) {
      if (attributeId) {
        setDraftAttributeId(attributeId);
      } else {
        setDraftAttributeId('');
        setSelectedValues(new Set());
      }
      return;
    }
    setDraftAttributeId(attributeId ?? '');
  }, [open, isUnifiedCreate, attributeId]);

  useEffect(() => {
    if (!open || !isUnifiedCreate || !draftAttributeId) return;
    setSelectedValues(new Set(availableValues.map((item) => item.value)));
  }, [open, isUnifiedCreate, draftAttributeId, availableValues]);

  useEffect(() => {
    if (!open || isUnifiedCreate) return;
    if (!isValuesStep) return;
    if (isEdit) {
      setSelectedValues(new Set(editRows.filter((row) => row.selected).map((row) => row.value)));
      return;
    }
    if (!activeAttributeId) {
      setSelectedValues(new Set());
      return;
    }
    setSelectedValues(
      selectAllOnOpen ? new Set(availableValues.map((item) => item.value)) : new Set(),
    );
  }, [
    open,
    isValuesStep,
    isUnifiedCreate,
    activeAttributeId,
    availableValues,
    editRows,
    selectAllOnOpen,
    isEdit,
  ]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const attribute = activeAttributeId ? getAttribute(objectType, activeAttributeId) : null;
  const selectedCount = selectedValues.size;

  const splitAttributeOptions = useMemo(() => {
    if (!objectType) return [];
    return getSplitAttributeOptions(objectType, usedAttributeIds);
  }, [objectType, usedAttributeIds]);

  const tableAttributesForPicker = useMemo(() => {
    if (!objectType) return [];
    return getObjectTypeTableAttributes(objectType);
  }, [objectType]);

  const title = useMemo(() => {
    if (isUnifiedCreate) {
      return parentId ? `Split "${parentLabel}"` : 'Create subtype hierarchy';
    }
    if (step === 'attribute') {
      if (isReplace) return `Change split attribute for "${parentLabel}"`;
      return parentId ? `Split "${parentLabel}" by` : 'Choose a split attribute';
    }
    if (isEdit) {
      return `Edit split on "${parentLabel}" (${attribute?.name ?? 'attribute'})`;
    }
    if (parentId) {
      return `Split "${parentLabel}"`;
    }
    return `Add subtypes from ${attribute?.name ?? 'attribute'}`;
  }, [step, parentId, parentLabel, attribute, isEdit, isReplace, isUnifiedCreate]);

  const description = useMemo(() => {
    if (isUnifiedCreate) {
      return parentId
        ? `Choose an attribute to split ${parentLabel} into more specific business concepts.`
        : 'Choose an attribute to split this object type into more specific business concepts.';
    }
    return null;
  }, [isUnifiedCreate, parentId, parentLabel]);

  if (!open) return null;

  const toggleValue = (value) => {
    setSelectedValues((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const selectAll = () => setSelectedValues(new Set(valueRows.map((item) => item.value)));
  const clearSelection = () => setSelectedValues(new Set());

  const toggleAllVisible = () => {
    const allSelected =
      valueRows.length > 0 && valueRows.every((row) => selectedValues.has(row.value));
    if (allSelected) clearSelection();
    else selectAll();
  };

  const handlePrimary = () => {
    if (isEdit) {
      onSaveEdit?.([...selectedValues]);
      return;
    }
    if (isUnifiedCreate) {
      if (!draftAttributeId) return;
      const values = availableValues.filter((item) => selectedValues.has(item.value));
      onCreateSelected(values, draftAttributeId);
      return;
    }
    const values = availableValues.filter((item) => selectedValues.has(item.value));
    onCreateSelected(values);
  };

  const handleAttributePick = (nextId) => {
    setDraftAttributeId(nextId);
    onSelectAttribute?.(nextId);
  };

  const getAttributeValueCount = (attrId) => {
    if (getSplitValueOptionCount) return getSplitValueOptionCount(attrId);
    return getDetectedValueCount(objectType, attrId);
  };

  const modalClassName = isUnifiedCreate
    ? `${styles.modal} ${styles.modalWide} ${styles.modalWideFixed}`
    : styles.modal;

  const bodyClassName = isUnifiedCreate
    ? `${styles.modalBody} ${styles.modalBodyCreate}`
    : styles.modalBody;

  return createPortal(
    <>
      <button type="button" className={styles.modalBackdrop} aria-label="Close" onClick={onClose} />
      <div className={modalClassName} role="dialog" aria-modal="true" aria-labelledby="split-modal-title">
        <header className={styles.modalHeader}>
          {!isUnifiedCreate ? (
            <p className={styles.modalEyebrow}>
              {step === 'attribute' ? 'Split attribute' : isEdit ? 'Edit split' : 'Subtype values'}
            </p>
          ) : null}
          <h2 id="split-modal-title" className={styles.modalTitle}>
            {title}
          </h2>
          {description ? <p className={styles.modalDescription}>{description}</p> : null}
        </header>

        <div className={bodyClassName}>
          {isUnifiedCreate ? (
            <div className={styles.modalCreateLayout}>
              <div className={styles.modalField}>
                <span className={styles.modalFieldLabel} id="split-attribute-label">
                  Attribute
                </span>
                <SplitAttributePicker
                  objectType={objectType}
                  options={splitAttributeOptions}
                  value={draftAttributeId}
                  onChange={handleAttributePick}
                  getValueCount={getAttributeValueCount}
                  modalOpen={open}
                />
              </div>

              <SubtypeValuesBlock
                valueRows={draftAttributeId ? valueRows : []}
                selectedValues={selectedValues}
                onToggleValue={toggleValue}
                onToggleAll={toggleAllVisible}
                showEmptyPrompt={!draftAttributeId}
                emptyPrompt="Select an attribute to begin"
                emptyStateIcon
              />
            </div>
          ) : step === 'attribute' ? (
            tableAttributesForPicker.map((attr) => {
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
          ) : (
            <SubtypeValuesBlock
              valueRows={valueRows}
              selectedValues={selectedValues}
              onToggleValue={toggleValue}
              onToggleAll={toggleAllVisible}
              showEmptyPrompt={!valueRows.length}
              emptyPrompt="No subtype values available."
            />
          )}
        </div>

        <footer
          className={
            isUnifiedCreate ? `${styles.modalFooter} ${styles.modalFooterUnified}` : styles.modalFooter
          }
        >
          {isValuesStep && !isLegacyAttributeStep ? (
            isUnifiedCreate ? (
              <div className={styles.modalFooterEnd}>
                <button type="button" className={styles.secondaryBtn} onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  disabled={!draftAttributeId || !selectedCount}
                  onClick={handlePrimary}
                >
                  {formatCreateSubtypesLabel(selectedCount)}
                </button>
              </div>
            ) : (
              <>
                <div className={styles.modalFooterStart}>
                  {isEdit ? (
                    <button type="button" className={styles.modalLinkBtn} onClick={onRequestChangeAttribute}>
                      Change split attribute…
                    </button>
                  ) : null}
                </div>
                <div className={styles.modalFooterEnd}>
                  {!isEdit ? (
                    <button type="button" className={styles.secondaryBtn} onClick={onBackToAttributes}>
                      Back
                    </button>
                  ) : null}
                  <button type="button" className={styles.secondaryBtn} onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    disabled={!isEdit && !selectedCount}
                    onClick={handlePrimary}
                  >
                    {isEdit ? `Save changes (${selectedCount})` : formatCreateSubtypesLabel(selectedCount)}
                  </button>
                </div>
              </>
            )
          ) : (
            <div className={styles.modalFooterEnd}>
              <button type="button" className={styles.secondaryBtn} onClick={onClose}>
                Cancel
              </button>
            </div>
          )}
        </footer>
      </div>
    </>,
    document.body,
  );
}
