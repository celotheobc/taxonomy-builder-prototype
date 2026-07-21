import { useEffect, useState } from 'react';
import styles from './SubtypesSection.module.css';
import { formatSubtypeRowStats } from './subtypeRowStats';

const DEFAULT_VISIBLE_LIMIT = 8;

function getValueKey(item) {
  return item.value ?? item.matchingValue ?? item.label;
}

export default function SubtypeDistribution({
  items,
  totalRows: totalRowsOverride,
  label,
  selectable = false,
  selectedValues = null,
  onToggleValue,
  visibleLimit = DEFAULT_VISIBLE_LIMIT,
}) {
  const [showAll, setShowAll] = useState(false);
  const totalRows =
    totalRowsOverride ?? items.reduce((sum, item) => sum + (item.recordCount ?? 0), 0);
  const selectedSet = selectedValues instanceof Set ? selectedValues : new Set(selectedValues ?? []);
  const uniqueTotal = items.length;
  const canExpand = items.length > visibleLimit;
  const visibleItems = showAll || !canExpand ? items : items.slice(0, visibleLimit);
  const hiddenCount = items.length - visibleLimit;
  const showTruncationNote = canExpand && !showAll;

  useEffect(() => {
    setShowAll(false);
  }, [items]);

  return (
    <div className={styles.detailSection}>
      {(label || showTruncationNote) && (
        <div className={styles.detailSectionIntro}>
          {label ? <span className={styles.detailLabel}>{label}</span> : null}
          {showTruncationNote && (
            <span className={styles.detailTruncationNote}>
              Showing {visibleItems.length} of {uniqueTotal.toLocaleString()} subtype options.
            </span>
          )}
        </div>
      )}

      <ul
        className={`${styles.distributionList} ${selectable ? styles.distributionListSelectable : ''}`}
      >
        {visibleItems.map((item) => {
          const valueKey = getValueKey(item);
          const name = item.label ?? item.value;
          const rows = item.recordCount ?? 0;
          const percent = totalRows ? (rows / totalRows) * 100 : 0;
          const isSelected = !selectable || selectedSet.has(valueKey);
          const rowClass = [
            styles.distributionRow,
            selectable ? styles.distributionRowInline : '',
            selectable && !isSelected ? styles.distributionRowUnselected : '',
          ]
            .filter(Boolean)
            .join(' ');

          if (selectable) {
            return (
              <li key={valueKey} className={rowClass}>
                <label className={styles.distributionCheckboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.distributionCheckbox}
                    checked={isSelected}
                    onChange={() => onToggleValue?.(valueKey)}
                  />
                  <span className={styles.distributionName}>{name}</span>
                </label>
                <div className={styles.distributionTrackInline} aria-hidden>
                  <span
                    className={styles.distributionFill}
                    style={{ width: `${percent}%`, opacity: isSelected ? 1 : 0.35 }}
                  />
                </div>
                <span className={styles.distributionStats}>
                  {formatSubtypeRowStats(rows, totalRows)}
                </span>
              </li>
            );
          }

          return (
            <li key={valueKey} className={rowClass}>
              <div className={styles.distributionHeader}>
                <span className={styles.distributionName}>{name}</span>
                <span className={styles.distributionStats}>
                  {formatSubtypeRowStats(rows, totalRows)}
                </span>
              </div>
              <div className={styles.distributionTrack} aria-hidden>
                <span
                  className={styles.distributionFill}
                  style={{ width: `${percent}%`, opacity: isSelected ? 1 : 0.35 }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {canExpand && !showAll && (
        <button type="button" className={styles.showAllBtn} onClick={() => setShowAll(true)}>
          Show more ({hiddenCount})
        </button>
      )}
    </div>
  );
}
