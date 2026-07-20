import { getTaxonomyValueContext } from './taxonomyValueContext';
import styles from './TaxonomyEditor.module.css';

function DetailGroup({ title, children }) {
  return (
    <section className={styles.valueDetailGroup}>
      <h3 className={styles.valueDetailGroupTitle}>{title}</h3>
      <div className={styles.valueDetailGroupBody}>{children}</div>
    </section>
  );
}

export default function TaxonomyValueDetailPanel({
  node,
  allNodes,
  objectType,
  onOpenSubtype,
  sourceObjectTypeId,
}) {
  if (!node) {
    return (
      <div className={styles.valueDetailEmpty}>
        <p className={styles.valueDetailEmptyTitle}>No value selected</p>
        <p className={styles.valueDetailEmptyCopy}>
          Select a value in the taxonomy structure to see how it is classified and related
          within this taxonomy.
        </p>
      </div>
    );
  }

  const context = getTaxonomyValueContext(node, allNodes, objectType);
  const memberLabel = `${context.memberCount} subtype asset${context.memberCount === 1 ? '' : 's'}`;

  return (
    <div className={styles.valueDetail}>
      <header className={styles.valueDetailHeader}>
        <h2 className={styles.valueDetailTitle}>{context.label}</h2>
        <button
          type="button"
          className={styles.valueDetailPrimaryBtn}
          onClick={() => onOpenSubtype?.(sourceObjectTypeId, node.id)}
        >
          Open subtype asset
        </button>
      </header>

      <DetailGroup title="Classification">
        <p className={styles.valueDetailLine}>
          {context.classificationAttribute} = {context.classificationValue}
        </p>
      </DetailGroup>

      <DetailGroup title="Parent value">
        <p className={styles.valueDetailLine}>{context.parentLabel ?? '—'}</p>
      </DetailGroup>

      <DetailGroup title="Child values">
        {context.childLabels.length ? (
          <ul className={styles.valueDetailList}>
            {context.childLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.valueDetailMuted}>None</p>
        )}
      </DetailGroup>

      <DetailGroup title="Members">
        <p className={styles.valueDetailLine}>{memberLabel}</p>
      </DetailGroup>

      <DetailGroup title="Constraints">
        <p className={styles.valueDetailMuted}>None</p>
      </DetailGroup>
    </div>
  );
}
