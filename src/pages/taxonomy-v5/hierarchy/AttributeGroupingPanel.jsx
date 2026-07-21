import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  formatMatchingRecords,
  SUBTYPE_PREVIEW_EMPTY,
} from './subtypeMatchCopy';
import styles from './SplitModalV5.module.css';

function PointerSelectIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4l7.07 16.97 2.51-7.39 7.39-2.51L4 4z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M13 13l6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3.25 3.25l7.5 7.5M10.75 3.25l-7.5 7.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatRowCount(count) {
  const n = Number(count) || 0;
  return `${n.toLocaleString()} ${n === 1 ? 'row' : 'rows'}`;
}

function getValueGroupId(value, groups) {
  const group = groups.find((item) => item.values.some((entry) => entry.value === value));
  return group?.id ?? '';
}

function renameInputId(groupId) {
  return `subtype-rename-${groupId}`;
}

export default function AttributeGroupingPanel({
  objectType,
  placeholderOnly = false,
  valueRows,
  groups,
  onAddSubtype,
  onUpdateGroupLabel,
  onFinishEditingGroup,
  onMapValueToGroup,
  onCreateSubtypeFromValue,
  onRemoveGroup,
  onUnassignValue,
}) {
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [renameRequestId, setRenameRequestId] = useState(0);
  const [pendingRenameGroupId, setPendingRenameGroupId] = useState(null);
  const renameInputRef = useRef(null);

  useEffect(() => {
    if (!groups.length) {
      setEditingGroupId(null);
      setRenameRequestId(0);
      setPendingRenameGroupId(null);
    }
  }, [groups.length]);

  useLayoutEffect(() => {
    if (!pendingRenameGroupId) return;
    if (!groups.some((group) => group.id === pendingRenameGroupId)) return;
    setPendingRenameGroupId(null);
    setEditingGroupId(pendingRenameGroupId);
    setRenameRequestId((requestId) => requestId + 1);
  }, [groups, pendingRenameGroupId]);

  const queueRename = (groupId) => {
    if (!groupId) return;
    setPendingRenameGroupId(groupId);
  };

  const beginRename = (groupId) => {
    if (!groupId) return;
    setPendingRenameGroupId(null);
    setEditingGroupId(groupId);
    setRenameRequestId((requestId) => requestId + 1);
  };

  const editingGroupExists = groups.some((group) => group.id === editingGroupId);

  useLayoutEffect(() => {
    if (!editingGroupId || !renameRequestId || !editingGroupExists) return;

    const focusRenameInput = () => {
      const input = renameInputRef.current;
      if (!input || input.id !== renameInputId(editingGroupId)) return false;
      input.focus({ preventScroll: true });
      input.select();
      input.scrollIntoView({ block: 'nearest' });
      return true;
    };

    if (focusRenameInput()) return undefined;
    const frame = requestAnimationFrame(focusRenameInput);
    return () => cancelAnimationFrame(frame);
  }, [editingGroupId, renameRequestId, editingGroupExists]);

  const exitRename = (groupId, label) => {
    onFinishEditingGroup(groupId, label);
    setEditingGroupId((current) => (current === groupId ? null : current));
  };

  const handleCreateFromValue = (value) => {
    const newGroupId = onCreateSubtypeFromValue(value);
    if (newGroupId) queueRename(newGroupId);
  };

  const handleAddSubtype = () => {
    const newGroupId = onAddSubtype();
    if (newGroupId) queueRename(newGroupId);
  };

  const handleRemoveGroup = (groupId) => {
    onRemoveGroup(groupId);
    setEditingGroupId((current) => (current === groupId ? null : current));
  };

  const handleMapToGroup = (value, targetGroupId) => {
    onMapValueToGroup(value, targetGroupId, editingGroupId);
  };

  const subtypeCount = useMemo(
    () => groups.filter((group) => group.label.trim()).length,
    [groups],
  );

  const assignableSubtypes = groups.filter((group) => group.label.trim());
  const showAssignControls = groups.length > 0;
  const listRowClassName = showAssignControls
    ? `${styles.groupingValueRow} ${styles.groupingValueRowWithAssign}`
    : `${styles.groupingValueRow} ${styles.groupingValueRowCreateOnly}`;
  const listHeaderClassName = showAssignControls
    ? `${styles.groupingListHeader} ${styles.groupingListHeaderWithAssign}`
    : `${styles.groupingListHeader} ${styles.groupingListHeaderCreateOnly}`;

  if (placeholderOnly) {
    return (
      <div className={styles.groupingShell}>
        <div className={styles.groupingFormWrap}>
          <div className={styles.groupingPlaceholder} role="status">
            <PointerSelectIcon className={styles.groupingPlaceholderIcon} />
            <p className={styles.groupingPlaceholderText}>Select an attribute to show source values.</p>
          </div>
          <p className={styles.classificationProgress} aria-live="polite">
            <span className={styles.classificationProgressMuted}>No subtypes yet</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.groupingShell}>
      <div className={styles.groupingFormWrap}>
        <div className={styles.groupingLayout}>
        <div className={styles.groupingColumn}>
          <div className={styles.groupingList}>
            <div className={listHeaderClassName} aria-hidden>
              <span>Source values ({valueRows.length})</span>
              {showAssignControls ? (
                <span className={styles.groupingListHeaderAssign}>Assign to existing subtype</span>
              ) : null}
              <span className={styles.groupingListHeaderCreate}>Create subtype</span>
            </div>
            {valueRows.map((row) => {
              const groupId = getValueGroupId(row.value, groups);
              const isAssigned = Boolean(groupId);
              return (
                <div key={row.value} className={listRowClassName}>
                  <div className={styles.groupingValueCell}>
                    <span className={styles.groupingValueName}>{row.value}</span>
                    <span className={styles.groupingValueRowCount}>{formatRowCount(row.recordCount)}</span>
                  </div>
                  {showAssignControls ? (
                    <label className={styles.mapToLabel}>
                      <span className={styles.srOnly}>Assign to existing subtype for {row.value}</span>
                      <select
                        className={styles.mapToSelect}
                        value={groupId || ''}
                        onChange={(event) => {
                          const next = event.target.value;
                          if (next) handleMapToGroup(row.value, next);
                        }}
                        aria-label={`Assign to existing subtype for ${row.value}`}
                      >
                        {!isAssigned ? (
                          <option value="" disabled>
                            Assign to existing subtype
                          </option>
                        ) : null}
                        {assignableSubtypes.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.label.trim()}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  <button
                    type="button"
                    className={styles.createFromValueBtn}
                    disabled={isAssigned}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleCreateFromValue(row.value)}
                  >
                    Create subtype
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${styles.groupingColumn} ${styles.groupingColumnPreview}`}>
          <div className={styles.groupingColumnHeader}>
            <h3 className={styles.groupingColumnTitlePreview}>
              Subtypes ({groups.length})
            </h3>
            <button
              type="button"
              className={styles.addSubtypeBtnSecondary}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleAddSubtype}
            >
              Add subtype
            </button>
          </div>
          <div className={styles.groupingGroups}>
            {!groups.length ? (
              <p className={styles.groupingPreviewEmpty}>{SUBTYPE_PREVIEW_EMPTY}</p>
            ) : (
              groups.map((group) => {
                const isEditing = editingGroupId === group.id;
                const showAssignHint = group.values.length === 0;
                const matchCount = group.values.reduce(
                  (sum, item) => sum + (Number(item.recordCount) || 0),
                  0,
                );
                return (
                  <article key={group.id} className={styles.conceptCard}>
                    <div className={styles.conceptCardHeader}>
                      {isEditing ? (
                        <input
                          ref={renameInputRef}
                          id={renameInputId(group.id)}
                          type="text"
                          className={styles.conceptNameInput}
                          value={group.label}
                          placeholder="Subtype name"
                          onChange={(event) => onUpdateGroupLabel(group.id, event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              exitRename(group.id, group.label);
                            }
                            if (event.key === 'Escape') {
                              event.preventDefault();
                              exitRename(group.id, '');
                            }
                          }}
                          onBlur={() => onUpdateGroupLabel(group.id, group.label)}
                          aria-label="Subtype name"
                          aria-describedby={showAssignHint ? `subtype-hint-${group.id}` : undefined}
                        />
                      ) : (
                        <button
                          type="button"
                          className={styles.conceptNameButton}
                          onClick={() => beginRename(group.id)}
                        >
                          {group.label.trim() || 'Subtype name'}
                        </button>
                      )}
                      {!isEditing ? (
                        <button
                          type="button"
                          className={styles.conceptRemoveBtn}
                          onClick={() => handleRemoveGroup(group.id)}
                          aria-label={`Remove ${group.label.trim() || 'subtype'}`}
                        >
                          <CloseIcon />
                        </button>
                      ) : null}
                    </div>
                    {showAssignHint ? (
                      <p className={styles.conceptAssignHint} id={`subtype-hint-${group.id}`}>
                        Assign source values using the dropdowns on the left.
                      </p>
                    ) : null}
                    {group.values.length ? (
                      <>
                        <div className={styles.conceptChipRow}>
                          {group.values.map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              className={styles.conceptValueChip}
                              onClick={() => onUnassignValue(item.value)}
                              aria-label={`Remove ${item.value} from ${group.label.trim() || 'subtype'}`}
                            >
                              {item.value}
                            </button>
                          ))}
                        </div>
                        <p className={styles.subtypeNavCardMatchSecondary}>
                          {formatMatchingRecords(matchCount, objectType)}
                        </p>
                      </>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </div>
        </div>
        <p className={styles.classificationProgress} aria-live="polite">
          {subtypeCount > 0 ? (
            <span className={styles.classificationProgressStrong}>
              {subtypeCount} subtype{subtypeCount === 1 ? '' : 's'} created
            </span>
          ) : (
            <span className={styles.classificationProgressMuted}>No subtypes yet</span>
          )}
        </p>
      </div>
    </div>
  );
}
