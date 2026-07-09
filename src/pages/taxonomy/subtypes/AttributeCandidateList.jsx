import {
  formatUniqueValueCount,
  getAttributeSplitCandidate,
  getDetectedValueCount,
  getObjectType,
} from '../../../data/mockObjectTypes';
import { hasSubtypesForAttribute } from '../context/ObjectTypeWorkspaceContext';
import styles from './SubtypesSection.module.css';

const RECOMMENDATION_CLASS = {
  Recommended: styles.badgeRecommended,
  Caution: styles.badgeCaution,
  'Not recommended': styles.badgeNotRecommended,
};

export default function AttributeCandidateList({
  objectTypeId,
  splitState,
  selectedAttributeId,
  onSelectAttribute,
}) {
  const objectType = getObjectType(objectTypeId);

  return (
    <nav className={styles.navList} aria-label="Attributes for subtype generation">
      <ul className={styles.navItemsFlush}>
        {objectType.attributes.map((attribute) => {
          const candidate = getAttributeSplitCandidate(objectType, attribute.id);
          const badgeClass =
            RECOMMENDATION_CLASS[candidate.recommendation] ?? styles.badgeCaution;
          const isActive = selectedAttributeId === attribute.id;
          const isGenerated = hasSubtypesForAttribute(splitState, attribute.id);
          const uniqueCount = getDetectedValueCount(objectType, attribute.id);

          return (
            <li key={attribute.id}>
              <button
                type="button"
                className={isActive ? styles.attrItemActive : styles.attrItem}
                onClick={() => onSelectAttribute(attribute.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className={styles.attrItemHeader}>
                  <span className={styles.attrItemTitle}>{attribute.name}</span>
                  <span className={`${styles.recommendationBadge} ${badgeClass}`}>
                    {candidate.recommendation}
                  </span>
                </span>
                <span className={styles.attrItemMeta}>{formatUniqueValueCount(uniqueCount)}</span>
                {isGenerated && (
                  <span className={styles.attrItemGenerated}>✓ Subtypes created</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
