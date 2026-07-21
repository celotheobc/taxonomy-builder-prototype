import { getObjectType } from '../../../data/mockObjectTypes';
import styles from './ObjectTypePageHeader.module.css';

export default function ObjectTypePageHeader({
  objectTypeId,
  subtypeEntry = null,
  classificationPath = null,
  onNavigateClassificationItem,
}) {
  const objectType = getObjectType(objectTypeId);
  const displayName = subtypeEntry?.subtype.label ?? objectType.name;

  return (
    <header className={styles.header}>
      <div>
        {subtypeEntry && <p className={styles.eyebrow}>Object Type · Subtype</p>}
        <h1 className={styles.title}>{displayName}</h1>
        {classificationPath?.length ? (
          <nav className={styles.classificationNav} aria-label="Classification path">
            <ol className={styles.classificationPath}>
              {classificationPath.map((item, index) => {
                const isLast = index === classificationPath.length - 1;
                return (
                  <li key={item.id ?? 'root'} className={styles.classificationItem}>
                    {index > 0 ? (
                      <span className={styles.classificationSep} aria-hidden="true">
                        →
                      </span>
                    ) : null}
                    {isLast ? (
                      <span className={styles.classificationCurrent} aria-current="page">
                        {item.label}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={styles.classificationLink}
                        onClick={() => onNavigateClassificationItem?.(item)}
                      >
                        {item.label}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
      </div>
      <div className={styles.actions} aria-label="Page actions">
        <button type="button" className={styles.iconBtn} aria-label="History">
          ⟲
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Settings">
          ⚙
        </button>
        <button type="button" className={styles.saveBtn}>
          Save
        </button>
        <button type="button" className={styles.iconBtn} aria-label="View">
          ◫
        </button>
        <span className={styles.statusBadge}>{objectType.metadata.status}</span>
      </div>
    </header>
  );
}
