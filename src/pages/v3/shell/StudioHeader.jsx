import styles from './StudioHeader.module.css';

const SKELETON_CRUMBS = [44, 56, 40];

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M4 2.75 9.25 6 4 9.25V2.75Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StudioHeader() {
  return (
    <header className={styles.header}>
      <nav className={styles.skeletonTrail} aria-label="Navigation">
        {SKELETON_CRUMBS.map((width, index) => (
          <span key={index} className={styles.skeletonGroup}>
            {index > 0 ? (
              <span className={styles.skeletonSep} aria-hidden>
                ›
              </span>
            ) : null}
            <span
              className={styles.skeletonBar}
              style={{ width: `${width}px` }}
              aria-hidden
            />
          </span>
        ))}
      </nav>

      <div className={styles.actions}>
        <button type="button" className={styles.preview}>
          <PlayIcon />
          Preview
        </button>
        <button type="button" className={styles.deploy}>
          Deploy
        </button>
      </div>
    </header>
  );
}
