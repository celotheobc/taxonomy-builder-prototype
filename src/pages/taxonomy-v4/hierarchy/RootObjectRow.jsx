import { SplitHierarchyIcon } from './HierarchyRowParts';
import { SplitMetadataInline, SplitMetadataTwoRow } from './SplitMetadata';
import styles from './Hierarchy.module.css';

export function RootObjectRow({
  objectTypeName,
  splitMeta,
  metadataVariant,
  hasSplit,
  readOnly,
  onEditSplit,
}) {
  const showActions = !readOnly && hasSplit;

  if (metadataVariant === 'single-row' && splitMeta) {
    return (
      <div
        className={`${styles.hierarchyRootRowInline} ${showActions ? styles.hierarchyRootRowWithActions : ''}`}
      >
        <span className={styles.hierarchyRootName}>{objectTypeName}</span>
        <SplitMetadataInline {...splitMeta} />
        {showActions ? (
          <div className={styles.rootRowActions}>
            <button
              type="button"
              className={styles.rowIconBtn}
              aria-label="Edit split"
              onClick={onEditSplit}
            >
              <SplitHierarchyIcon />
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`${styles.hierarchyRootRow} ${showActions ? styles.hierarchyRootRowWithActions : ''}`}>
      <div className={styles.hierarchyRoot}>{objectTypeName}</div>
      {showActions ? (
        <div className={styles.rootRowActions}>
          <button type="button" className={styles.rowIconBtn} aria-label="Edit split" onClick={onEditSplit}>
            <SplitHierarchyIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function RootSplitMetaRow({ splitMeta, metadataVariant }) {
  if (!splitMeta || metadataVariant !== 'two-row') return null;
  const { attributeName, ...trailingProps } = splitMeta;
  return (
    <div className={`${styles.rootSplitMetaRow} ${styles.splitMetaTwoRow}`}>
      <SplitMetadataTwoRow attributeName={attributeName} {...trailingProps} />
    </div>
  );
}
