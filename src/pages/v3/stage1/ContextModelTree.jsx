import styles from './ContextModelTree.module.css';

const TREE = [
  { label: 'Browse Context Model', active: true },
  { label: 'AI Builder' },
  { label: 'All Events' },
  { label: 'Explore Data' },
  { type: 'header', label: 'Process Intelligence Graph' },
  { label: 'Objects' },
  { label: 'Event Types' },
  { label: 'Relationships' },
  { label: 'Processes', indent: true },
  { label: 'Perspectives' },
  { type: 'header', label: 'Consumption' },
  { label: 'Knowledge Models' },
];

export default function ContextModelTree() {
  return (
    <nav className={styles.tree} aria-label="Context Model navigation">
      <p className={styles.breadcrumb}>Context Models / Order Management</p>
      {TREE.map((item) =>
        item.type === 'header' ? (
          <p key={item.label} className={styles.header}>
            {item.label}
          </p>
        ) : (
          <button
            key={item.label}
            type="button"
            className={`${styles.item} ${item.active ? styles.itemActive : ''} ${item.indent ? styles.indent : ''}`}
          >
            {item.label}
          </button>
        ),
      )}
    </nav>
  );
}
