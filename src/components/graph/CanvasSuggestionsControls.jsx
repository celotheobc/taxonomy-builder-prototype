import TypeIndicator from '../shared/TypeIndicator';
import styles from './CanvasSuggestionsControls.module.css';

const TYPE_OPTIONS = [
  { id: 'objects', label: 'Objects', kind: 'objects' },
  { id: 'events', label: 'Events', kind: 'events' },
  // Metrics hidden in v3 perspective builder demo — re-enable via hideMetrics={false}
  { id: 'metrics', label: 'Metrics', kind: 'metrics' },
];

/**
 * v3 canvas control — one visibility concept:
 * "Show suggestions" reveals what can be added next on the graph.
 */
export default function CanvasSuggestionsControls({
  showSuggestions,
  onToggleShowSuggestions,
  filters,
  onToggleType,
  disabled,
  hideMetrics = false,
  embedded = false,
  variant = 'default',
}) {
  const typeOptions = hideMetrics
    ? TYPE_OPTIONS.filter((opt) => opt.id !== 'metrics')
    : TYPE_OPTIONS;

  if (variant === 'expansion') {
    return (
      <div
        className={`${styles.expansionBar} ${showSuggestions ? styles.expansionBarExpanded : ''}`}
        role="group"
        aria-label="Graph suggestions"
      >
        <label className={styles.expansionToggle}>
          <span className={styles.expansionToggleText}>Suggestions</span>
          <input
            type="checkbox"
            checked={showSuggestions}
            disabled={disabled}
            onChange={(e) => onToggleShowSuggestions(e.target.checked)}
          />
          <span className={styles.expansionTrack} aria-hidden />
        </label>
        <div className={styles.expansionFilters} aria-hidden={!showSuggestions}>
          <div className={styles.expansionFiltersInner}>
            <div className={styles.expansionTypes} role="group" aria-label="Suggestion types">
              {typeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${filters[opt.id] ? styles.typeOn : styles.typeOff} ${styles.expansionTypeChip}`}
                  aria-pressed={filters[opt.id]}
                  disabled={disabled || !showSuggestions}
                  tabIndex={showSuggestions ? 0 : -1}
                  onClick={() => onToggleType(opt.id)}
                >
                  <TypeIndicator kind={opt.kind} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${embedded ? '' : styles.panel} ${!embedded && hideMetrics ? styles.panelCompact : ''}`}
      role="group"
      aria-label="Graph suggestions"
    >
      <label className={styles.master}>
        <span className={styles.masterText}>Show suggestions</span>
        <input
          type="checkbox"
          checked={showSuggestions}
          disabled={disabled}
          onChange={(e) => onToggleShowSuggestions(e.target.checked)}
        />
        <span className={styles.masterTrack} aria-hidden />
      </label>

      <div
        className={`${styles.typesCollapsible} ${showSuggestions ? styles.typesCollapsibleOpen : ''}`}
        aria-hidden={!showSuggestions}
      >
        <div className={styles.typesInner}>
          <div className={styles.types} role="group" aria-label="Suggestion types">
            {typeOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={filters[opt.id] ? styles.typeOn : styles.typeOff}
                aria-pressed={filters[opt.id]}
                disabled={disabled || !showSuggestions}
                tabIndex={showSuggestions ? 0 : -1}
                onClick={() => onToggleType(opt.id)}
              >
                <TypeIndicator kind={opt.kind} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
