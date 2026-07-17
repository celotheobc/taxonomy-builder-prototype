import { useEffect, useState } from 'react';
import styles from './TaxonomyEditor.module.css';

export default function MoveToGroupModal({
  open,
  memberLabel,
  groups,
  onClose,
  onMove,
  onCreateGroup,
}) {
  const [selectedGroupId, setSelectedGroupId] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedGroupId(groups[0]?.id ?? '');
    }
  }, [open, groups]);

  if (!open) return null;

  const topLevelGroups = groups.filter((group) => !group.parentId);

  return (
    <div className={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-to-group-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <h2 id="move-to-group-title" className={styles.modalTitle}>
            Move to group
          </h2>
          <p className={styles.modalLead}>
            Add <strong>{memberLabel}</strong> to a business group. Members can belong to multiple
            groups.
          </p>
        </header>
        <div className={styles.modalBody}>
          {topLevelGroups.length ? (
            <ul className={styles.modalList}>
              {topLevelGroups.map((group) => (
                <li key={group.id}>
                  <label className={styles.modalOption}>
                    <input
                      type="radio"
                      name="target-group"
                      checked={selectedGroupId === group.id}
                      onChange={() => setSelectedGroupId(group.id)}
                    />
                    <span>{group.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.docTextMuted}>
              No groups yet. Create a group first, then move members into it.
            </p>
          )}
        </div>
        <footer className={styles.modalFooter}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          {topLevelGroups.length ? (
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={!selectedGroupId}
              onClick={() => {
                onMove(selectedGroupId);
                onClose();
              }}
            >
              Move to group
            </button>
          ) : (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => {
                onCreateGroup();
                onClose();
              }}
            >
              Create group
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
