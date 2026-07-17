/** Taxonomy hierarchy helpers and demo structures. */

export const UNGROUPED_GROUP_ID = '__ungrouped__';

export function createGroupId(label) {
  return `${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
}

export function createEmptyHierarchy() {
  return { groups: [] };
}

export function getVisibleSubtypes(subtypes = []) {
  return subtypes.filter((subtype) => !subtype.hidden);
}

export function getAssignedMemberIds(groups = []) {
  const assigned = new Set();
  groups.forEach((group) => {
    group.memberIds.forEach((memberId) => assigned.add(memberId));
  });
  return assigned;
}

export function getUngroupedMemberIds(subtypes = [], groups = []) {
  const assigned = getAssignedMemberIds(groups);
  return getVisibleSubtypes(subtypes)
    .filter((subtype) => !assigned.has(subtype.id))
    .map((subtype) => subtype.id);
}

export function getGroupById(groups, groupId) {
  if (groupId === UNGROUPED_GROUP_ID) return null;
  return groups.find((group) => group.id === groupId) ?? null;
}

export function getChildGroups(groups, parentId = null) {
  return groups.filter((group) => (group.parentId ?? null) === parentId);
}

export function getDirectMemberSubtypes(group, subtypes) {
  if (!group) return [];
  return group.memberIds
    .map((memberId) => subtypes.find((subtype) => subtype.id === memberId))
    .filter(Boolean);
}

export function getSubtreeMemberIds(groupId, groups) {
  const ids = new Set();
  const group = getGroupById(groups, groupId);
  if (!group) return ids;

  group.memberIds.forEach((memberId) => ids.add(memberId));
  getChildGroups(groups, groupId).forEach((child) => {
    getSubtreeMemberIds(child.id, groups).forEach((memberId) => ids.add(memberId));
  });
  return ids;
}

export function getGroupMemberCount(groupId, groups, subtypes) {
  if (groupId === UNGROUPED_GROUP_ID) {
    return getUngroupedMemberIds(subtypes, groups).length;
  }
  return getSubtreeMemberIds(groupId, groups).size;
}

export function getMemberGroups(memberId, groups) {
  return groups.filter((group) => group.memberIds.includes(memberId));
}

export function getDescendantGroupIds(groupId, groups) {
  const ids = [groupId];
  getChildGroups(groups, groupId).forEach((child) => {
    getDescendantGroupIds(child.id, groups).forEach((id) => ids.push(id));
  });
  return ids;
}

export function getHierarchyDepth(groups) {
  if (!groups.length) return 0;

  function depthFor(parentId) {
    const children = getChildGroups(groups, parentId);
    if (!children.length) return 1;
    return 1 + Math.max(...children.map((child) => depthFor(child.id)));
  }

  return depthFor(null);
}

export function countGroups(groups) {
  return groups.length;
}

export function buildNavTree(groups, subtypes) {
  const ungroupedCount = getUngroupedMemberIds(subtypes, groups).length;

  function buildNodes(parentId, depth = 0) {
    return getChildGroups(groups, parentId).map((group) => ({
      id: group.id,
      label: group.label,
      depth,
      memberCount: getGroupMemberCount(group.id, groups, subtypes),
      children: buildNodes(group.id, depth + 1),
    }));
  }

  return {
    roots: buildNodes(null),
    ungrouped: {
      id: UNGROUPED_GROUP_ID,
      label: 'Ungrouped',
      depth: 0,
      memberCount: ungroupedCount,
      children: [],
    },
  };
}

export const DEMO_HIERARCHIES = {
  'taxonomy-jira-issue-issue-type': {
    groups: [
      {
        id: 'planning',
        label: 'Planning',
        description: 'Work used to define scope and break down delivery.',
        parentId: null,
        memberIds: ['epic', 'story'],
      },
      {
        id: 'execution',
        label: 'Execution',
        description: 'Operational work items used to complete delivery.',
        parentId: null,
        memberIds: ['task'],
      },
      {
        id: 'quality',
        label: 'Quality',
        description: 'Defect and quality-related issue categories.',
        parentId: null,
        memberIds: ['bug'],
      },
    ],
  },
  'taxonomy-facility-facility-type': {
    groups: [
      {
        id: 'operational-sites',
        label: 'Operational sites',
        description: 'Core facility subtypes that extend the shared Facility object.',
        parentId: null,
        memberIds: ['manufacturing-facility', 'warehouse', 'distribution-centre'],
      },
      {
        id: 'customer-facing',
        label: 'Customer-facing',
        description: 'Facilities that serve customers directly.',
        parentId: null,
        memberIds: ['retail-store', 'office'],
      },
    ],
  },
};

export function getDemoHierarchy(taxonomyId) {
  return DEMO_HIERARCHIES[taxonomyId] ?? createEmptyHierarchy();
}
