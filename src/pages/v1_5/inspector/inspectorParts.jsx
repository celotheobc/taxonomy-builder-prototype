import styles from './inspector.module.css';

export function InspectorSection({ title, children }) {
  return (
    <section className={styles.section}>
      {title && <h3 className={styles.sectionTitle}>{title}</h3>}
      {children}
    </section>
  );
}

export function InspectorRow({ label, children }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{children}</span>
    </div>
  );
}

export function InspectorActions({ children }) {
  return <div className={styles.actions}>{children}</div>;
}

export function InspectorButton({ children, onClick, variant = 'default' }) {
  return (
    <button
      type="button"
      className={variant === 'danger' ? styles.btnDanger : styles.btn}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function InspectorList({ items, empty = 'None' }) {
  if (!items?.length) {
    return <p className={styles.muted}>{empty}</p>;
  }
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
