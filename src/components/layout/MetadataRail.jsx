import { assetMetadata } from '../../data/mockData';
import styles from './MetadataRail.module.css';

const recentRuns = [
  { name: 'Cache refresh', time: '2 min ago', status: 'Success' },
  { name: 'Validation', time: '18 min ago', status: 'Success' },
  { name: 'Deploy preview', time: '1 hr ago', status: 'Failed' },
];

export default function MetadataRail() {
  return (
    <aside className={styles.rail} aria-label="Asset metadata">
      <div className={styles.card}>
        <h3>Metadata</h3>
        <dl>
          <dt>Status</dt>
          <dd>
            <span className={styles.draft}>{assetMetadata.status}</span>
          </dd>
          <dt>Type</dt>
          <dd>{assetMetadata.type}</dd>
          <dt>Reference key</dt>
          <dd>
            <code>{assetMetadata.referenceKey}</code>
          </dd>
          <dt>Created by</dt>
          <dd>{assetMetadata.createdBy}</dd>
          <dt>Last updated by</dt>
          <dd>{assetMetadata.lastUpdatedBy}</dd>
        </dl>
      </div>
      <div className={styles.card}>
        <h3>Cache</h3>
        <p>
          Status: <strong>{assetMetadata.cacheStatus}</strong>
        </p>
        <label className={styles.switch}>
          <input type="checkbox" defaultChecked />
          <span />
        </label>
        <button type="button" className={styles.linkBtn}>
          Refresh cache
        </button>
      </div>
      <div className={styles.card}>
        <h3>Recent runs</h3>
        <ul>
          {recentRuns.map((run) => (
            <li key={run.name}>
              <span>{run.name}</span>
              <span className={styles.time}>{run.time}</span>
              <span
                className={
                  run.status === 'Success' ? styles.success : styles.failed
                }
              >
                {run.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
