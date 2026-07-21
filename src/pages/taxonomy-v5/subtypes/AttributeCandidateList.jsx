import { useMemo, useRef, useState } from 'react';
import {
  formatSubtypeOptionCount,
  getAttributeRecommendationBullets,
  getAttributeSplitCandidate,
  getDetectedValueCount,
  getObjectType,
} from '../../../data/mockObjectTypes';
import {
  getSubtypeCountForAttribute,
  getUsedAttributeIds,
} from '../context/ObjectTypeWorkspaceContext';
import RecommendationPopover from './RecommendationPopover';
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
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const chipRefs = useRef({});
  const objectType = getObjectType(objectTypeId);
  const usedAttributeIds = useMemo(() => new Set(getUsedAttributeIds(splitState)), [splitState]);
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
              const isUsed = usedAttributeIds.has(attribute.id);
              const bullets = getAttributeRecommendationBullets(objectType, attribute.id);
              const popoverTitle =
                candidate.recommendation === 'Recommended'
                  ? 'Recommended because:'
                  : candidate.recommendation === 'Not recommended'
                    ? 'Not recommended because:'
                    : 'Guidance:';

              return (
                <li key={attribute.id}>
                  <button
                    type="button"
                    className={isActive ? styles.attrRowActive : styles.attrRow}
                    onClick={() => onSelectAttribute(attribute.id)}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className={styles.attrRowName}>{attribute.name}</span>
                    <span className={styles.attrRowChipCell}>
                      {isUsed ? (
                        <span className={styles.attrRowUsed}>Already used</span>
                      ) : showBadge ? (
                        <span className={styles.attrRowChipWrap}>
                          <button
                            type="button"
                            ref={(node) => {
                              chipRefs.current[attribute.id] = node;
                            }}
                            className={`${styles.recommendationBadge} ${styles.recommendationBadgeBtn} ${badgeClass}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenPopoverId((prev) =>
                                prev === attribute.id ? null : attribute.id,
                              );
                            }}
                            aria-expanded={openPopoverId === attribute.id}
                            aria-label={`${candidate.recommendation} guidance for ${attribute.name}`}
                          >
                            {candidate.recommendation}
                          </button>
                          <RecommendationPopover
                            open={openPopoverId === attribute.id}
                            title={popoverTitle}
                            bullets={bullets}
                            anchorRef={{ current: chipRefs.current[attribute.id] }}
                            onClose={() => setOpenPopoverId(null)}
                          />
                        </span>
                      ) : (
                        <span className={styles.attrRowChipPlaceholder} aria-hidden />
                      )}
                    </span>
                    <span className={styles.attrRowValues}>{formatSubtypeOptionCount(uniqueCount)}</span>
                    <span className={styles.attrRowGenerated}>
                      {subtypeCount > 0 ? `${subtypeCount} subtype${subtypeCount === 1 ? '' : 's'}` : ''}
                    </span>
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
