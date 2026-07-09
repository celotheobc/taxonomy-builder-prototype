import { getContextEntityDetail } from './contextModelDetail';
import ContextModelDetailIcon from './ContextModelDetailIcon';
import styles from './ContextModelDetailPanel.module.css';

export default function ContextModelDetailPanel({
  kind,
  entityId,
  inPerspective,
  onClose,
  onAddToPerspective,
}) {
  const detail = getContextEntityDetail(kind, entityId);

  return (
    <aside className={styles.panel} aria-label={`${detail.name} details`}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>{detail.name}</h2>
          <p className={styles.technical}>{detail.technicalName}</p>
        </div>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ×
        </button>
      </header>

      <div className={styles.hero}>
        <ContextModelDetailIcon kind={kind} />
        <p className={styles.description}>{detail.description}</p>
      </div>

      <div className={styles.badges}>
        {detail.badges.map((badge) => (
          <span key={badge} className={styles.badge}>
            {badge}
          </span>
        ))}
      </div>

      {detail.relationships.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Relationships</h3>
          <ul className={styles.relList}>
            {detail.relationships.slice(0, 6).map((rel) => (
              <li key={rel.id} className={styles.relItem}>
                <span className={styles.relDir}>{rel.direction === 'outbound' ? '→' : '←'}</span>
                <span className={styles.relLabel}>{rel.label}</span>
                <span className={styles.relTarget}>{rel.otherName}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className={styles.footer}>
        <button
          type="button"
          className={inPerspective ? styles.addedBtn : styles.addBtn}
          onClick={() => onAddToPerspective?.(kind, entityId)}
        >
          {inPerspective ? 'Added to perspective' : 'Add to perspective'}
        </button>
      </footer>
    </aside>
  );
}
