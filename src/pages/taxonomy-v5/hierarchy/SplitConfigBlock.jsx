import { TreeGuides } from './HierarchyRowParts';
import { buildSplitMetadataProps, SplitMetadataTwoRow } from './SplitMetadata';
import styles from './Hierarchy.module.css';

export default function SplitConfigBlock({
  group,
  objectType,
  parentLabel,
  branchDepth,
  ancestorContinues,
  isLastInBranch,
  readOnly,
  taxonomyId,
  taxonomyName,
  onAddValues,
  onOpenTaxonomy,
}) {
  const meta = buildSplitMetadataProps({
    group,
    objectType,
    parentLabel,
    taxonomyId,
    taxonomyName: taxonomyName ?? undefined,
    readOnly,
    onAddValues,
    onOpenTaxonomy,
  });

  if (!meta) return null;

  const { attributeName, ...trailingProps } = meta;

  return (
    <div role="none" className={styles.splitConfigItem}>
      <div className={styles.splitConfigRow}>
        <TreeGuides
          levels={branchDepth + 1}
          ancestorContinues={ancestorContinues}
          isLast={isLastInBranch}
          showConnector={false}
        />
        <div className={`${styles.splitConfigBody} ${styles.splitMetaTwoRowBody}`}>
          <span className={styles.chevronBtnPlaceholder} aria-hidden />
          <SplitMetadataTwoRow
            attributeName={attributeName}
            indentSplitLabel
            {...trailingProps}
          />
        </div>
      </div>
    </div>
  );
}
