import { EXPERIENCES } from '../../data/mockData';
import styles from './ExperienceSwitcher.module.css';

const TABS = [
  { id: EXPERIENCES.PROGRESSIVE, label: 'A — Discover toggles' },
  { id: EXPERIENCES.PROGRESSIVE_CONTEXTUAL, label: 'A′ — Contextual menu' },
  { id: EXPERIENCES.ROUTE_AMBIGUITY, label: 'Cycle resolution demo' },
];

export default function ExperienceSwitcher({ experience, onChange }) {
  return (
    <div className={styles.banner} role="tablist" aria-label="Prototype experiences">
      <span className={styles.label}>Prototype experience</span>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={experience === tab.id}
          className={experience === tab.id ? styles.active : ''}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
