import styles from './RightInspector.module.css';

export function MetaRows({ rows }) {
  return (
    <ul className={styles.metaRows}>
      {rows.map((row) => (
        <li key={row.label} className={styles.metaRow}>
          <span className={styles.metaLabel}>{row.label}</span>
          <span className={`${styles.metaValue} ${row.valueClass ?? ''}`}>{row.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function TextBlock({ title, children, empty = false }) {
  return (
    <div className={styles.textBlock}>
      <div className={styles.textBlockHeader}>
        <h3 className={styles.textBlockTitle}>{title}</h3>
        <span className={styles.editIcon} aria-hidden>
          ✎
        </span>
      </div>
      {empty ? (
        <p className={styles.textBlockEmpty}>—</p>
      ) : (
        <p className={styles.textBlockBody}>{children}</p>
      )}
    </div>
  );
}

export function SettingsActions({ children }) {
  return <div className={styles.settingsActions}>{children}</div>;
}

export function SettingsActionButton({ children, onClick, variant = 'default' }) {
  return (
    <button
      type="button"
      className={variant === 'danger' ? styles.settingsBtnDanger : styles.settingsBtn}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
