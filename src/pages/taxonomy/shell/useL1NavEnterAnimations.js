import { useEffect, useRef, useState } from 'react';

const STAGGER_MS = 110;
const ANIMATION_MS = 520;

function childAssetKey(child) {
  return `subtype-object:${child.parentObjectTypeId}:${child.id}`;
}

function taxonomyAssetKey(asset) {
  return `taxonomy:${asset.id}`;
}

function collectNavKeys(sections) {
  const keys = new Map();

  sections.forEach((section) => {
    if (section.id === 'objects') {
      section.assets.forEach((asset) => {
        (asset.children ?? []).forEach((child, index) => {
          keys.set(childAssetKey(child), {
            type: 'child',
            parentId: asset.id,
            staggerIndex: index,
          });
        });
      });
    }

    if (section.id === 'taxonomies') {
      section.assets.forEach((asset, index) => {
        keys.set(taxonomyAssetKey(asset), {
          type: 'taxonomy',
          staggerIndex: index,
        });
      });
    }
  });

  return keys;
}

export function getEnterDelay(staggerIndex) {
  return staggerIndex * STAGGER_MS;
}

export function useL1NavEnterAnimations(sections) {
  const seenKeysRef = useRef(new Set());
  const [enteringKeys, setEnteringKeys] = useState(() => new Map());
  const [expandedParents, setExpandedParents] = useState({});

  useEffect(() => {
    const current = collectNavKeys(sections);
    const nextEntering = new Map();
    const parentsToOpen = {};
    const newChildrenByParent = {};
    const newTaxonomies = [];

    current.forEach((meta, key) => {
      if (seenKeysRef.current.has(key)) return;

      if (meta.type === 'child' && meta.parentId) {
        if (!newChildrenByParent[meta.parentId]) newChildrenByParent[meta.parentId] = [];
        newChildrenByParent[meta.parentId].push({ key, order: meta.staggerIndex });
        parentsToOpen[meta.parentId] = true;
        return;
      }

      if (meta.type === 'taxonomy') {
        newTaxonomies.push({ key, order: meta.staggerIndex });
      }
    });

    Object.values(newChildrenByParent).forEach((items) => {
      items
        .sort((a, b) => a.order - b.order)
        .forEach((item, index) => nextEntering.set(item.key, index));
    });

    newTaxonomies
      .sort((a, b) => a.order - b.order)
      .forEach((item, index) => nextEntering.set(item.key, index));

    seenKeysRef.current = new Set(current.keys());

    if (!nextEntering.size) return undefined;

    setEnteringKeys(nextEntering);
    if (Object.keys(parentsToOpen).length) {
      setExpandedParents((prev) => ({ ...prev, ...parentsToOpen }));
    }

    const maxStagger = Math.max(...nextEntering.values(), 0);
    const timeout = window.setTimeout(() => {
      setEnteringKeys(new Map());
    }, ANIMATION_MS + maxStagger * STAGGER_MS + 40);

    return () => window.clearTimeout(timeout);
  }, [sections]);

  return { enteringKeys, expandedParents };
}

export { childAssetKey, taxonomyAssetKey, STAGGER_MS };
