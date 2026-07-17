import HierarchyTree from '../../../components/hierarchy/HierarchyTree';
import { formatSubtypeRowStats } from '../subtypes/subtypeRowStats';
import styles from './TaxonomyEditor.module.css';

export default function TaxonomyStructureView({
  subtypes,
  totalRows,
  onPreviewMember,
  onOpenMember,
}) {
  const visibleSubtypes = subtypes.filter((subtype) => !subtype.hidden);

  return (
    <div className={styles.structureView}>
      <p className={styles.structureIntro}>
        Compact hierarchy view using shared tree components. Group organisation remains in the
        Organise presentation.
      </p>
      <HierarchyTree
        nodes={visibleSubtypes}
        renderMeta={(node) => formatSubtypeRowStats(node.recordCount, totalRows)}
        renderActions={(node) => (
          <>
            <button
              type="button"
              className={styles.structureActionBtn}
              onClick={() => onPreviewMember?.(node.id)}
            >
              Preview
            </button>
            <button
              type="button"
              className={styles.structureActionBtn}
              onClick={() => onOpenMember?.(node.id)}
            >
              Open
            </button>
          </>
        )}
      />
    </div>
  );
}
