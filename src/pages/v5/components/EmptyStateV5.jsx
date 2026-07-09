import { objects, SUGGESTED_START_OBJECTS } from '../../../data/mockData';
import PerspectivePuckIcon from '../../../components/icons/PerspectivePuckIcon';
import { ObjectTypeIcon, ProcessFlowIcon } from '../../../components/icons/ContextModelIcons';
import PerspectiveStartSearch, { START_PROCESSES } from './PerspectiveStartSearch';
import styles from '../../../components/configuration/EmptyState.module.css';
import localStyles from './EmptyStateV5.module.css';

function StartChip({ kind, children, onClick }) {
  const isProcess = kind === 'process';
  return (
    <button type="button" className={localStyles.startChip} onClick={onClick}>
      <span
        className={`${localStyles.chipIcon} ${
          isProcess ? localStyles.chipIconProcess : localStyles.chipIconObject
        }`}
        aria-hidden
      >
        {isProcess ? (
          <ProcessFlowIcon size={14} />
        ) : (
          <ObjectTypeIcon size={14} />
        )}
      </span>
      <span className={localStyles.chipLabel}>{children}</span>
    </button>
  );
}

export default function EmptyStateV5({ onAddObject, onStartFromProcess, centered = false }) {
  const suggested = SUGGESTED_START_OBJECTS.map((id) =>
    objects.find((o) => o.id === id),
  ).filter(Boolean);

  return (
    <div className={`${centered ? styles.emptyCentered : styles.empty} ${localStyles.root}`}>
      <div className={localStyles.content}>
        <div className={localStyles.iconHero} aria-hidden>
          <PerspectivePuckIcon size={56} />
        </div>
        <h3 className={styles.title}>Start building your perspective</h3>
        <p className={`${styles.subtitle} ${localStyles.subtitleWide}`}>
          Begin with an object type or an existing process. You can refine your
          perspective at any time.
        </p>
        <div className={`${styles.searchBlock} ${localStyles.searchBlock}`}>
          <PerspectiveStartSearch
            onSelectObject={onAddObject}
            onSelectProcess={onStartFromProcess}
          />
        </div>
        <div className={localStyles.chipSection}>
          <span className={localStyles.sectionLabel}>Common starting objects</span>
          <div className={localStyles.chipRow}>
            {suggested.map((obj) => (
              <StartChip key={obj.id} kind="object" onClick={() => onAddObject(obj.id)}>
                {obj.name}
              </StartChip>
            ))}
          </div>
        </div>

        <div className={localStyles.processSection}>
          <span className={localStyles.sectionLabel}>Existing processes</span>
          <div className={localStyles.chipRow}>
            {START_PROCESSES.map((process) => (
              <StartChip
                key={process.id}
                kind="process"
                onClick={() => onStartFromProcess?.(process.id)}
              >
                {process.name}
              </StartChip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
