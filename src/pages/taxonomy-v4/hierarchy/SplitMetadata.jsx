import TaxonomyStackIcon from '../../../components/icons/TaxonomyStackIcon';
import { getAttribute } from '../../../data/mockObjectTypes';
import { formatSplitTaxonomyLabel } from '../../../data/taxonomyTreeModel';
import badgeStyles from '../sections/ObjectTypeSectionCard.module.css';
import styles from './Hierarchy.module.css';

export function buildSplitMetadataProps({
  group,
  objectType,
  parentLabel,
  taxonomyId,
  taxonomyName,
  readOnly,
  onAddValues,
  onOpenTaxonomy,
}) {
  if (!group) return null;

  const attribute = getAttribute(objectType, group.attributeId);
  const attributeName = attribute?.name ?? group.attributeId;
  const taxonomyLabel =
    taxonomyName ?? formatSplitTaxonomyLabel(parentLabel, attributeName);
  const showAdd = group.availableCount > 0 && !readOnly;

  return {
    attributeName,
    directCount: group.createdCount,
    taxonomyLabel,
    showAdd,
    availableCount: group.availableCount,
    onAddValues,
    taxonomyId,
    onOpenTaxonomy,
  };
}

export function SplitByLabel({ attributeName }) {
  return (
    <span className={styles.splitMetaColSplit}>Split by: {attributeName}</span>
  );
}

export function SplitMetadataTrailing({
  directCount,
  taxonomyLabel,
  showAdd,
  availableCount,
  onAddValues,
  taxonomyId,
  onOpenTaxonomy,
}) {
  const chipLabel = `${directCount} subtype${directCount === 1 ? '' : 's'}`;

  return (
    <div className={styles.hierarchyMetaBandTrailing}>
      <span className={styles.splitMetaColChip}>
        <span className={badgeStyles.badgeSubtypes}>{chipLabel}</span>
      </span>
      <span className={styles.splitMetaColAdd}>
        {showAdd ? (
          <button type="button" className={styles.splitMetaAddLink} onClick={onAddValues}>
            Add {availableCount} available
          </button>
        ) : null}
      </span>
      <span className={styles.splitMetaColTaxonomy}>
        {taxonomyId && onOpenTaxonomy ? (
          <button
            type="button"
            className={styles.splitMetaTaxonomyLink}
            onClick={() => onOpenTaxonomy(taxonomyId)}
          >
            <TaxonomyStackIcon size={16} title="" />
            <span>{taxonomyLabel}</span>
          </button>
        ) : (
          <span className={styles.splitMetaTaxonomyStatic}>
            <TaxonomyStackIcon size={16} title="" />
            <span>{taxonomyLabel}</span>
          </span>
        )}
      </span>
    </div>
  );
}

export function SplitMetadataColumns({
  attributeName,
  directCount,
  taxonomyLabel,
  showAdd,
  availableCount,
  onAddValues,
  taxonomyId,
  onOpenTaxonomy,
  className = '',
}) {
  const chipLabel = `${directCount} subtype${directCount === 1 ? '' : 's'}`;

  return (
    <div className={`${styles.splitMetaColumns} ${className}`.trim()}>
      <SplitByLabel attributeName={attributeName} />
      <span className={styles.splitMetaColChip}>
        <span className={badgeStyles.badgeSubtypes}>{chipLabel}</span>
      </span>
      <span className={styles.splitMetaColAdd}>
        {showAdd ? (
          <button type="button" className={styles.splitMetaAddLink} onClick={onAddValues}>
            Add {availableCount} available
          </button>
        ) : null}
      </span>
      <span className={styles.splitMetaColTaxonomy}>
        {taxonomyId && onOpenTaxonomy ? (
          <button
            type="button"
            className={styles.splitMetaTaxonomyLink}
            onClick={() => onOpenTaxonomy(taxonomyId)}
          >
            <TaxonomyStackIcon size={16} title="" />
            <span>{taxonomyLabel}</span>
          </button>
        ) : (
          <span className={styles.splitMetaTaxonomyStatic}>
            <TaxonomyStackIcon size={16} title="" />
            <span>{taxonomyLabel}</span>
          </span>
        )}
      </span>
    </div>
  );
}

/** Two-row layout: split label under parent title; trailing columns align across depths. */
export function SplitMetadataTwoRow({
  attributeName,
  indentSplitLabel = false,
  ...trailingProps
}) {
  const label = <SplitByLabel attributeName={attributeName} />;

  return (
    <>
      {indentSplitLabel ? (
        <div className={styles.splitMetaLabelIndent}>{label}</div>
      ) : (
        label
      )}
      <SplitMetadataTrailing {...trailingProps} />
    </>
  );
}

export function SplitMetadataInline(props) {
  return (
    <div className={styles.hierarchyMetaBand}>
      <SplitMetadataColumns {...props} className={styles.splitMetaColumnsInline} />
    </div>
  );
}

export function SplitMetadataStacked(props) {
  return <SplitMetadataColumns {...props} className={styles.splitMetaColumnsStacked} />;
}
