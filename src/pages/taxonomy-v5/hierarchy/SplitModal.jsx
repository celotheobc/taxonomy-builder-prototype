import { useEffect, useMemo, useRef, useState } from 'react';
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
import SplitMethodChooser from './SplitMethodChooser';
import SplitAttributePicker from './SplitAttributePicker';
import AttributeGroupingPanel from './AttributeGroupingPanel';
import RuleBuilderPanel from './RuleBuilderPanel';
import v5Styles from './SplitModalV5.module.css';
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
          <div className={styles.modalValuesEmpty}>
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

function createGroupId() {
  return `grp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function SplitModal({
  open,
  mode = 'create',
  step,
  objectTypeId,
  parentId,
  parentLabel,
  attributeId,
  creationMethod = null,
  usedAttributeIds,
  availableValues = [],
  editRows = [],
  onSelectAttribute,
  onBackToAttributes,
  onCreateSelected,
  onCreateGroups,
  onCreateRules,
  onChooseCreationMethod,
  onSaveEdit,
  onRequestChangeAttribute,
  onClose,
  selectAllOnOpen = false,
  getSplitValueOptionCount,
}) {
  const [draftAttributeId, setDraftAttributeId] = useState('');
  const [selectedValues, setSelectedValues] = useState(() => new Set());
  const [chipPopoverId, setChipPopoverId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [rules, setRules] = useState([]);
  const objectType = getObjectType(objectTypeId);
  const isEdit = mode === 'edit';
  const isReplace = mode === 'replace';
  const isMethodStep = step === 'method';
  const isV5CreateFlow = isMethodStep && mode === 'create' && !isReplace;
  const showAttributeGrouping = isV5CreateFlow && creationMethod === 'attribute-values';
  const showRulesBuilder = isV5CreateFlow && creationMethod === 'rules';
  const isUnifiedCreate = step === 'create' && !isEdit;
  const isLegacyAttributeStep = step === 'attribute';
  const isValuesStep = step === 'values' || isUnifiedCreate;

  const activeAttributeId = showAttributeGrouping
    ? draftAttributeId || attributeId
    : isUnifiedCreate
      ? draftAttributeId
      : attributeId;
  const valueRows = isEdit ? editRows : availableValues;

  useEffect(() => {
    if (!open) {
      setDraftAttributeId('');
      setSelectedValues(new Set());
      setChipPopoverId(null);
      setGroups([]);
      setEditingGroupId(null);
      setRules([]);
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
    if (isV5CreateFlow) {
      return 'Create subtype hierarchy.';
    }
    if (isUnifiedCreate) {
      if (isReplace) return `Change split attribute for "${parentLabel}"`;
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
  }, [
    step,
    parentId,
    parentLabel,
    attribute,
    isEdit,
    isReplace,
    isUnifiedCreate,
    isV5CreateFlow,
  ]);

  const description = useMemo(() => {
    if (isV5CreateFlow) return null;
    if (isUnifiedCreate) {
      if (isReplace) {
        return `Choose a new attribute to split ${parentLabel}. Existing subtypes from the previous split will be removed when you confirm your choice.`;
      }
      return parentId
        ? `Choose an attribute to split ${parentLabel} into more specific business concepts.`
        : 'Choose an attribute to split this object type into more specific business concepts.';
    }
    return null;
  }, [
    isUnifiedCreate,
    isReplace,
    parentId,
    parentLabel,
  ]);

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
    if (showAttributeGrouping) {
      const attributeIdForCreate = draftAttributeId || attributeId;
      const committedGroups = groups.filter((group) => group.label.trim());
      if (!attributeIdForCreate || !committedGroups.length) return;
      onCreateGroups?.(committedGroups, attributeIdForCreate);
      return;
    }
    if (showRulesBuilder) {
      if (!rules.length) return;
      onCreateRules?.(rules);
      return;
    }
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
    if (isReplace) {
      onSelectAttribute?.(nextId);
      return;
    }
    setDraftAttributeId(nextId);
    onSelectAttribute?.(nextId);
  };

  const getAttributeValueCount = (attrId) => {
    if (getSplitValueOptionCount) return getSplitValueOptionCount(attrId);
    return getDetectedValueCount(objectType, attrId);
  };

  const handleMethodChange = (method) => {
    if (method !== creationMethod) {
      setDraftAttributeId('');
      setGroups([]);
      setEditingGroupId(null);
      setRules([]);
    }
    onChooseCreationMethod?.(method);
  };

  const modalClassName =
    isUnifiedCreate || showAttributeGrouping || showRulesBuilder
      ? `${styles.modal} ${styles.modalWide} ${styles.modalWideFixed}`
      : isV5CreateFlow
        ? `${styles.modal} ${styles.modalWide} ${styles.modalWideFixed}`
        : styles.modal;

  const bodyClassName =
    isUnifiedCreate || showAttributeGrouping || showRulesBuilder
      ? `${styles.modalBody} ${styles.modalBodyCreate}`
      : styles.modalBody;

  const groupingValueRows =
    showAttributeGrouping && (draftAttributeId || attributeId) ? valueRows : [];

  const addSubtypeConcept = () => {
    const id = createGroupId();
    setGroups((prev) => [...prev, { id, label: '', values: [] }]);
    setEditingGroupId(id);
  };

  const updateGroupLabel = (groupId, label) => {
    setGroups((prev) => prev.map((group) => (group.id === groupId ? { ...group, label } : group)));
  };

  const finishEditingGroup = (groupId, label) => {
    const trimmed = label.trim();
    setEditingGroupId(null);
    if (!trimmed) {
      setGroups((prev) => {
        const target = prev.find((group) => group.id === groupId);
        if (target?.values.length) {
          const fallback = target.values[0]?.value ?? '';
          return prev.map((group) =>
            group.id === groupId ? { ...group, label: fallback || group.label } : group,
          );
        }
        return prev.filter((group) => group.id !== groupId);
      });
      return;
    }
    updateGroupLabel(groupId, trimmed);
  };

  const mapValueToGroup = (value, groupId) => {
    const row = groupingValueRows.find((item) => item.value === value);
    if (!row) return;
    setGroups((prev) => {
      const sourceGroupIds = new Set(
        prev.filter((group) => group.values.some((item) => item.value === value)).map((group) => group.id),
      );
      const without = prev.map((group) => ({
        ...group,
        values: group.values.filter((item) => item.value !== value),
      }));
      let next = !groupId
        ? without
        : without.map((group) =>
            group.id === groupId ? { ...group, values: [...group.values, row] } : group,
          );
      next = next.filter((group) => {
        if (group.values.length > 0) return true;
        if (group.id === editingGroupId) return true;
        if (sourceGroupIds.has(group.id)) return false;
        return true;
      });
      return next;
    });
  };

  const createSubtypeFromValue = (value) => {
    const row = groupingValueRows.find((item) => item.value === value);
    if (!row) return;
    const newId = createGroupId();
    let renameGroupId = null;
    setGroups((prev) => {
      const without = prev.map((group) => ({
        ...group,
        values: group.values.filter((item) => item.value !== value),
      }));
      const existing = without.find((group) => group.label.trim() === row.value);
      if (existing) {
        return without.map((group) =>
          group.id === existing.id ? { ...group, values: [...group.values, row] } : group,
        );
      }
      renameGroupId = newId;
      return [...without, { id: newId, label: row.value, values: [row] }];
    });
    setEditingGroupId(renameGroupId);
  };

  const createOnePerValue = () => {
    setGroups(
      groupingValueRows.map((row) => ({
        id: createGroupId(),
        label: row.value,
        values: [{ value: row.value, recordCount: row.recordCount }],
      })),
    );
    setEditingGroupId(null);
  };

  const removeGroupConcept = (groupId) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
    setEditingGroupId((current) => (current === groupId ? null : current));
  };

  const startEditingGroup = (groupId) => {
    setEditingGroupId(groupId);
  };

  const unassignValue = (value) => {
    mapValueToGroup(value, null);
  };

  const primaryDisabled = () => {
    if (showAttributeGrouping) {
      const attributeIdForCreate = draftAttributeId || attributeId;
      return !attributeIdForCreate || !groups.some((group) => group.label.trim());
    }
    if (showRulesBuilder) {
      const hasReadyRule = rules.some(
        (rule) =>
          rule.label.trim() && rule.conditions.some((condition) => condition.fieldId && condition.value),
      );
      return !hasReadyRule;
    }
    if (isEdit) return false;
    if (isUnifiedCreate) return !draftAttributeId || !selectedCount;
    return !selectedCount;
  };

  const primaryLabel = () => {
    if (showAttributeGrouping) {
      return formatCreateSubtypesLabel(groups.filter((group) => group.label.trim()).length);
    }
    if (showRulesBuilder) {
      return formatCreateSubtypesLabel(
        rules.filter(
          (rule) =>
            rule.label.trim() && rule.conditions.some((c) => c.fieldId && c.value),
        ).length,
      );
    }
    if (isEdit) return `Save changes (${selectedCount})`;
    if (isUnifiedCreate) return formatCreateSubtypesLabel(selectedCount);
    return formatCreateSubtypesLabel(selectedCount);
  };

  const showV5CreatePrimary = showAttributeGrouping || showRulesBuilder;

  return createPortal(
    <>
      <button type="button" className={styles.modalBackdrop} aria-label="Close" onClick={onClose} />
      <div className={modalClassName} role="dialog" aria-modal="true" aria-labelledby="split-modal-title">
        <header className={styles.modalHeader}>
          {!isUnifiedCreate && !isV5CreateFlow ? (
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
          {isV5CreateFlow ? (
            <div className={styles.modalCreateLayout}>
              <SplitMethodChooser
                value={creationMethod ?? ''}
                onChange={handleMethodChange}
              />
              {showAttributeGrouping ? (
                <div className={v5Styles.methodBodySection}>
                  <div className={v5Styles.attributeBulkRow}>
                    <div className={`${styles.modalField} ${v5Styles.attributeField}`}>
                      <span className={styles.modalFieldLabel} id="split-attribute-label">
                        Attribute
                      </span>
                      <SplitAttributePicker
                        objectType={objectType}
                        options={splitAttributeOptions}
                        value={draftAttributeId || attributeId || ''}
                        onChange={(nextId) => {
                          setDraftAttributeId(nextId);
                          onSelectAttribute?.(nextId);
                          setGroups([]);
                          setEditingGroupId(null);
                        }}
                        getValueCount={getAttributeValueCount}
                        modalOpen={open}
                      />
                    </div>
                    {(draftAttributeId || attributeId) && groupingValueRows.length ? (
                      <button
                        type="button"
                        className={v5Styles.bulkCreateBtn}
                        onClick={createOnePerValue}
                      >
                        Create one subtype per value
                      </button>
                    ) : null}
                  </div>
                  <AttributeGroupingPanel
                      objectType={objectType}
                      placeholderOnly={!(draftAttributeId || attributeId)}
                      valueRows={groupingValueRows}
                      groups={groups}
                      editingGroupId={editingGroupId}
                      onAddSubtype={addSubtypeConcept}
                      onUpdateGroupLabel={updateGroupLabel}
                      onFinishEditingGroup={finishEditingGroup}
                      onMapValueToGroup={mapValueToGroup}
                      onCreateSubtypeFromValue={createSubtypeFromValue}
                      onRemoveGroup={removeGroupConcept}
                      onStartEditingGroup={startEditingGroup}
                      onUnassignValue={unassignValue}
                    />
                </div>
              ) : null}
              {showRulesBuilder ? (
                <div className={v5Styles.methodBodySection}>
                  <RuleBuilderPanel
                    objectType={objectType}
                    objectTypeId={objectTypeId}
                    rules={rules}
                    onRulesChange={setRules}
                    splitAttributeOptions={splitAttributeOptions}
                    getValueCount={getAttributeValueCount}
                    modalOpen={open}
                  />
                </div>
              ) : null}
            </div>
          ) : isUnifiedCreate ? (
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
            isUnifiedCreate || isV5CreateFlow
              ? `${styles.modalFooter} ${styles.modalFooterUnified}`
              : styles.modalFooter
          }
        >
          {isV5CreateFlow ? (
            <div className={styles.modalFooterEnd}>
              <button type="button" className={styles.secondaryBtn} onClick={onClose}>
                Cancel
              </button>
              {showV5CreatePrimary ? (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  disabled={primaryDisabled()}
                  onClick={handlePrimary}
                >
                  {primaryLabel()}
                </button>
              ) : null}
            </div>
          ) : isValuesStep && !isLegacyAttributeStep ? (
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
