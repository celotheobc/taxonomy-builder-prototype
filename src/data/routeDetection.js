/** @deprecated Route A/B model — cycles resolved per-edge via cycleDetection.js */
import {
  CYCLE_CORE_OBJECTS,
  findCycleEdgeIds,
  hasObjectCycle,
  getRelationshipPrunePreview,
} from './cycleDetection';

export const ROUTE_AMBIGUITY_OBJECTS = CYCLE_CORE_OBJECTS;

export function hasRouteAmbiguity(includedObjects) {
  return hasObjectCycle(includedObjects);
}

export function getExcludedRelationships(_selectedRouteId, prunedRelationshipIds) {
  return new Set(prunedRelationshipIds);
}

export function getPrunePreviewMessage(relId) {
  const { title, detail } = getRelationshipPrunePreview(relId);
  return `${title}. ${detail}`;
}

export function findCycleEdges(includedObjects, relationshipList) {
  return findCycleEdgeIds(includedObjects, relationshipList);
}
