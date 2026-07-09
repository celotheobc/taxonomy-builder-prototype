import { objects } from '../../../data/mockData';
import styles from './PathRouteLabel.module.css';

export function objectName(id) {
  return objects.find((o) => o.id === id)?.name ?? id;
}

export default function PathRouteLabel({ objectIds, includedObjects }) {
  return (
    <span className={styles.pathRoute}>
      {objectIds.map((id, index) => {
        const isNew = !includedObjects.has(id);
        return (
          <span key={`${id}-${index}`} className={styles.pathSegment}>
            {index > 0 && (
              <span className={styles.pathArrow} aria-hidden>
                →
              </span>
            )}
            <span className={styles.pathObject}>
              {objectName(id)}
              {isNew && (
                <span
                  className={styles.addIndicator}
                  title="Will be added to perspective"
                  aria-label="Will be added"
                >
                  +
                </span>
              )}
            </span>
          </span>
        );
      })}
    </span>
  );
}
