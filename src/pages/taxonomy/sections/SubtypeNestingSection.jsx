import ObjectTypeSectionCard from './ObjectTypeSectionCard';
import styles from './SubtypeNestingSection.module.css';

/**
 * Placeholder until nested subtypes are supported on object subtypes.
 */
export default function SubtypeNestingSection({ parentObjectTypeName, onOpenParent }) {
  return (
    <ObjectTypeSectionCard title="Subtypes">
      <div className={styles.body}>
        <p className={styles.title}>Nested subtypes are not available yet</p>
        <p className={styles.copy}>
          Object subtypes inherit structure from their parent. Create and manage subtypes on{' '}
          <button type="button" className={styles.parentLink} onClick={onOpenParent}>
            {parentObjectTypeName}
          </button>
          .
        </p>
      </div>
    </ObjectTypeSectionCard>
  );
}
