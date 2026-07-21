import { useEffect, useState } from 'react';
import { getAttribute, getObjectType } from '../../../data/mockObjectTypes';
import {
  getDirectChildCount,
  getNodeDepth,
} from '../../../data/taxonomyTreeModel';
import styles from './Hierarchy.module.css';

export default function TaxonomyNodeDetailPanel({
  objectTypeId,
  node,
  allNodes = [],
  parentLabel,
  onRename,
  onUpdateDescription,
  onPreview,
  onOpenSubtype,
}) {
  const objectType = getObjectType(objectTypeId);
  const [description, setDescription] = useState(node?.description ?? '');
  const [renameDraft, setRenameDraft] = useState(node?.label ?? '');
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    setDescription(node?.description ?? '');
    setRenameDraft(node?.label ?? '');
    setIsRenaming(false);
  }, [node?.id, node?.description, node?.label]);

  if (!node) {
    return (
      <div className={styles.nodeDetailEmpty}>
        <p>Select a subtype in the hierarchy to inspect its details.</p>
      </div>
    );
  }

  const attribute = getAttribute(objectType, node.createdByAttributeId);
  const depth = getNodeDepth(node.id, allNodes);
  const childCount = getDirectChildCount(node.id, allNodes);

  const handleRenameConfirm = () => {
    const trimmed = renameDraft.trim();
    if (trimmed && trimmed !== node.label) onRename?.(node.id, trimmed);
    setIsRenaming(false);
  };

  return (
    <div className={styles.nodeDetail}>
      <header className={styles.nodeDetailHeader}>
        {isRenaming ? (
          <div className={styles.renameActions}>
            <input
              className={styles.renameField}
              value={renameDraft}
              onChange={(event) => setRenameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleRenameConfirm();
                if (event.key === 'Escape') setIsRenaming(false);
              }}
              autoFocus
              aria-label="Rename subtype"
            />
            <button type="button" className={styles.renameBtn} onClick={handleRenameConfirm}>
              ✓
            </button>
            <button type="button" className={styles.renameBtn} onClick={() => setIsRenaming(false)}>
              ✕
            </button>
          </div>
        ) : (
          <>
            <h2 className={styles.nodeDetailTitle}>{node.label}</h2>
            <button type="button" className={styles.rowAction} onClick={() => setIsRenaming(true)}>
              Rename
            </button>
          </>
        )}
      </header>

      <dl className={styles.nodeDetailMeta}>
        <div className={styles.nodeDetailRow}>
          <dt>Parent subtype</dt>
          <dd>{parentLabel}</dd>
        </div>
        <div className={styles.nodeDetailRow}>
          <dt>Derived from</dt>
          <dd>
            {attribute?.name ?? 'Attribute'} = {node.matchingValue ?? node.label}
          </dd>
        </div>
        <div className={styles.nodeDetailRow}>
          <dt>Row count</dt>
          <dd>{node.recordCount?.toLocaleString() ?? '0'}</dd>
        </div>
        <div className={styles.nodeDetailRow}>
          <dt>Depth</dt>
          <dd>Level {depth}</dd>
        </div>
        {childCount > 0 ? (
          <div className={styles.nodeDetailRow}>
            <dt>Child subtypes</dt>
            <dd>
              {childCount} subtype{childCount === 1 ? '' : 's'}
            </dd>
          </div>
        ) : null}
      </dl>

      <label className={styles.nodeDetailLabel} htmlFor={`taxonomy-node-desc-${node.id}`}>
        Description
      </label>
      <textarea
        id={`taxonomy-node-desc-${node.id}`}
        className={styles.nodeDetailTextarea}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        onBlur={() => {
          if (description !== node.description) onUpdateDescription?.(node.id, description);
        }}
        rows={3}
        placeholder="Add a short description for this subtype"
      />

      <div className={styles.nodeDetailActions}>
        <button type="button" className={styles.secondaryBtn} onClick={() => onPreview?.(node.id)}>
          Preview data
        </button>
        <button type="button" className={styles.primaryBtn} onClick={() => onOpenSubtype?.(node.id)}>
          Open subtype asset
        </button>
      </div>
    </div>
  );
}
