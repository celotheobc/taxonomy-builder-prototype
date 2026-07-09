import { useState } from 'react';
import { L1_QUICK_LINKS, L1_SECTIONS } from './studioAssets';
import { SectionIcon } from '../../v3/shell/StudioIcons';
import styles from '../../v3/shell/StudioL1Nav.module.css';

function Chevron({ open }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className={open ? styles.chevronOpen : styles.chevron}>
      <path d="M2.5 3.5L5 6l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export default function StudioL1Nav({ activeAssetKey, onOpenAsset, onNewPerspective }) {
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(L1_SECTIONS.map((s) => [s.id, Boolean(s.defaultOpen)])),
  );

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className={styles.sidebar} aria-label="Context model assets">
      <div className={styles.quickLinks}>
        {L1_QUICK_LINKS.map((link) => (
          <button
            key={link.id}
            type="button"
            className={styles.quickLink}
            onClick={() => onOpenAsset?.(link)}
          >
            {link.label}
          </button>
        ))}
      </div>

      <div className={styles.searchWrap}>
        <input
          type="search"
          className={styles.search}
          placeholder="Search"
          aria-label="Search assets"
        />
        <button type="button" className={styles.filterBtn} aria-label="Filter">
          ☰
        </button>
      </div>

      <button type="button" className={styles.newAsset}>
        <span className={styles.newAssetIcon}>+</span>
        New Asset
      </button>

      <div className={styles.sections}>
        {L1_SECTIONS.map((section) => {
          const open = openSections[section.id];
          return (
            <div key={section.id} className={styles.section}>
              <div className={styles.sectionHeaderRow}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={open}
                >
                  <SectionIcon kind={section.icon} size={14} />
                  <span className={styles.sectionLabel}>{section.label}</span>
                </button>
                {section.canCreate && (
                  <button
                    type="button"
                    className={styles.sectionAdd}
                    aria-label="Create new perspective"
                    title="Create new perspective"
                    onClick={(event) => {
                      event.stopPropagation();
                      onNewPerspective?.();
                    }}
                  >
                    +
                  </button>
                )}
                <button
                  type="button"
                  className={styles.chevronBtn}
                  aria-label={open ? `Collapse ${section.label}` : `Expand ${section.label}`}
                  onClick={() => toggleSection(section.id)}
                >
                  <Chevron open={open} />
                </button>
              </div>
              {open && section.assets.length > 0 && (
                <ul className={styles.assetList}>
                  {section.assets.map((asset) => {
                    const key = `${asset.assetType}:${asset.id}`;
                    const active = activeAssetKey === key;
                    return (
                      <li key={asset.id}>
                        <button
                          type="button"
                          className={active ? styles.assetActive : styles.asset}
                          onClick={() => onOpenAsset?.(asset)}
                        >
                          {asset.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <button type="button" className={styles.packageSettings}>
        <span aria-hidden>⚙</span>
        Package Settings
      </button>
    </aside>
  );
}
