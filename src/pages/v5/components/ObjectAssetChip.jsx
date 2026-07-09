import { ObjectTypeIcon } from '../../../components/icons/ContextModelIcons';
import styles from './ObjectAssetChip.module.css';

export default function ObjectAssetChip({ children }) {
  return (
    <span className={styles.root}>
      <span className={styles.icon} aria-hidden>
        <ObjectTypeIcon size={12} />
      </span>
      <span className={styles.label}>{children}</span>
    </span>
  );
}
