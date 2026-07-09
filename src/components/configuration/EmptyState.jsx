import { objects, SUGGESTED_START_OBJECTS } from '../../data/mockData';
import PerspectiveIcon from '../icons/PerspectiveIcon';
import ObjectSearch from './ObjectSearch';
import styles from './EmptyState.module.css';

export default function EmptyState({ onAddObject, centered = false }) {
  const suggested = SUGGESTED_START_OBJECTS.map((id) =>
    objects.find((o) => o.id === id),
  ).filter(Boolean);

  return (
    <div className={`${styles.empty} ${centered ? styles.emptyCentered : ''}`}>
      <div className={styles.icon} aria-hidden>
        <PerspectiveIcon size={28} />
      </div>
      <h3 className={styles.title}>Start by adding an object to this Perspective</h3>
      <p className={styles.subtitle}>
        The graph becomes your primary editing surface. Expand progressively from a
        seed object or search for disconnected types.
      </p>
      <div className={styles.searchBlock}>
        <ObjectSearch onSelect={onAddObject} placeholder="Search object types…" />
      </div>
      <div className={styles.suggested}>
        <span className={styles.suggestedLabel}>Suggested starting objects</span>
        <div className={styles.chips}>
          {suggested.map((obj) => (
            <button
              key={obj.id}
              type="button"
              className={styles.chip}
              onClick={() => onAddObject(obj.id)}
            >
              {obj.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
