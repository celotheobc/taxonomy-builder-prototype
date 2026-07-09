import { objects, relationships as allRelationships } from './mockData';
import {
  DEMO_CYCLE_EDGE_IDS,
  DEMO_CYCLE_QUARTET,
} from './demoScenario';

/** @deprecated Use DEMO_CYCLE_QUARTET from demoScenario.js */
export const CYCLE_CORE_OBJECTS = DEMO_CYCLE_QUARTET;

/** @deprecated Use DEMO_CYCLE_EDGE_IDS from demoScenario.js */
export const DEMO_CYCLE_REL_IDS = DEMO_CYCLE_EDGE_IDS;

function objectName(id) {
  return objects.find((o) => o.id === id)?.name ?? id;
}

function buildAdjacency(rels) {
  const adj = new Map();
  for (const r of rels) {
    if (!adj.has(r.source)) adj.set(r.source, []);
    if (!adj.has(r.target)) adj.set(r.target, []);
    adj.get(r.source).push({ node: r.target, relId: r.id });
    adj.get(r.target).push({ node: r.source, relId: r.id });
  }
  return adj;
}

/** Edges whose removal disconnects a leaf branch (not on any cycle) */
function findBridgeRelIds(rels) {
  const adj = buildAdjacency(rels);
  const visited = new Set();
  const disc = new Map();
  const low = new Map();
  const parent = new Map();
  const bridges = new Set();
  let time = 0;

  const dfs = (u) => {
    visited.add(u);
    disc.set(u, (time += 1));
    low.set(u, time);

    for (const { node: v, relId } of adj.get(u) ?? []) {
      if (!visited.has(v)) {
        parent.set(v, { u, relId });
        dfs(v);
        low.set(u, Math.min(low.get(u), low.get(v)));
        if (low.get(v) > disc.get(u)) {
          bridges.add(relId);
        }
      } else if (parent.get(u)?.u !== v) {
        low.set(u, Math.min(low.get(u), disc.get(v)));
      }
    }
  };

  for (const u of adj.keys()) {
    if (!visited.has(u)) dfs(u);
  }

  return bridges;
}

function collectCycleEdgesOnPath(u, v, closeRelId, parent) {
  const edges = new Set([closeRelId]);
  const seen = new Set();
  let cur = u;
  while (cur != null && !seen.has(cur)) {
    seen.add(cur);
    const p = parent.get(cur);
    if (!p?.u) break;
    edges.add(p.relId);
    cur = p.u;
  }
  cur = v;
  while (cur != null && !seen.has(cur)) {
    seen.add(cur);
    const p = parent.get(cur);
    if (!p?.u) break;
    edges.add(p.relId);
    cur = p.u;
  }
  return edges;
}

/** Shortest simple cycle length (girth) among included object relationships */
function findGirth(rels) {
  const adj = buildAdjacency(rels);
  let girth = Infinity;

  for (const start of adj.keys()) {
    const dist = new Map([[start, 0]]);
    const parent = new Map([[start, null]]);
    const queue = [start];

    while (queue.length > 0) {
      const u = queue.shift();
      for (const { node: v, relId } of adj.get(u) ?? []) {
        if (!dist.has(v)) {
          dist.set(v, dist.get(u) + 1);
          parent.set(v, { u, relId });
          queue.push(v);
        } else if (parent.get(u)?.u !== v) {
          girth = Math.min(girth, dist.get(u) + dist.get(v) + 1);
        }
      }
    }
  }

  return girth === Infinity ? null : girth;
}

/** All edge ids that appear on a cycle of exactly `girth` length */
function findEdgesOnShortestCycles(rels, girth) {
  const adj = buildAdjacency(rels);
  const edgeIds = new Set();

  for (const start of adj.keys()) {
    const dist = new Map([[start, 0]]);
    const parent = new Map([[start, null]]);
    const queue = [start];

    while (queue.length > 0) {
      const u = queue.shift();
      for (const { node: v, relId } of adj.get(u) ?? []) {
        if (!dist.has(v)) {
          dist.set(v, dist.get(u) + 1);
          parent.set(v, { u, relId });
          queue.push(v);
        } else if (parent.get(u)?.u !== v) {
          const len = dist.get(u) + dist.get(v) + 1;
          if (len === girth) {
            collectCycleEdgesOnPath(u, v, relId, parent).forEach((id) =>
              edgeIds.add(id),
            );
          }
        }
      }
    }
  }

  return edgeIds;
}

/**
 * Relationship ids the user can prune to break ambiguity.
 * Only edges on a shortest cycle — not tree branches (bridges) or longer peripheral loops.
 */
export function findCycleEdgeIds(includedObjects, relationshipList = allRelationships) {
  const rels = relationshipList.filter(
    (r) => includedObjects.has(r.source) && includedObjects.has(r.target),
  );
  if (rels.length < 3) return new Set();

  const girth = findGirth(rels);
  if (!girth) return new Set();

  const shortestCycleEdges = findEdgesOnShortestCycles(rels, girth);
  if (shortestCycleEdges.size > 0) {
    return shortestCycleEdges;
  }

  const bridges = findBridgeRelIds(rels);
  const cyclic = new Set();
  for (const r of rels) {
    if (!bridges.has(r.id)) cyclic.add(r.id);
  }
  return cyclic;
}

export function hasObjectCycle(includedObjects, relationshipList) {
  return findCycleEdgeIds(includedObjects, relationshipList).size > 0;
}

export function getRelationshipPrunePreview(relId, relationshipList = allRelationships) {
  const rel = relationshipList.find((r) => r.id === relId);
  if (!rel) {
    return {
      title: 'Remove this relationship',
      detail: 'This removes one connection in the loop.',
    };
  }
  const title = `Remove relationship: ${objectName(rel.source)} → ${objectName(rel.target)}`;
  const detail =
    rel.target === 'delivery-item' || rel.source === 'delivery-item'
      ? 'This will remove one path to Delivery Item.'
      : 'This removes one connection in the shortest loop.';
  return { title, detail };
}
