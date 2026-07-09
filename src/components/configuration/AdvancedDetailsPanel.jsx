import { ROUTE_A, ROUTE_B } from '../../data/mockData';
import styles from './AdvancedDetailsPanel.module.css';

export default function AdvancedDetailsPanel({ open, onToggle, onExclude }) {
  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        onClick={onToggle}
      >
        Advanced details
        <span className={styles.chevron}>{open ? '▾' : '▸'}</span>
      </button>
      <div className={`${styles.content} ${open ? styles.open : ''}`}>
        <p>
          This Perspective must avoid multiple active routes between the same included
          object types.
        </p>
        <h4>Relationships involved</h4>
        <ul>
          <li>
            <code>{ROUTE_A.relationshipIds.join(', ')}</code> — {ROUTE_A.description}
          </li>
          <li>
            <code>{ROUTE_B.relationshipIds.join(', ')}</code> — {ROUTE_B.description}
          </li>
        </ul>
        <p className={styles.tech}>
          Technically, multiple shortest paths between Customer and Delivery Item create
          ambiguous traversal for agents and queries. Resolve by selecting one path or
          excluding a relationship.
        </p>
        <button type="button" className={styles.excludeBtn} onClick={onExclude}>
          Exclude relationship
        </button>
      </div>
    </div>
  );
}
