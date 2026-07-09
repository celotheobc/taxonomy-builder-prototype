import inspectorStyles from '../../v5/inspector/RightInspector.module.css';
import { getAttribute, getObjectType } from '../../../data/mockObjectTypes';
import { useObjectTypeWorkspace } from '../context/ObjectTypeWorkspaceContext';
import styles from './TaxonomyRightInspector.module.css';

function MetaRows({ rows }) {
  return (
    <dl className={inspectorStyles.metaRows}>
      {rows.map((row) => (
        <div key={row.label} className={inspectorStyles.metaRow}>
          <dt className={inspectorStyles.metaLabel}>{row.label}</dt>
          <dd className={`${inspectorStyles.metaValue} ${row.valueClass ?? ''}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function InspectorContent({ objectTypeId, subtypeEntry = null, onOpenTaxonomy }) {
  const objectType = getObjectType(objectTypeId);
  const { getSplitState, getAllSubtypeEntries } = useObjectTypeWorkspace();

  if (subtypeEntry) {
    const { subtype, splitAttributeId, taxonomy } = subtypeEntry;
    const splitAttribute = getAttribute(objectType, splitAttributeId);
    const derivedFrom = splitAttribute
      ? `${splitAttribute.name} = ${subtype.matchingValue}`
      : subtype.matchingValue;
    const description =
      subtype.description?.trim() || objectType.metadata.description;

    return (
      <div className={inspectorStyles.tabContent}>
        <h3 className={styles.heading}>Object Type</h3>
        <p className={styles.bodyText}>{description}</p>
        <MetaRows
          rows={[
            { label: 'Asset name', value: subtype.label },
            {
              label: 'Status',
              value: objectType.metadata.status,
              valueClass: `${inspectorStyles.statusDot} ${styles.statusDraft}`,
            },
            { label: 'Type', value: 'Object Type' },
            { label: 'Parent object', value: objectType.name },
            { label: 'Derived from', value: derivedFrom },
            { label: 'Rows', value: subtype.recordCount.toLocaleString() },
            {
              label: 'Reference key',
              value: `${objectType.metadata.referenceKey}.${subtype.id.replace(/-/g, '_')}`,
            },
            { label: 'Namespace', value: objectType.metadata.namespace, valueClass: styles.namespaceValue },
            { label: 'Domain', value: objectType.domain },
            { label: 'Subtypes', value: '—' },
            { label: 'Created by', value: objectType.metadata.createdBy },
            { label: 'Last updated by', value: objectType.metadata.lastUpdatedBy },
          ]}
        />
        {taxonomy && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Linked taxonomies</h3>
            <div className={styles.assetCard}>
              <p className={styles.assetName}>{taxonomy.name}</p>
              <p className={styles.assetMeta}>
                {taxonomy.type} · {taxonomy.status} · member of taxonomy
              </p>
              <button
                type="button"
                className={styles.linkishBtn}
                onClick={() => onOpenTaxonomy?.(taxonomy.id)}
              >
                Open taxonomy
              </button>
            </div>
          </section>
        )}
      </div>
    );
  }

  const splitState = getSplitState(objectTypeId);
  const subtypeEntries = getAllSubtypeEntries(splitState);
  const taxonomies = subtypeEntries
    .map((entry) => entry.taxonomy)
    .filter((taxonomy, index, list) => taxonomy && list.findIndex((t) => t?.id === taxonomy.id) === index);

  return (
    <div className={inspectorStyles.tabContent}>
      <h3 className={styles.heading}>Object Type</h3>
      <p className={styles.bodyText}>{objectType.metadata.description}</p>
      <MetaRows
        rows={[
          { label: 'Asset name', value: objectType.metadata.assetName },
          {
            label: 'Status',
            value: objectType.metadata.status,
            valueClass: `${inspectorStyles.statusDot} ${styles.statusDraft}`,
          },
          { label: 'Type', value: objectType.metadata.type },
          { label: 'Reference key', value: objectType.metadata.referenceKey },
          { label: 'Namespace', value: objectType.metadata.namespace, valueClass: styles.namespaceValue },
          { label: 'Domain', value: objectType.domain },
          { label: 'Subtypes', value: subtypeEntries.length ? String(subtypeEntries.length) : '—' },
          { label: 'Created by', value: objectType.metadata.createdBy },
          { label: 'Last updated by', value: objectType.metadata.lastUpdatedBy },
        ]}
      />
      {taxonomies.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Linked taxonomies</h3>
          {taxonomies.map((taxonomy) => (
            <div key={taxonomy.id} className={styles.assetCard}>
              <p className={styles.assetName}>{taxonomy.name}</p>
              <p className={styles.assetMeta}>
                {taxonomy.type} · {taxonomy.status} · {taxonomy.subtypeCount} subtypes
              </p>
              <button
                type="button"
                className={styles.linkishBtn}
                onClick={() => onOpenTaxonomy?.(taxonomy.id)}
              >
                Open taxonomy
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
