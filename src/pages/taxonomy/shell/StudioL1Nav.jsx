import { useState } from 'react';
import { L1_QUICK_LINKS } from './studioAssets';
import { SectionIcon } from '../../v3/shell/StudioIcons';
import styles from '../../v3/shell/StudioL1Nav.module.css';

function Chevron({ open }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden
      className={open ? styles.chevronOpen : styles.chevron}
    >
      <path
        d="M2.5 3.5L5 6l2.5-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ObjectTypeIcon({ small = false }) {
  return (
    <span
      className={small ? styles.subtypeObjectIcon : styles.objectTypeIcon}
      aria-hidden
    />
  );
}

export default function StudioL1Nav({ sections, activeAssetKey, onOpenAsset }) {
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(sections.map((section) => [section.id, Boolean(section.defaultOpen)])),
  );
  const [openObjectGroups, setOpenObjectGroups] = useState({});

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleObjectGroup = (assetId) => {
    setOpenObjectGroups((prev) => ({
      ...prev,
      [assetId]: !(prev[assetId] ?? true),
    }));
  };

  const isObjectGroupOpen = (assetId) => openObjectGroups[assetId] ?? true;

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
        {sections.map((section) => {
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
                <button
                  type="button"
                  className={styles.chevronBtn}
                  aria-label={`${open ? 'Collapse' : 'Expand'} ${section.label}`}
                  onClick={() => toggleSection(section.id)}
                >
                  <Chevron open={open} />
                </button>
              </div>
              {open && (
                <ul className={styles.assetList}>
                  {section.assets.map((asset) => {
                    const key = assetKey(asset);
                    const active = key === activeAssetKey;
                    const hasChildren = asset.children?.length > 0;

                    return (
                      <li key={asset.id} className={styles.assetGroup}>
                        <div className={styles.assetHeaderRow}>
                          <button
                            type="button"
                            className={active ? styles.assetActive : styles.asset}
                            onClick={() => onOpenAsset?.(asset)}
                          >
                            <ObjectTypeIcon />
                            <span className={styles.assetLabel}>{asset.label}</span>
                          </button>
                          {hasChildren && (
                            <button
                              type="button"
                              className={styles.chevronBtn}
                              aria-label={`${isObjectGroupOpen(asset.id) ? 'Collapse' : 'Expand'} ${asset.label}`}
                              aria-expanded={isObjectGroupOpen(asset.id)}
                              onClick={() => toggleObjectGroup(asset.id)}
                            >
                              <Chevron open={isObjectGroupOpen(asset.id)} />
                            </button>
                          )}
                        </div>
                        {hasChildren && isObjectGroupOpen(asset.id) && (
                          <ul className={styles.childAssetList}>
                            {asset.children.map((child) => {
                              const childKey = assetKey(child);
                              const childActive = childKey === activeAssetKey;
                              return (
                                <li key={child.id}>
                                  <button
                                    type="button"
                                    className={childActive ? styles.childAssetActive : styles.childAsset}
                                    onClick={() => onOpenAsset?.(child)}
                                  >
                                    <ObjectTypeIcon small />
                                    <span>{child.label}</span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function assetKey(asset) {
  if (asset.assetType === 'subtype-object') {
    return `${asset.assetType}:${asset.parentObjectTypeId}:${asset.id}`;
  }
  return `${asset.assetType}:${asset.id}`;
}
