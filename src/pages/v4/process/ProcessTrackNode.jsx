import { memo, useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ObjectTypeIcon } from '../../../components/icons/ContextModelIcons';
import nodeStyles from '../../../components/graph/PerspectiveNode.module.css';
import styles from './ProcessTrackNode.module.css';

const SIDES = [
  { position: Position.Top, id: 'top' },
  { position: Position.Right, id: 'right' },
  { position: Position.Bottom, id: 'bottom' },
  { position: Position.Left, id: 'left' },
];

function ProcessTrackNodeComponent({ data }) {
  const {
    label,
    basketSelected,
    cmAssetPicker,
    laneColor = '#1b6fd1',
  } = data;

  const [returnHover, setReturnHover] = useState(false);

  useEffect(() => {
    if (!basketSelected) setReturnHover(false);
  }, [basketSelected]);

  return (
    <div
      className={[
        styles.root,
        nodeStyles.object,
        nodeStyles.included,
        nodeStyles.explorerSelectable,
        cmAssetPicker ? nodeStyles.cmAssetPicker : '',
        basketSelected ? nodeStyles.basketSelected : '',
        cmAssetPicker && returnHover ? nodeStyles.returnHover : '',
        basketSelected ? styles.selected : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={label}
      onMouseLeave={cmAssetPicker ? () => basketSelected && setReturnHover(true) : undefined}
    >
      {SIDES.map(({ position, id }) => (
        <span key={id}>
          <Handle type="target" position={position} id={`t-${id}`} className={styles.handle} />
          <Handle type="source" position={position} id={`s-${id}`} className={styles.handle} />
        </span>
      ))}

      <div className={styles.marker} style={{ '--lane-color': laneColor }}>
        <div className={`${styles.markerInner} ${nodeStyles.puckTop}`}>
          {cmAssetPicker ? (
            <>
              <span className={nodeStyles.cmPickerIcon} aria-hidden>
                <ObjectTypeIcon size={16} monochrome className={styles.iconSvg} />
              </span>
              <span className={`${nodeStyles.cmPickerPlus} ${nodeStyles.cmPickerRaised}`} aria-hidden>
                +
              </span>
              <span className={nodeStyles.cmPickerCheck} aria-hidden>
                ✓
              </span>
              <span className={`${nodeStyles.cmPickerMinus} ${nodeStyles.cmPickerRaised}`} aria-hidden>
                −
              </span>
            </>
          ) : (
            <ObjectTypeIcon size={16} monochrome className={styles.iconSvg} />
          )}
        </div>
      </div>

      <div className={styles.label}>
        <span className={styles.labelText}>{label}</span>
      </div>
    </div>
  );
}

export default memo(ProcessTrackNodeComponent);
