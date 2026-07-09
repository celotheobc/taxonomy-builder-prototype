import styles from './StudioAssetPlaceholder.module.css';

export default function StudioAssetPlaceholder({ title }) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}
