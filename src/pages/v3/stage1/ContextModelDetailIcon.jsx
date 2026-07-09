import { ContextModelIcon } from '../../../components/icons/ContextModelIcons';
import styles from './ContextModelDetailPanel.module.css';

export default function ContextModelDetailIcon({ kind }) {
  const kindClass =
    kind === 'event'
      ? styles.heroEvent
      : kind === 'process'
        ? styles.heroProcess
        : kind === 'relationship'
          ? styles.heroRelationship
          : styles.heroObject;

  return (
    <div className={`${styles.heroIcon} ${kindClass}`} aria-hidden>
      <ContextModelIcon kind={kind} size={28} monochrome />
    </div>
  );
}
