import { assetMetadata } from '../../data/mockData';
import styles from './AssetHeader.module.css';

export default function AssetHeader({ title = assetMetadata.title }) {
  return (
    <header className={styles.header}>
      <div>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          Context Models <span>/</span> Order Management Context Model
        </nav>
        <h1>{title}</h1>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.secondary}>
          Create version
        </button>
        <button type="button" className={styles.primary}>
          Deploy
        </button>
        <button type="button" className={styles.star} aria-label="Favourite">
          ★
        </button>
      </div>
    </header>
  );
}
