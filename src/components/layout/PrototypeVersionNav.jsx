import styles from './PrototypeVersionNav.module.css';

const VERSIONS = [
  { id: 'cover', short: '⌂', title: 'Prototype cover' },
  { id: 'v1', short: 'v1', title: 'Graph-first prototype' },
  { id: 'v2', short: 'v2', title: 'Asset layout exploration' },
  { id: 'v3', short: 'v3', title: 'Create from Context Model' },
  { id: 'v4', short: 'v4', title: 'Create Perspective from Process' },
  { id: 'v5', short: 'v5', title: 'Panel rebalance + process start' },
  { id: 'v6', short: 'v6', title: 'Inventory placement experiment' },
  { id: 'v7', short: 'v7', title: 'Cycle resolution consequences preview' },
];

export default function PrototypeVersionPicker({ version, onVersionChange }) {
  return (
    <div className={styles.picker} role="group" aria-label="Prototype version">
      {VERSIONS.map((v) => (
        <button
          key={v.id}
          type="button"
          className={version === v.id ? styles.pickerActive : styles.pickerBtn}
          aria-current={version === v.id ? 'true' : undefined}
          aria-label={`Perspective Builder ${v.short} — ${v.title}`}
          title={`${v.short} — ${v.title}`}
          onClick={() => onVersionChange(v.id)}
        >
          {v.short}
        </button>
      ))}
    </div>
  );
}
