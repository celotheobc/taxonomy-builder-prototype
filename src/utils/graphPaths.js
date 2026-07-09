import { hasObjectCycle } from '../data/cycleDetection';
import { objects } from '../data/mockData';
import {
  DEMO_VENDOR_HUB_ID,
  DEMO_VENDOR_HUB_PATHS,
} from '../data/demoScenario';

function objectName(id) {
  return objects.find((o) => o.id === id)?.name ?? id;
}

export function objectTouchesIncluded(objectId, includedSet, relationships) {
  if (!includedSet?.size) return true;
  for (const r of relationships) {
    if (includedSet.has(r.source) && r.target === objectId) return true;
    if (includedSet.has(r.target) && r.source === objectId) return true;
  }
  return false;
}

function pathKey(relationshipIds) {
  return [...relationshipIds].sort().join('|');
}

function buildPathFromRelChain(startId, relationshipIds, relationshipList) {
  const objectIds = [startId];
  let current = startId;
  for (const relId of relationshipIds) {
    const rel = relationshipList.find((r) => r.id === relId);
    if (!rel) return null;
    const next = rel.source === current ? rel.target : rel.source;
    objectIds.push(next);
    current = next;
  }
  return {
    relationshipIds,
    objectIds,
    label: objectIds.map(objectName).join(' → '),
  };
}

/** Curated routes for Vendor Hub demo — see demoScenario.js */
export function buildVendorHubConnectionPaths(includedSet, relationshipList) {
  return DEMO_VENDOR_HUB_PATHS.map(({ id, relIds, createsCycle }) => {
    const built = buildPathFromRelChain(DEMO_VENDOR_HUB_ID, relIds, relationshipList);
    if (!built) return null;
    const hitsIncluded = built.objectIds.some(
      (oid) => oid !== DEMO_VENDOR_HUB_ID && includedSet.has(oid),
    );
    if (!hitsIncluded || relIds.length < 2) return null;
    return {
      id,
      ...built,
      wouldCreateCycle:
        createsCycle ||
        pathWouldCreateObjectCycle(includedSet, built, relationshipList),
    };
  }).filter(Boolean);
}

/** Distinct relationship paths from a new object to any already-included object */
export function findPathsToIncluded(
  newObjectId,
  includedSet,
  relationshipList,
  { maxDepth = 6, maxPaths = 4, minHops = 1 } = {},
) {
  if (!includedSet?.size) return [];

  if (newObjectId === DEMO_VENDOR_HUB_ID) {
    return buildVendorHubConnectionPaths(includedSet, relationshipList);
  }

  const results = [];
  const seenKeys = new Set();
  const queue = [{ objectId: newObjectId, relIds: [], objectIds: [newObjectId] }];
  const visitCap = 120;
  let visits = 0;

  while (queue.length > 0 && results.length < maxPaths && visits < visitCap) {
    const { objectId, relIds, objectIds } = queue.shift();
    visits += 1;

    if (
      includedSet.has(objectId) &&
      objectId !== newObjectId &&
      relIds.length >= minHops
    ) {
      const key = pathKey(relIds);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push({
          id: `path-${results.length}`,
          relationshipIds: relIds,
          objectIds,
          label: objectIds.map(objectName).join(' → '),
        });
      }
      continue;
    }

    if (objectIds.length >= maxDepth) continue;

    for (const r of relationshipList) {
      let next = null;
      if (r.source === objectId) next = r.target;
      else if (r.target === objectId) next = r.source;
      else continue;
      if (objectIds.includes(next)) continue;

      queue.push({
        objectId: next,
        relIds: [...relIds, r.id],
        objectIds: [...objectIds, next],
      });
    }
  }

  return results.sort((a, b) => a.relationshipIds.length - b.relationshipIds.length);
}

/** Whether applying this bridge path would introduce an object relationship cycle */
export function pathWouldCreateObjectCycle(includedSet, path, relationshipList) {
  const trial = new Set(includedSet);
  for (const objectId of path.objectIds) trial.add(objectId);
  return hasObjectCycle(trial, relationshipList);
}
