import { CONNECTION_PATH_COPY } from '../../utils/connectionPathCopy';
import styles from './GraphConnectionOverlay.module.css';

export default function GraphConnectionOverlay({ pathCount, objectName }) {
  if (!pathCount || !objectName) return null;

  return (
    <div className={styles.overlay} role="region" aria-label="Connection choice">
      <div className={styles.alert}>
        <span className={styles.alertIcon} aria-hidden>
          +
        </span>
        <div className={styles.alertText}>
          <strong>{CONNECTION_PATH_COPY.canvasTitle(pathCount, objectName)}</strong>
          <p>{CONNECTION_PATH_COPY.canvasMessage}</p>
        </div>
      </div>
    </div>
  );
}
