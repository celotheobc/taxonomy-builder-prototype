import { CYCLE_RESOLUTION_COPY } from '../../utils/cycleResolutionCopy';
import styles from './GraphCycleOverlay.module.css';

export default function GraphCycleOverlay() {
  return (
    <div className={styles.overlay} role="region" aria-label="Cycle resolution">
      <div className={styles.alert}>
        <span className={styles.alertIcon} aria-hidden>
          ⚠
        </span>
        <div className={styles.alertText}>
          <strong>{CYCLE_RESOLUTION_COPY.title}</strong>
          <p>{CYCLE_RESOLUTION_COPY.canvasMessage}</p>
        </div>
      </div>
    </div>
  );
}
