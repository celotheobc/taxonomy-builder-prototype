import styles from './HierarchyTreeRow.module.css';

function ChevronIcon({ open }) {
  return (
    <svg
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M4.5 2.5 8.5 6 4.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HierarchyTreeRow({
  node,
  depth = 0,
  hasChildren = false,
  isExpanded = false,
  isSelected = false,
  onToggle,
  onSelect,
  meta,
  actions,
  ariaLabel,
}) {
  const paddingLeft = 12 + depth * 16;

  return (
    <div
      className={`${styles.row} ${styles.nested} ${isSelected ? styles.rowSelected : ''}`}
      style={{ paddingLeft }}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
    >
      {hasChildren ? (
        <button
          type="button"
          className={styles.toggle}
          onClick={onToggle}
          aria-label={isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
        >
          <ChevronIcon open={isExpanded} />
        </button>
      ) : (
        <span className={styles.togglePlaceholder} aria-hidden />
      )}

      <button
        type="button"
        className={styles.main}
        onClick={onSelect}
        aria-label={ariaLabel ?? node.label}
      >
        <span className={styles.label}>{node.label}</span>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </button>

      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
