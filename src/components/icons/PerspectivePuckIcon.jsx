import { PerspectiveHierarchyIcon } from './ContextModelIcons';
import styles from './PerspectivePuckIcon.module.css';

export default function PerspectivePuckIcon({ size = 56, className, title = 'Perspective' }) {
  const iconSize = Math.round(size * 0.5);

  return (
    <div
      className={`${styles.root} ${className ?? ''}`}
      style={{ '--puck-size': `${size}px` }}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <span className={styles.srOnly}>{title}</span> : null}
      <div className={styles.shadow} />
      <div className={styles.puck}>
        <div className={styles.puckTop}>
          <PerspectiveHierarchyIcon size={iconSize} className={styles.icon} />
        </div>
        <div className={styles.puckSide} />
      </div>
    </div>
  );
}
