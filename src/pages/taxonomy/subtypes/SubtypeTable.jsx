import { useState } from 'react';
import { getAttribute, getObjectType } from '../../../data/mockObjectTypes';
import tableStyles from '../sections/ObjectTypeSectionCard.module.css';
import styles from './SubtypesSection.module.css';

function OpenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M9 2h3v3M8 6l4-4M5 2H3.5A1.5 1.5 0 002 3.5v7A1.5 1.5 0 003.5 12h7a1.5 1.5 0 001.5-1.5V9"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PreviewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M1 7s2.2-4 6-4 6 4 6 4-2.2 4-6 4-6-4-6-4Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7" r="1.75" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 4h9M5.25 4V3a.75.75 0 01.75-.75h2a.75.75 0 01.75.75v1m1.5 0V11a1 1 0 01-1 1H4.75a1 1 0 01-1-1V4h7.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SubtypeNameCell({ subtype, onRename }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(subtype.label);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== subtype.label) onRename?.(subtype.id, next);
    setIsEditing(false);
  };

  return (
    <div className={styles.subtypeTableNameCell}>
      <span className={styles.subtypeObjectIcon} aria-hidden />
      {isEditing ? (
        <input
          className={styles.subtypeTableInput}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
            if (event.key === 'Escape') {
              setDraft(subtype.label);
              setIsEditing(false);
            }
          }}
          autoFocus
        />
      ) : (
        <button
          type="button"
          className={styles.subtypeTableNameBtn}
          onClick={() => {
            setDraft(subtype.label);
            setIsEditing(true);
          }}
        >
          {subtype.label}
        </button>
      )}
    </div>
  );
}

export default function SubtypeTable({
  objectTypeId,
  subtypeEntries,
  onRenameSubtype,
  onPreviewSubtype,
  onOpenObjectType,
  onOpenTaxonomy,
  onDeleteSubtype,
}) {
  const objectType = getObjectType(objectTypeId);

  return (
    <div className={styles.subtypeTableWrap}>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Object Type</th>
            <th>Derived from</th>
            <th>Rows</th>
            <th>Taxonomy</th>
            <th className={styles.subtypeTableActionsHead} aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {subtypeEntries.map(({ subtype, splitAttributeId, taxonomy }) => {
            const splitAttribute = getAttribute(objectType, splitAttributeId);
            const derivedFrom = splitAttribute
              ? `${splitAttribute.name} = ${subtype.matchingValue}`
              : subtype.matchingValue;

            return (
              <tr key={subtype.id}>
                <td>
                  <SubtypeNameCell subtype={subtype} onRename={onRenameSubtype} />
                </td>
                <td className={styles.subtypeTableMuted}>{derivedFrom}</td>
                <td className={styles.subtypeTableNumeric}>{subtype.recordCount.toLocaleString()}</td>
                <td>
                  {taxonomy ? (
                    <button
                      type="button"
                      className={styles.inlineLinkBtn}
                      onClick={() => onOpenTaxonomy?.(taxonomy.id)}
                    >
                      {taxonomy.name}
                    </button>
                  ) : (
                    <span className={styles.subtypeTableMuted}>—</span>
                  )}
                </td>
                <td className={styles.subtypeTableActionsCell}>
                  <div className={styles.subtypeTableActions}>
                    <button
                      type="button"
                      className={`${styles.subtypeTableIconBtn} ${styles.subtypeTableIconBtnPrimary}`}
                      aria-label={`Open ${subtype.label}`}
                      title="Open Object Type"
                      onClick={() => onOpenObjectType?.(subtype.id)}
                    >
                      <OpenIcon />
                    </button>
                    <button
                      type="button"
                      className={styles.subtypeTableIconBtn}
                      aria-label={`Preview rows for ${subtype.label}`}
                      title="Preview rows"
                      onClick={() => onPreviewSubtype?.(subtype.id)}
                    >
                      <PreviewIcon />
                    </button>
                    <button
                      type="button"
                      className={`${styles.subtypeTableIconBtn} ${styles.subtypeTableIconBtnDanger}`}
                      aria-label={`Delete ${subtype.label}`}
                      title="Delete"
                      onClick={() => onDeleteSubtype?.(subtype.id)}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
