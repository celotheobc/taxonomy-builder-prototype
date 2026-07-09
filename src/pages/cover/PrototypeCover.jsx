import TaxonomyStackIcon from '../../components/icons/TaxonomyStackIcon';
import styles from './PrototypeCover.module.css';

const VERSIONS = [
  {
    id: 'v1',
    title: 'Object type taxonomy',
    description:
      'Split object types into subtypes from attribute values, with generated taxonomy assets, By Attribute / By Subtype workflows, subtype object pages, and nested navigation in the Context Model shell.',
    tag: 'v1',
    objectTypeId: 'jira-issue',
  },
];

const [FEATURED_VERSION] = VERSIONS;

function VersionPanel({ version, onOpen }) {
  return (
    <article className={`${styles.item} ${styles.itemFeatured} ${styles.itemLaunchable}`}>
      <div className={styles.headerRow}>
        <div className={styles.rowMain}>
          <h2 className={styles.versionTitle}>{version.title}</h2>
          <span className={styles.versionChip}>{version.tag}</span>
        </div>
        <button
          type="button"
          className={styles.openBtn}
          onClick={() => onOpen(version.objectTypeId)}
        >
          Open
        </button>
      </div>
      <p className={styles.description}>{version.description}</p>
    </article>
  );
}

export default function PrototypeCover({ onOpen }) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.brandMark} aria-hidden>
            <TaxonomyStackIcon size={52} />
          </div>
          <h1 className={styles.title}>Taxonomy Builder</h1>
          <p className={styles.subtitle}>
            Split object types into subtypes from existing attribute values. Taxonomies are generated
            as supporting metadata.
          </p>
        </header>

        <div className={styles.list}>
          <VersionPanel version={FEATURED_VERSION} onOpen={onOpen} />
        </div>
      </div>
    </div>
  );
}
