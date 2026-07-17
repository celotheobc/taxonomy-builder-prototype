import styles from './ObjectTypeSectionCard.module.css';

export default function ObjectTypeSectionCard({
  title,
  count,
  actions,
  headerAddon,
  children,
  className = '',
}) {
  return (
    <section className={`${styles.card} ${className}`}>
      <header className={styles.header}>
        <h3 className={styles.title}>
          {title}
          {typeof count === 'number' ? <span className={styles.count}>({count})</span> : null}
          {headerAddon ? <span className={styles.headerAddon}>{headerAddon}</span> : null}
        </h3>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}
