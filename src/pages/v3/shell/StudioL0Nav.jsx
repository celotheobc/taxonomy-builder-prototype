import theoBotAvatar from '../../../assets/theobot-avatar.png';
import styles from './StudioL0Nav.module.css';

const SKELETON_SLOTS = 4;

export default function StudioL0Nav({ onVersionChange }) {
  return (
    <nav className={styles.nav} aria-label="Celonis navigation">
      {Array.from({ length: SKELETON_SLOTS }, (_, i) => (
        <div key={i} className={styles.skeleton} aria-hidden />
      ))}
      <div className={styles.spacer} />
      <div className={styles.skeleton} aria-hidden />
      <div className={styles.avatarWrap}>
        <button
          type="button"
          className={styles.avatar}
          aria-label="Back to prototype home"
          title="Prototype home"
          onClick={() => onVersionChange?.('cover')}
        >
          <img
            src={theoBotAvatar}
            alt=""
            className={styles.avatarImage}
            width={32}
            height={32}
          />
        </button>
      </div>
    </nav>
  );
}
