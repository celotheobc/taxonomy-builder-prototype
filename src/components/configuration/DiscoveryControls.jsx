import TypeIndicator from '../shared/TypeIndicator';
import styles from './DiscoveryControls.module.css';

const OPTIONS = [
  { id: 'objects', label: 'Objects', kind: 'objects' },
  { id: 'events', label: 'Events', kind: 'events' },
  // Metrics hidden in v3 perspective builder demo — re-enable via hideMetrics={false}
  { id: 'metrics', label: 'Metrics', kind: 'metrics' },
];

export default function DiscoveryControls({
  filters,
  onToggle,
  disabled,
  floating = false,
  hideMetrics = false,
}) {
  const options = hideMetrics ? OPTIONS.filter((opt) => opt.id !== 'metrics') : OPTIONS;

  return (
    <div
      className={`${styles.bar} ${floating ? styles.floating : ''}`}
      role="group"
      aria-label="Discover on graph"
    >
      <span className={styles.label}>Discover</span>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={filters[opt.id] ? styles.on : styles.off}
          aria-pressed={filters[opt.id]}
          disabled={disabled}
          onClick={() => onToggle(opt.id)}
        >
          <TypeIndicator kind={opt.kind} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
