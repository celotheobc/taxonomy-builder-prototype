import { RelationshipIcon } from '../../../components/icons/ContextModelIcons';
import PerspectiveIcon from '../../../components/icons/PerspectiveIcon';
import styles from './PanelEmptyHint.module.css';

const ICONS = {
  perspective: PerspectiveIcon,
  relationship: RelationshipIcon,
};

export default function PanelEmptyHint({ variant = 'perspective', text }) {
  const Icon = ICONS[variant] ?? PerspectiveIcon;
  const iconSize = variant === 'perspective' ? 18 : 16;

  return (
    <div className={styles.hint}>
      <div
        className={`${styles.icon} ${variant === 'relationship' ? styles.iconRelationship : ''}`}
        aria-hidden
      >
        <Icon size={iconSize} />
      </div>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
