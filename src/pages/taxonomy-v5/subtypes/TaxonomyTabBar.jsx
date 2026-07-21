import { getAttribute, getObjectType } from '../../../data/mockObjectTypes';
import styles from './SubtypesSection.module.css';

function countVisibleSubtypes(split) {
  return split?.subtypes?.filter((subtype) => !subtype.hidden).length ?? 0;
}

export default function TaxonomyTabBar({
  objectTypeId,
  splits,
  activeAttributeId,
  onSelect,
  onAdd,
}) {
  const objectType = getObjectType(objectTypeId);

  return (
    <div className={styles.taxonomyTabs} role="tablist" aria-label="Taxonomies for this object">
      {splits.map(({ attributeId, split }) => {
        const attribute = getAttribute(objectType, attributeId);
        const count = countVisibleSubtypes(split);
        const isActive = activeAttributeId === attributeId;

        return (
          <button
            key={attributeId}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={isActive ? styles.taxonomyTabActive : styles.taxonomyTab}
            onClick={() => onSelect(attributeId)}
          >
            {attribute?.name ?? attributeId}
            <span className={styles.taxonomyTabCount}>({count})</span>
          </button>
        );
      })}
      <button
        type="button"
        className={styles.taxonomyTabAdd}
        onClick={onAdd}
        aria-label="Create another taxonomy from a different attribute"
        title="Add taxonomy"
      >
        +
      </button>
    </div>
  );
}
