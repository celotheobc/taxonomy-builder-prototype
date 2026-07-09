import { getDecorativeGhosts } from '../../data/graphLayout';
import styles from './MakeGridBackdrop.module.css';

export default function MakeGridBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden>
      {getDecorativeGhosts().map((g) => (
        <div
          key={g.id}
          className={styles.ghost}
          style={{ left: g.x, top: g.y }}
        >
          <div className={styles.ghostPedestal} />
          <div className={styles.ghostFlat} />
          <span className={styles.ghostLabel}>{g.label}</span>
        </div>
      ))}
    </div>
  );
}
