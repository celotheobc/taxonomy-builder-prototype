import { useMemo, useState } from 'react';
import {
  formatSubtypeOptionCount,
  getAttributeSplitCandidate,
  getDetectedValueCount,
  getObjectType,
} from '../../../data/mockObjectTypes';
import {
  getSubtypeCountForAttribute,
} from '../context/ObjectTypeWorkspaceContext';
import cardStyles from '../sections/ObjectTypeSectionCard.module.css';
import styles from './SubtypesSection.module.css';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'name', label: 'Name' },
  { value: 'object-order', label: 'Object order' },
];

const RECOMMENDATION_CLASS = {
  Recommended: styles.badgeRecommended,
  'Not recommended': styles.badgeNotRecommended,
};

const RECOMMENDATION_RANK = {
  Recommended: 0,
  Caution: 1,
  'Not recommended': 2,
};

function sortAttributes(attributes, objectType, sortBy) {
  const withIndex = attributes.map((attribute, index) => ({ attribute, index }));

  if (sortBy === 'name') {
    return [...withIndex]
      .sort((a, b) => a.attribute.name.localeCompare(b.attribute.name))
      .map((item) => item.attribute);
  }

  if (sortBy === 'object-order') {
    return attributes;
  }

  return [...withIndex]
    .sort((a, b) => {
      const rankA =
        RECOMMENDATION_RANK[getAttributeSplitCandidate(objectType, a.attribute.id).recommendation] ??
        1;
      const rankB =
        RECOMMENDATION_RANK[getAttributeSplitCandidate(objectType, b.attribute.id).recommendation] ??
        1;
      if (rankA !== rankB) return rankA - rankB;
      return a.index - b.index;
    })
    .map((item) => item.attribute);
}

export default function AttributeCandidateList({
  objectTypeId,
  splitState,
  selectedAttributeId,
  onSelectAttribute,
}) {
  const [sortBy, setSortBy] = useState('recommended');
  const objectType = getObjectType(objectTypeId);
  const sortedAttributes = useMemo(
    () => sortAttributes(objectType.attributes, objectType, sortBy),
    [objectType, sortBy],
  );

  return (
    <div className={styles.splitColumn}>
      <div className={styles.splitColumnHeader}>
        <h3 className={styles.splitColumnTitle}>Attributes ({objectType.attributes.length})</h3>
        <label className={styles.attrSortControl}>
          <span className={styles.attrSortLabel}>Sort by</span>
          <select
            className={styles.attrSortSelect}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort attributes"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.splitColumnBody}>
        <nav className={styles.navList} aria-label="Attributes for subtype generation">
          <ul className={styles.navItemsFlush}>
            {sortedAttributes.map((attribute) => {
              const candidate = getAttributeSplitCandidate(objectType, attribute.id);
              const badgeClass = RECOMMENDATION_CLASS[candidate.recommendation];
              const showBadge =
                candidate.recommendation !== 'Caution' && Boolean(badgeClass);
              const isActive = selectedAttributeId === attribute.id;
              const subtypeCount = getSubtypeCountForAttribute(splitState, attribute.id);
              const uniqueCount = getDetectedValueCount(objectType, attribute.id);
              const showRecommendationBadge = showBadge && subtypeCount === 0;

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
                      {subtypeCount > 0 ? (
                        <span className={`${cardStyles.badgeSubtypes} ${styles.attrSubtypeBadge}`}>
                          {subtypeCount} subtype{subtypeCount === 1 ? '' : 's'}
                        </span>
                      ) : showRecommendationBadge ? (
                        <span className={`${styles.recommendationBadge} ${badgeClass}`}>
                          {candidate.recommendation}
                        </span>
                      ) : null}
                    </span>
                    <span className={styles.attrItemMeta}>{formatSubtypeOptionCount(uniqueCount)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
