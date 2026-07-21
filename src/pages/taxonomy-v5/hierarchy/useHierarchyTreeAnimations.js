import { useEffect, useRef, useState } from 'react';

const ANIMATION_MS = 520;

export function useHierarchyTreeAnimations(nodes, expandedNodeIds) {
  const seenNodeIdsRef = useRef(null);
  const prevExpandedRef = useRef(new Set(expandedNodeIds));
  const [enteringNodeIds, setEnteringNodeIds] = useState(() => new Set());
  const [expandingBranchParentIds, setExpandingBranchParentIds] = useState(() => new Set());

  useEffect(() => {
    const prevExpanded = prevExpandedRef.current;
    const nextExpanded = new Set(expandedNodeIds);
    const newlyExpanded = [];

    nextExpanded.forEach((id) => {
      if (!prevExpanded.has(id)) newlyExpanded.push(id);
    });
    prevExpandedRef.current = nextExpanded;

    if (newlyExpanded.length) {
      setExpandingBranchParentIds(new Set(newlyExpanded));
    }
  }, [expandedNodeIds]);

  useEffect(() => {
    const currentIds = nodes.map((node) => node.id);
    const prevSeen = seenNodeIdsRef.current ?? new Set();
    const newNodes = nodes.filter((node) => !prevSeen.has(node.id));
    seenNodeIdsRef.current = new Set(currentIds);

    if (!newNodes.length) return undefined;

    setEnteringNodeIds(new Set(newNodes.map((node) => node.id)));
    return undefined;
  }, [nodes]);

  useEffect(() => {
    if (!enteringNodeIds.size && !expandingBranchParentIds.size) return undefined;

    const timeout = window.setTimeout(() => {
      setEnteringNodeIds(new Set());
      setExpandingBranchParentIds(new Set());
    }, ANIMATION_MS + 40);

    return () => window.clearTimeout(timeout);
  }, [enteringNodeIds, expandingBranchParentIds]);

  return { enteringNodeIds, expandingBranchParentIds };
}
