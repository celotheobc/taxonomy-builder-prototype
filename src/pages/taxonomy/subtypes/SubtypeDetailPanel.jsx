import { useState } from 'react';
import { getAttribute, getObjectType } from '../../../data/mockObjectTypes';
import styles from './SubtypesSection.module.css';

export default function SubtypeDetailPanel({
  objectTypeId,
  subtypeEntry,
  onRenameSubtype,
  onUpdateDescription,
  onPreviewSubtype,
  onOpenObjectType,
  onOpenTaxonomy,
  onDeleteSubtype,
  embedded = false,
}) {
  const objectType = getObjectType(objectTypeId);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  if (!subtypeEntry) {
    return (
      <div className={styles.detailEmpty}>
        <p className={styles.detailEmptyTitle}>Select a subtype to manage.</p>
        <p className={styles.detailEmptyCopy}>
          Choose a subtype on the left to edit this object type summary.
        </p>
      </div>
    );
  }

  const { subtype, splitAttributeId, taxonomy } = subtypeEntry;
  const splitAttribute = getAttribute(objectType, splitAttributeId);
  const derivedFrom = splitAttribute
    ? `${splitAttribute.name} = ${subtype.matchingValue}`
    : subtype.matchingValue;

  const startRename = () => {
    setNameDraft(subtype.label);
    setIsEditingName(true);
  };

  const commitRename = () => {
    const next = nameDraft.trim();
    if (next && next !== subtype.label) {
      onRenameSubtype?.(subtype.id, next);
    }
    setIsEditingName(false);
  };

  const panelClass = embedded ? styles.detailPanelEmbedded : styles.detailPanel;

  return (
    <div className={panelClass}>
      <div className={styles.detailBody}>
        <div className={styles.objectSummaryHeader}>
          <span className={styles.subtypeObjectIconLarge} aria-hidden />
          <div>
            <p className={styles.objectSummaryEyebrow}>Object Type</p>
            {isEditingName ? (
              <input
                className={styles.editableInput}
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                onBlur={commitRename}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') commitRename();
                  if (event.key === 'Escape') setIsEditingName(false);
                }}
                autoFocus
              />
            ) : (
              <button type="button" className={styles.objectSummaryTitle} onClick={startRename}>
                {subtype.label}
              </button>
            )}
          </div>
        </div>

        <div className={styles.editableBlock}>
          <label className={styles.editableLabel} htmlFor={`subtype-desc-${subtype.id}`}>
            Description
          </label>
          <textarea
            id={`subtype-desc-${subtype.id}`}
            className={styles.editableTextarea}
            rows={3}
            placeholder="Describe this object type subtype…"
            value={subtype.description ?? ''}
            onChange={(event) => onUpdateDescription?.(subtype.id, event.target.value)}
          />
        </div>

        <dl className={styles.detailMetaCompact}>
          <div className={styles.detailMetaRow}>
            <dt>Derived from</dt>
            <dd>{derivedFrom}</dd>
          </div>
          <div className={styles.detailMetaRow}>
            <dt>Parent object</dt>
            <dd>{objectType.name}</dd>
          </div>
          <div className={styles.detailMetaRow}>
            <dt>Rows</dt>
            <dd>{subtype.recordCount.toLocaleString()}</dd>
          </div>
          <div className={styles.detailMetaRow}>
            <dt>Taxonomy</dt>
            <dd>{taxonomy?.name ?? '—'}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.detailFooter}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => onPreviewSubtype?.(subtype.id)}
        >
          Preview rows
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => onOpenObjectType?.(subtype.id)}
        >
          Open Object Type
        </button>
        {taxonomy && (
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => onOpenTaxonomy?.(taxonomy.id)}
          >
            Open taxonomy
          </button>
        )}
        <button
          type="button"
          className={styles.dangerBtn}
          onClick={() => onDeleteSubtype?.(subtype.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function ManageEmptyState() {
  return (
    <div className={styles.detailEmpty}>
      <p className={styles.detailEmptyTitle}>No subtypes have been created yet.</p>
      <p className={styles.detailEmptyCopy}>
        Create subtypes from an attribute to begin.
      </p>
    </div>
  );
}
