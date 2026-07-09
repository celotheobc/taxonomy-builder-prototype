import { useEffect, useState } from 'react';
import styles from './TaxonomyEditor.module.css';

export default function AddMembersModal({
  open,
  groupLabel,
  subtypes,
  existingMemberIds = [],
  onClose,
  onAdd,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (open) setSelectedIds([]);
  }, [open, groupLabel]);

  if (!open) return null;

  const toggleMember = (memberId) => {
    setSelectedIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  };

  return (
    <div className={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-members-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <h2 id="add-members-title" className={styles.modalTitle}>
            Add members
          </h2>
          <p className={styles.modalLead}>
            Add subtype members to <strong>{groupLabel}</strong>. Members can belong to multiple groups.
          </p>
        </header>
        <div className={styles.modalBody}>
          <ul className={styles.modalList}>
            {subtypes.map((subtype) => {
              const checked = selectedIds.includes(subtype.id);
              const alreadyInGroup = existingMemberIds.includes(subtype.id);
              return (
                <li key={subtype.id}>
                  <label className={styles.modalOption}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMember(subtype.id)}
                    />
                    <span>
                      {subtype.label}
                      {alreadyInGroup ? ' (already in group)' : ''}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
        <footer className={styles.modalFooter}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!selectedIds.length}
            onClick={() => {
              onAdd(selectedIds);
              onClose();
            }}
          >
            Add {selectedIds.length ? `(${selectedIds.length})` : ''}
          </button>
        </footer>
      </div>
    </div>
  );
}
