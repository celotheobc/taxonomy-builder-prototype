import { getAttribute, getObjectType } from '../../../data/mockObjectTypes';
import { useObjectTypeWorkspace } from '../context/ObjectTypeWorkspaceContext';
import styles from './ObjectTypePageHeader.module.css';

export default function ObjectTypePageHeader({
  objectTypeId,
  subtypeEntry = null,
  onOpenTaxonomy,
  onNavigateToParent,
}) {
  const objectType = getObjectType(objectTypeId);
  const { getSplitState, getAllSubtypeEntries } = useObjectTypeWorkspace();
  const subtypeEntries = getAllSubtypeEntries(getSplitState(objectTypeId));
  const taxonomies = subtypeEntry?.taxonomy
    ? [subtypeEntry.taxonomy]
    : subtypeEntries
        .map((entry) => entry.taxonomy)
        .filter(
          (taxonomy, index, list) =>
            taxonomy && list.findIndex((item) => item?.id === taxonomy.id) === index,
        );

  const splitAttribute = subtypeEntry
    ? getAttribute(objectType, subtypeEntry.splitAttributeId)
    : null;
  const displayName = subtypeEntry?.subtype.label ?? objectType.name;

  return (
    <header className={styles.header}>
      <div>
        {subtypeEntry && <p className={styles.eyebrow}>Object Type · Subtype</p>}
        <h1 className={styles.title}>{displayName}</h1>
        {subtypeEntry ? (
          <p className={styles.subtitle}>
            Subtype of{' '}
            <button type="button" className={styles.parentLink} onClick={onNavigateToParent}>
              {objectType.name}
            </button>
            {splitAttribute && (
              <>
                {' '}
                · derived from {splitAttribute.name} = {subtypeEntry.subtype.matchingValue}
              </>
            )}
          </p>
        ) : null}
        {taxonomies.length > 0 && (
          <div className={styles.linkedAssets}>
            {taxonomies.map((taxonomy) => (
              <button
                key={taxonomy.id}
                type="button"
                className={styles.taxonomyLink}
                onClick={() => onOpenTaxonomy?.(taxonomy.id)}
              >
                Taxonomy: {taxonomy.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={styles.actions} aria-label="Page actions">
        <button type="button" className={styles.iconBtn} aria-label="History">
          ⟲
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Settings">
          ⚙
        </button>
        <button type="button" className={styles.saveBtn}>
          Save
        </button>
        <button type="button" className={styles.iconBtn} aria-label="View">
          ◫
        </button>
        <span className={styles.statusBadge}>{objectType.metadata.status}</span>
      </div>
    </header>
  );
}
