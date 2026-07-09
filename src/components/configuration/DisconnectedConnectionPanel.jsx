import { objectName } from './connectionPath/PathRouteLabel';
import PathRouteLabel from './connectionPath/PathRouteLabel';
import {
  CONNECTION_PATH_COPY,
  countObjectsToAdd,
} from '../../utils/connectionPathCopy';
import styles from './DisconnectedConnectionPanel.module.css';

export default function DisconnectedConnectionPanel({
  prompt,
  includedObjects,
  previewPathId,
  onPreviewPath,
  onClearPreview,
  onInsertPath,
  onKeepUnconnected,
}) {
  if (!prompt) return null;

  const addedName = objectName(prompt.addedId);

  return (
    <div
      className={styles.panel}
      role="region"
      aria-labelledby="disconnect-connect-heading"
      onMouseLeave={onClearPreview}
    >
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{CONNECTION_PATH_COPY.eyebrow}</p>
        <h3 id="disconnect-connect-heading" className={styles.title}>
          Possible ways to connect {addedName}
        </h3>
        <p className={styles.hint}>{CONNECTION_PATH_COPY.panelHint(addedName)}</p>
      </div>

      {prompt.paths.length > 0 ? (
        <ul className={styles.optionList}>
          {prompt.paths.map((path) => {
            const active = previewPathId === path.id;
            const addsCount = countObjectsToAdd(path.objectIds, includedObjects);

            return (
              <li key={path.id}>
                <div
                  className={`${styles.optionCard} ${active ? styles.optionCardActive : ''}`}
                  onMouseEnter={() => onPreviewPath(path.id)}
                >
                  <div className={styles.optionBody}>
                    <span className={styles.addsBadge}>
                      {CONNECTION_PATH_COPY.addsObjects(addsCount)}
                    </span>
                    <PathRouteLabel
                      objectIds={path.objectIds}
                      includedObjects={includedObjects}
                    />
                    {path.wouldCreateCycle && (
                      <span className={styles.cycleBadge}>Creates cycle</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.chooseBtn}
                    onClick={() => onInsertPath(path.id)}
                    onFocus={() => onPreviewPath(path.id)}
                    onBlur={onClearPreview}
                  >
                    {CONNECTION_PATH_COPY.chooseButton}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.noPaths}>
          No relationship path exists in the model between this object and your
          perspective.
        </p>
      )}

      <div className={styles.keepCard} onMouseEnter={onClearPreview}>
        <div className={styles.keepBody}>
          <strong className={styles.keepTitle}>Keep disconnected</strong>
          <p className={styles.keepDetail}>
            Add only {addedName} — no extra objects or relationships.
          </p>
        </div>
        <button type="button" className={styles.keepBtn} onClick={onKeepUnconnected}>
          Add without connecting
        </button>
      </div>
    </div>
  );
}
