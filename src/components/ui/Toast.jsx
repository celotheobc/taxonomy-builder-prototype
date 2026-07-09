import styles from './Toast.module.css';

export default function Toast({ toast }) {
  if (!toast) return null;

  const { message, undo } =
    typeof toast === 'string' ? { message: toast, undo: null } : toast;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.message}>{message}</span>
      {undo && (
        <button type="button" className={styles.action} onClick={undo}>
          Undo
        </button>
      )}
    </div>
  );
}
