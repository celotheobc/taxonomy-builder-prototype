import { getAttribute, getObjectType } from '../../../data/mockObjectTypes';
import styles from './SubtypesSection.module.css';

export default function SubtypeNavList({
  objectTypeId,
  subtypeEntries,
  selectedSubtypeId,
  onSelectSubtype,
}) {
  const objectType = getObjectType(objectTypeId);

  return (
    <nav className={styles.navList} aria-label="Created subtypes">
      <div className={styles.navListHeader}>
        <span className={styles.navListEyebrow}>Object subtypes</span>
        <span className={styles.navListBaseName}>{objectType.name}</span>
        <span className={styles.navListHint}>
          {subtypeEntries.length} object type{subtypeEntries.length === 1 ? '' : 's'}
        </span>
      </div>
      <ul className={styles.navItemsFlush}>
        {subtypeEntries.map(({ subtype, splitAttributeId }) => {
          const isActive = selectedSubtypeId === subtype.id;
          const splitAttribute = getAttribute(objectType, splitAttributeId);
          const derivedFrom = splitAttribute
            ? `${splitAttribute.name} = ${subtype.matchingValue}`
            : subtype.matchingValue;

          return (
            <li key={subtype.id}>
              <button
                type="button"
                className={isActive ? styles.subtypeCardActive : styles.subtypeCard}
                onClick={() => onSelectSubtype(subtype.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className={styles.subtypeCardHeader}>
                  <span className={styles.subtypeObjectIcon} aria-hidden />
                  <span className={styles.subtypeCardTitle}>{subtype.label}</span>
                </span>
                <span className={styles.subtypeCardMeta}>Derived from {derivedFrom}</span>
                <span className={styles.subtypeCardMeta}>
                  {subtype.recordCount.toLocaleString()} rows
                </span>
                {subtype.description ? (
                  <span className={styles.subtypeCardDescription}>{subtype.description}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
