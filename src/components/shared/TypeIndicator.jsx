import { ContextModelIcon } from '../icons/ContextModelIcons';
import styles from './TypeIndicator.module.css';

/** Small icon matching graph node types (object / event / metric / process). */
export default function TypeIndicator({ kind }) {
  const variant =
    kind === 'metric' || kind === 'metrics'
      ? 'metric'
      : kind === 'eventSource' || kind === 'events'
        ? 'event'
        : kind === 'process'
          ? 'process'
          : kind === 'relationship' || kind === 'relationships'
            ? 'relationship'
            : 'object';

  if (variant === 'metric') {
    return (
      <span className={`${styles.dot} ${styles.metric}`} aria-hidden />
    );
  }

  return (
    <span className={`${styles.iconWrap} ${styles[variant]}`} aria-hidden>
      <ContextModelIcon kind={variant} size={12} />
    </span>
  );
}
