import { useState } from 'react';
import TaxonomyStackIcon from '../../components/icons/TaxonomyStackIcon';
import styles from './PrototypeCover.module.css';

const VERSIONS = [
  {
    id: 'v5',
    title: 'Grouped values & rule-based hierarchy authoring',
    description:
      'Builds on V4 with a modal-first choice between attribute-value grouping (many source values → one subtype) and a visual rule builder with preview, while keeping the object, taxonomy, and subtype pages stable.',
    tag: 'v5',
    objectTypeId: 'facility',
  },
  {
    id: 'v4',
    title: 'Parent-owned split configuration',
    description:
      'Refines V3 hierarchy clarity: split metadata lives under the node that owns it (not as extra tree levels), lightweight “Split by …” summaries, taxonomy links per split, and the taxonomy asset page mirrors the same recursive tree.',
    tag: 'v4',
    objectTypeId: 'facility',
  },
  {
    id: 'v3',
    title: 'Recursive subtype hierarchy',
    description:
      'Polished tree-first specialisation built on V2. Multi-select value picking, expandable hierarchy with chevrons and child counts, recursive navigation, and a taxonomy page that mirrors the same shared hierarchy state.',
    tag: 'v3',
    objectTypeId: 'facility',
  },
  {
    id: 'v2',
    title: 'Hierarchy tree editor',
    description:
      'Tree-first subtype authoring built from the V1 baseline. Create a hierarchy from a single CTA, split any node recursively by attribute values, and grow specialisation without configuration wizards.',
    tag: 'v2',
    objectTypeId: 'jira-issue',
  },
  {
    id: 'v1',
    title: 'Object type taxonomy',
    description:
      'Split object types into subtypes from attribute values, with created taxonomy assets, By Attribute / By Subtype workflows, subtype object pages, and nested navigation in the Context Model shell.',
    tag: 'v1',
    objectTypeId: 'jira-issue',
  },
];

const [FEATURED_VERSION, ...ARCHIVED_VERSIONS] = VERSIONS;

function ChevronIcon({ open }) {
  return (
    <svg
      className={`${styles.expandChevron} ${open ? styles.expandChevronOpen : ''}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M4.5 2.5 8.5 6 4.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VersionPanel({ version, featured = false, onOpen }) {
  return (
    <article
      className={`${styles.item} ${featured ? styles.itemFeatured : ''} ${styles.itemLaunchable}`}
    >
      <div className={styles.headerRow}>
        <div className={styles.rowMain}>
          <h2 className={styles.versionTitle}>{version.title}</h2>
          <span className={styles.versionChip}>{version.tag}</span>
        </div>
        <button type="button" className={styles.openBtn} onClick={() => onOpen(version)}>
          Open
        </button>
      </div>
      <p className={styles.description}>{version.description}</p>
    </article>
  );
}

function ArchiveVersionRow({ version, expanded, onToggle, onOpen }) {
  return (
    <article className={`${styles.item} ${styles.itemInList}`}>
      <div className={styles.headerRow}>
        <button
          type="button"
          className={styles.expandChevronWrap}
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? `Collapse ${version.title}` : `Expand ${version.title}`}
        >
          <ChevronIcon open={expanded} />
        </button>
        <div className={styles.rowMain}>
          <h2 className={styles.versionTitle}>{version.title}</h2>
          <span className={styles.versionChip}>{version.tag}</span>
        </div>
        <button type="button" className={styles.openBtn} onClick={() => onOpen(version)}>
          Open
        </button>
      </div>
      {expanded ? <p className={styles.description}>{version.description}</p> : null}
    </article>
  );
}

export default function PrototypeCover({ onOpen }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const toggleArchive = (versionId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(versionId)) next.delete(versionId);
      else next.add(versionId);
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.brandMark} aria-hidden>
            <TaxonomyStackIcon size={52} />
          </div>
          <h1 className={styles.title}>Taxonomy Builder</h1>
          <p className={styles.subtitle}>
            Author taxonomies for the Celonis Context Model — specialise object types into subtypes
            and organise them on linked Taxonomy assets.
          </p>
        </header>

        <div className={styles.list}>
          <VersionPanel version={FEATURED_VERSION} featured onOpen={onOpen} />

          {ARCHIVED_VERSIONS.length ? (
            <div className={styles.archiveList}>
              {ARCHIVED_VERSIONS.map((version) => (
                <ArchiveVersionRow
                  key={version.id}
                  version={version}
                  expanded={expandedIds.has(version.id)}
                  onToggle={() => toggleArchive(version.id)}
                  onOpen={onOpen}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
