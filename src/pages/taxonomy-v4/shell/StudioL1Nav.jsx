import { useEffect, useMemo, useState } from 'react';
import { L1_QUICK_LINKS } from './studioAssets';
import { SectionIcon } from '../../v3/shell/StudioIcons';
import styles from '../../v3/shell/StudioL1Nav.module.css';
import anim from './StudioL1Nav.anim.module.css';
import compact from './StudioL1Nav.compact.module.css';
import {
  childAssetKey,
  getEnterDelay,
  taxonomyAssetKey,
  useL1NavEnterAnimations,
} from './useL1NavEnterAnimations';

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

function ObjectTypeIcon({ small = false, compactNav = false }) {
  if (compactNav) {
    return <span className={compact.subtypeIcon} aria-hidden />;
  }
  return (
    <span
      className={small ? styles.subtypeObjectIcon : styles.objectTypeIcon}
      aria-hidden
    />
  );
}

function enteringStyle(staggerIndex) {
  return { '--nav-enter-delay': `${getEnterDelay(staggerIndex)}ms` };
}

function findAncestorIds(nodes, targetId, ancestors = []) {
  for (const node of nodes) {
    if (node.id === targetId) return ancestors;
    if (node.children?.length) {
      const found = findAncestorIds(node.children, targetId, [...ancestors, node.id]);
      if (found) return found;
    }
  }
  return null;
}

function NavSubtypeBranch({
  nodes,
  objectTypeId,
  activeAssetKey,
  onOpenAsset,
  depth,
  openSubtypeNodes,
  toggleSubtypeNode,
  enteringKeys,
}) {
  return nodes.map((child) => {
    const childKey = assetKey(child);
    const childActive = childKey === activeAssetKey;
    const navChildKey = childAssetKey(child);
    const isEntering = enteringKeys.has(navChildKey);
    const staggerIndex = enteringKeys.get(navChildKey) ?? 0;
    const hasChildren = child.children?.length > 0;
    const isOpen = openSubtypeNodes[child.id] ?? true;
    const indent = 4 + depth * 8;

    return (
      <li key={child.id} className={isEntering ? anim.navRowEnter : undefined}>
        <div
          className={
            isEntering
              ? anim.navRowEnterInner
              : `${anim.subtypeBranchRow} ${compact.subtypeBranchRow}`
          }
          style={{ paddingLeft: indent }}
        >
          {hasChildren ? (
            <button
              type="button"
              className={`${styles.chevronBtn} ${compact.subtypeChevron}`}
              aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${child.label}`}
              aria-expanded={isOpen}
              onClick={() => toggleSubtypeNode(child.id)}
            >
              <Chevron open={isOpen} />
            </button>
          ) : (
            <span className={compact.chevronSpacer} aria-hidden />
          )}
          <button
            type="button"
            className={`${childActive ? styles.childAssetActive : styles.childAsset} ${compact.subtypeBtn} ${
              isEntering ? anim.navItemEnter : ''
            }`}
            style={isEntering ? enteringStyle(staggerIndex) : undefined}
            onClick={() => onOpenAsset?.(child)}
          >
            <ObjectTypeIcon compactNav />
            <span>{child.label}</span>
          </button>
        </div>
        {hasChildren && isOpen ? (
          <ul className={`${styles.childAssetList} ${compact.subtypeList}`}>
            <NavSubtypeBranch
              nodes={child.children}
              objectTypeId={objectTypeId}
              activeAssetKey={activeAssetKey}
              onOpenAsset={onOpenAsset}
              depth={depth + 1}
              openSubtypeNodes={openSubtypeNodes}
              toggleSubtypeNode={toggleSubtypeNode}
              enteringKeys={enteringKeys}
            />
          </ul>
        ) : null}
      </li>
    );
  });
}

export default function StudioL1Nav({ sections, activeAssetKey, onOpenAsset }) {
  const { enteringKeys, expandedParents } = useL1NavEnterAnimations(sections);
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(sections.map((section) => [section.id, Boolean(section.defaultOpen)])),
  );
  const [openObjectGroups, setOpenObjectGroups] = useState({});
  const [openSubtypeNodes, setOpenSubtypeNodes] = useState({});

  const activeSubtypeContext = useMemo(() => {
    if (!activeAssetKey?.startsWith('subtype-object:')) return null;
    const [, parentObjectTypeId, subtypeId] = activeAssetKey.split(':');
    const objectSection = sections.find((section) => section.id === 'objects');
    const objectAsset = objectSection?.assets.find((asset) => asset.id === parentObjectTypeId);
    if (!objectAsset?.children?.length) return null;
    const ancestorIds = findAncestorIds(objectAsset.children, subtypeId) ?? [];
    return { parentObjectTypeId, subtypeId, ancestorIds };
  }, [activeAssetKey, sections]);

  useEffect(() => {
    if (!activeSubtypeContext) return;
    setOpenObjectGroups((prev) => ({
      ...prev,
      [activeSubtypeContext.parentObjectTypeId]: true,
    }));
    setOpenSubtypeNodes((prev) => {
      const next = { ...prev };
      activeSubtypeContext.ancestorIds.forEach((id) => {
        next[id] = true;
      });
      return next;
    });
  }, [activeSubtypeContext]);

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleObjectGroup = (assetId) => {
    setOpenObjectGroups((prev) => ({
      ...prev,
      [assetId]: !(prev[assetId] ?? true),
    }));
  };

  const toggleSubtypeNode = (nodeId) => {
    setOpenSubtypeNodes((prev) => ({
      ...prev,
      [nodeId]: !(prev[nodeId] ?? true),
    }));
  };

  const isObjectGroupOpen = (assetId) =>
    openObjectGroups[assetId] ?? expandedParents[assetId] ?? true;

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
                    const taxonomyKey = taxonomyAssetKey(asset);
                    const isTaxonomyEntering =
                      section.id === 'taxonomies' && enteringKeys.has(taxonomyKey);
                    const taxonomyStagger = enteringKeys.get(taxonomyKey) ?? 0;

                    if (section.id === 'taxonomies') {
                      return (
                        <li
                          key={asset.id}
                          className={isTaxonomyEntering ? anim.navRowEnter : styles.assetGroup}
                        >
                          <div className={isTaxonomyEntering ? anim.navRowEnterInner : undefined}>
                            <button
                              type="button"
                              className={`${active ? styles.assetActive : styles.asset} ${
                                isTaxonomyEntering ? anim.navItemEnter : ''
                              }`}
                              style={isTaxonomyEntering ? enteringStyle(taxonomyStagger) : undefined}
                              onClick={() => onOpenAsset?.(asset)}
                            >
                              <ObjectTypeIcon />
                              <span className={styles.assetLabel}>{asset.label}</span>
                            </button>
                          </div>
                        </li>
                      );
                    }

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
                            {asset.subtypeCount > 0 && (
                              <span
                                className={anim.subtypeCountChip}
                                aria-label={`${asset.subtypeCount} subtype${asset.subtypeCount === 1 ? '' : 's'}`}
                              >
                                {asset.subtypeCount}
                              </span>
                            )}
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
                          <ul className={`${styles.childAssetList} ${compact.subtypeList}`}>
                            <NavSubtypeBranch
                              nodes={asset.children}
                              objectTypeId={asset.id}
                              activeAssetKey={activeAssetKey}
                              onOpenAsset={onOpenAsset}
                              depth={0}
                              openSubtypeNodes={openSubtypeNodes}
                              toggleSubtypeNode={toggleSubtypeNode}
                              enteringKeys={enteringKeys}
                            />
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
