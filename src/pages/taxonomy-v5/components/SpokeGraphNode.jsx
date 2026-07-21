import { ContextModelIcon } from '../../../components/icons/ContextModelIcons';
import nodeStyles from '../../../components/graph/PerspectiveNode.module.css';
import styles from './SpokeGraphNode.module.css';

export default function SpokeGraphNode({ label, kind = 'object', hub = false }) {
  const kindClass =
    kind === 'event' ? nodeStyles.event : kind === 'metric' ? nodeStyles.metric : nodeStyles.object;

  return (
    <div
      className={`${nodeStyles.root} ${kindClass} ${nodeStyles.included} ${hub ? nodeStyles.hub : ''} ${styles.readOnly}`}
      aria-label={label}
    >
      <div className={nodeStyles.floorShadow} aria-hidden />
      <div className={nodeStyles.nodeContent}>
        <div className={nodeStyles.puck}>
          <div className={nodeStyles.puckTop}>
            <span className={nodeStyles.nodeTypeIcon}>
              <ContextModelIcon kind={kind === 'event' ? 'eventSource' : 'object'} size={18} monochrome />
            </span>
          </div>
          <div className={nodeStyles.puckSide} aria-hidden />
        </div>
        <div className={nodeStyles.label}>
          <span className={nodeStyles.labelText}>{label}</span>
        </div>
      </div>
    </div>
  );
}
