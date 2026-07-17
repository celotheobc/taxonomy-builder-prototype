import { useMemo } from 'react';
import HierarchyTree from '../../../components/hierarchy/HierarchyTree';
import TaxonomyStackIcon from '../../../components/icons/TaxonomyStackIcon';
import { getAttribute, getObjectType } from '../../../data/mockObjectTypes';
import { OpenIcon, PreviewIcon } from './SubtypeRowIcons';
import { ManageEmptyState } from './SubtypeDetailPanel';
import { formatSubtypeRowStats } from './subtypeRowStats';
import styles from './SubtypesSection.module.css';

export default function SubtypesManagementMode({
  objectTypeId,
  subtypeEntries,
  activeAttributeId,
  onRenameSubtype,
  onPreviewSubtype,
  onOpenObjectType,
  onOpenTaxonomy,
  onDeleteSubtype,
}) {
  const objectType = getObjectType(objectTypeId);
  const filteredEntries = useMemo(() => {
    if (!activeAttributeId) return subtypeEntries;
    return subtypeEntries.filter((entry) => entry.splitAttributeId === activeAttributeId);
  }, [subtypeEntries, activeAttributeId]);

  const treeNodes = useMemo(
    () => filteredEntries.map((entry) => entry.subtype),
    [filteredEntries],
  );

  const taxonomy = filteredEntries[0]?.taxonomy ?? null;
  const splitAttribute = activeAttributeId
    ? getAttribute(objectType, activeAttributeId)
    : null;
  const totalRows = treeNodes.reduce((sum, node) => sum + (node.recordCount ?? 0), 0);

  if (!subtypeEntries.length) {
    return (
      <div className={styles.manageEmptyShell}>
        <ManageEmptyState />
      </div>
    );
  }

  return (
    <div className={styles.subtypeTreeShell}>
      {taxonomy ? (
        <div className={styles.managementTaxonomyRow}>
          <span className={styles.detailTaxonomyLabel}>Linked taxonomy:</span>
          <TaxonomyStackIcon size={20} title="" />
          <button
            type="button"
            className={styles.detailTaxonomyNameLink}
            onClick={() => onOpenTaxonomy?.(taxonomy.id)}
          >
            {taxonomy.name}
          </button>
        </div>
      ) : null}

      {splitAttribute ? (
        <p className={styles.managementIntro}>
          Specialisation hierarchy for <strong>{splitAttribute.name}</strong> — expand nodes to
          explore nested subtypes.
        </p>
      ) : null}

      <HierarchyTree
        nodes={treeNodes}
        renderMeta={(node) => formatSubtypeRowStats(node.recordCount, totalRows)}
        renderActions={(node) => (
          <>
            <button
              type="button"
              className={styles.subtypeTableIconBtn}
              aria-label={`Preview data for ${node.label}`}
              title="Preview Data"
              onClick={() => onPreviewSubtype?.(node.id)}
            >
              <PreviewIcon />
            </button>
            <button
              type="button"
              className={`${styles.subtypeTableIconBtn} ${styles.subtypeTableIconBtnPrimary}`}
              aria-label={`Open ${node.label}`}
              title="Open subtype"
              onClick={() => onOpenObjectType?.(node.id)}
            >
              <OpenIcon />
            </button>
          </>
        )}
        emptyMessage="No subtypes in this taxonomy yet."
      />
    </div>
  );
}
