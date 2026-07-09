import GraphInsertPopover from '../graph/GraphInsertPopover';
import styles from './RelationshipsModule.module.css';

export default function TableSectionHeader({
  headingId,
  title,
  count = 0,
  showAdd = false,
  insertProps = {},
}) {
  return (
    <div className={styles.sectionHeader}>
      <h2 id={headingId}>
        {title}
        {count > 0 && (
          <span className={styles.count} aria-label={`${count} in perspective`}>
            {count}
          </span>
        )}
      </h2>
      {showAdd && (
        <GraphInsertPopover variant="header" align="right" {...insertProps} />
      )}
    </div>
  );
}
