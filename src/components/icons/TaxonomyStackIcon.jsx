import { ObjectTypeIcon } from './ContextModelIcons';
import styles from './TaxonomyStackIcon.module.css';

export default function TaxonomyStackIcon({ size = 52, className, title = 'Taxonomy Builder' }) {
  const iconSize = Math.round(size * 0.28);

  return (
    <div
      className={`${styles.root} ${className ?? ''}`}
      style={{ '--stack-size': `${size}px` }}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <span className={styles.srOnly}>{title}</span> : null}
      <div className={`${styles.tile} ${styles.tileBack}`}>
        <ObjectTypeIcon size={iconSize} monochrome />
      </div>
      <div className={`${styles.tile} ${styles.tileMid}`}>
        <ObjectTypeIcon size={iconSize} monochrome />
      </div>
      <div className={`${styles.tile} ${styles.tileFront}`}>
        <ObjectTypeIcon size={iconSize} monochrome />
      </div>
    </div>
  );
}
