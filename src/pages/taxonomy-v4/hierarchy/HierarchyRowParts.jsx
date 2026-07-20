import { useEffect, useRef, useState } from 'react';
import { getNodeDepth, MAX_HIERARCHY_DEPTH } from '../../../data/taxonomyTreeModel';
import { SplitMetadataInline } from './SplitMetadata';
import styles from './Hierarchy.module.css';

export function formatSplitStatus(group) {
  if (!group) return '';
  const created = `${group.createdCount} created`;
  const available =
    group.availableCount > 0 ? `${group.availableCount} available` : '0 available';
  return `${created} · ${available}`;
}

export function TreeGuides({ levels, ancestorContinues = [], isLast, showConnector = true }) {
  if (levels <= 0) return null;

  return (
    <div className={styles.treeGuides} aria-hidden>
      {Array.from({ length: levels }).map((_, col) => {
        const isConnectorCol = col === levels - 1;
        const showAncestorLine = !isConnectorCol && ancestorContinues[col];

        return (
          <span key={col} className={styles.treeGuideCol}>
            {showAncestorLine ? <span className={styles.treeGuideVert} /> : null}
            {isConnectorCol ? (
              <>
                <span
                  className={`${styles.treeGuideVert} ${isLast ? styles.treeGuideVertHalf : ''}`}
                />
                {showConnector ? <span className={styles.treeGuideHoriz} /> : null}
              </>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

export function ChevronIcon({ open }) {
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

export function SplitHierarchyIcon({ size = 14, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect x="5.5" y="1.5" width="5" height="2.5" rx="0.75" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 4v2.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path
        d="M8 6.25H4.5V9.25M8 6.25h3.5V9.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="2.5" y="9.25" width="4" height="2.75" rx="0.75" stroke="currentColor" strokeWidth="1.25" />
      <rect x="9.5" y="9.25" width="4" height="2.75" rx="0.75" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function SplitIcon() {
  return <SplitHierarchyIcon />;
}

function PreviewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.25 10.25 2.75 2.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="3.5" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="12.5" cy="8" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function RowMoreMenu({ onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  return (
    <div className={styles.moreMenu} ref={ref}>
      <button
        type="button"
        className={styles.rowIconBtn}
        aria-label="More actions"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreIcon />
      </button>
      {open ? (
        <div className={styles.moreMenuPanel} role="menu">
          <button type="button" className={styles.moreMenuItem} role="menuitem" onClick={() => { setOpen(false); onRename(); }}>
            Rename
          </button>
          <div className={styles.moreMenuDivider} role="separator" />
          <button
            type="button"
            className={`${styles.moreMenuItem} ${styles.moreMenuItemDanger}`}
            role="menuitem"
            onClick={() => { setOpen(false); onDelete(); }}
          >
            Delete subtype
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SubtypeRow({
  node,
  allNodes,
  branchDepth,
  ancestorContinues,
  isLast,
  hasChildren,
  isExpanded,
  childCount,
  splitMeta = null,
  metadataVariant = 'two-row',
  hasExistingSplit = false,
  selectedId,
  readOnly,
  renamingNodeId,
  renameDraft,
  onToggleExpand,
  onOpenSubtype,
  onSelectNode,
  onPreviewNode,
  onSplit,
  onEditSplit,
  onRename,
  onDelete,
  onRenameDraftChange,
  onRenameConfirm,
  onRenameCancel,
}) {
  const nodeDepth = getNodeDepth(node.id, allNodes);
  const canSplit = !readOnly && nodeDepth < MAX_HIERARCHY_DEPTH;
  const showInlineMeta = metadataVariant === 'single-row' && splitMeta;
  const showChildCountChip =
    metadataVariant !== 'taxonomy' && childCount > 0 && !hasChildren;
  const splitHandler = hasExistingSplit ? onEditSplit : onSplit;
  const splitLabel = hasExistingSplit ? 'Edit split' : 'Split';

  return (
    <div
      className={`${styles.hierarchyRow} ${!readOnly ? styles.hierarchyRowWithActions : ''} ${selectedId === node.id ? styles.hierarchyRowSelected : ''} ${showInlineMeta ? styles.hierarchyRowInlineMeta : ''}`}
    >
      <TreeGuides levels={branchDepth + 1} ancestorContinues={ancestorContinues} isLast={isLast} />
      <div
        className={styles.hierarchyRowBody}
        data-nested={branchDepth > 0 ? 'true' : undefined}
      >
        {hasChildren ? (
          <button
            type="button"
            className={styles.chevronBtn}
            onClick={() => onToggleExpand(node.id)}
            aria-label={isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
          >
            <ChevronIcon open={isExpanded} />
          </button>
        ) : (
          <span className={styles.chevronBtnPlaceholder} aria-hidden />
        )}

        <div className={styles.subtypeMain}>
          <span className={styles.subtypeIcon} aria-hidden />
          {renamingNodeId === node.id ? (
            <div className={styles.renameActions}>
              <input
                className={styles.renameField}
                value={renameDraft}
                onChange={(event) => onRenameDraftChange?.(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onRenameConfirm?.();
                  if (event.key === 'Escape') onRenameCancel?.();
                }}
                autoFocus
                aria-label={`Rename ${node.label}`}
              />
              <button type="button" className={styles.renameBtn} onClick={onRenameConfirm}>✓</button>
              <button type="button" className={styles.renameBtn} onClick={onRenameCancel}>✕</button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.subtypeLabel}
              onClick={() => {
                if (metadataVariant === 'taxonomy') {
                  onSelectNode?.(node);
                  return;
                }
                if (onOpenSubtype) {
                  onOpenSubtype(node);
                  return;
                }
                if (readOnly && onSelectNode) onSelectNode(node);
              }}
              style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
            >
              {node.label}
            </button>
          )}
          {showInlineMeta ? (
            <SplitMetadataInline {...splitMeta} />
          ) : null}
        </div>

        <div className={styles.rowMetaCol}>
          {showChildCountChip ? (
            <span className={styles.subtypeCountChip}>
              {childCount} subtype{childCount === 1 ? '' : 's'}
            </span>
          ) : null}
          {node.recordCount && metadataVariant !== 'taxonomy' ? (
            <span className={styles.rowCountMeta}>{node.recordCount.toLocaleString()} rows</span>
          ) : null}
        </div>

        {!readOnly ? (
          <div className={styles.rowActions}>
            {canSplit ? (
              <button
                type="button"
                className={styles.rowIconBtn}
                aria-label={`${splitLabel} ${node.label}`}
                onClick={() => splitHandler?.(node)}
              >
                <SplitIcon />
              </button>
            ) : null}
            <button type="button" className={styles.rowIconBtn} aria-label={`Preview data for ${node.label}`} onClick={() => onPreviewNode?.(node)}>
              <PreviewIcon />
            </button>
            <RowMoreMenu onRename={() => onRename(node)} onDelete={() => onDelete(node)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
