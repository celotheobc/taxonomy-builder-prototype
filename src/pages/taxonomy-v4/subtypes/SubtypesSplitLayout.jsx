import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import styles from './SubtypesSection.module.css';

export default function SubtypesSplitLayout({ left, right, leftWidth, onAdjustLeftWidth }) {
  return (
    <div className={styles.splitLayout}>
      <div className={styles.splitLeft} style={{ width: leftWidth }}>
        {left}
      </div>
      <ResizeHandle
        axis="x"
        onDelta={(delta) => onAdjustLeftWidth(-delta)}
        ariaLabel="Resize attribute and detail panels"
      />
      <div className={styles.splitRight}>{right}</div>
    </div>
  );
}
