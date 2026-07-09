import {
  getContextEventName,
  getContextObjectName,
} from '../../v3/data/contextModelData';
import styles from './ProcessTableView.module.css';

export default function ProcessTableView({
  objectIds,
  eventIds,
  selectionMode,
  selectedObjects,
  selectedEvents,
  onToggleObject,
  onToggleEvent,
}) {
  const handleRowClick = (kind, id) => {
    if (!selectionMode) return;
    if (kind === 'object') onToggleObject?.(id);
    if (kind === 'event') onToggleEvent?.(id);
  };

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {selectionMode && <th className={styles.selectCol} aria-label="Selected" />}
            <th>Type</th>
            <th>Name</th>
            <th>Technical name</th>
          </tr>
        </thead>
        <tbody>
          {objectIds.map((id) => {
            const selected = selectedObjects?.has(id);
            return (
              <tr
                key={`obj-${id}`}
                className={`${selectionMode ? styles.rowSelectable : ''} ${selected ? styles.rowSelected : ''}`}
                onClick={() => handleRowClick('object', id)}
                aria-selected={selectionMode ? selected : undefined}
              >
                {selectionMode && (
                  <td className={styles.selectCol}>
                    <span className={styles.check} aria-hidden>
                      {selected ? '✓' : ''}
                    </span>
                  </td>
                )}
                <td>
                  <span className={styles.badgeObject}>Object</span>
                </td>
                <td>{getContextObjectName(id)}</td>
                <td className={styles.mono}>{id}</td>
              </tr>
            );
          })}
          {eventIds.map((id) => {
            const selected = selectedEvents?.has(id);
            return (
              <tr
                key={`evt-${id}`}
                className={`${selectionMode ? styles.rowSelectable : ''} ${selected ? styles.rowSelected : ''}`}
                onClick={() => handleRowClick('event', id)}
                aria-selected={selectionMode ? selected : undefined}
              >
                {selectionMode && (
                  <td className={styles.selectCol}>
                    <span className={styles.check} aria-hidden>
                      {selected ? '✓' : ''}
                    </span>
                  </td>
                )}
                <td>
                  <span className={styles.badgeEvent}>Event</span>
                </td>
                <td>{getContextEventName(id)}</td>
                <td className={styles.mono}>{id}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
