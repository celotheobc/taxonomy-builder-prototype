import { OBJECT_TYPE_IDS } from '../../../data/mockObjectTypes';
import { buildL1NavChildren } from '../../../data/taxonomyTreeModel';

export const L1_QUICK_LINKS = [
  { id: 'browse-context', label: 'Browse Context Model', assetType: 'placeholder' },
  { id: 'explore-data', label: 'Explore Data', assetType: 'placeholder' },
];

export const BASE_L1_SECTIONS = [
  {
    id: 'objects',
    label: 'Object Types',
    icon: 'object',
    defaultOpen: true,
    assets: [
      { id: 'jira-issue', label: 'Jira Issue', assetType: 'object-type' },
      { id: 'facility', label: 'Facility', assetType: 'object-type' },
    ],
  },
  {
    id: 'taxonomies',
    label: 'Taxonomies',
    icon: 'taxonomy',
    defaultOpen: true,
    assets: [],
  },
  {
    id: 'event-types',
    label: 'Event Types',
    icon: 'event',
    assets: [],
  },
  {
    id: 'relationships',
    label: 'Relationships',
    icon: 'relationship',
    assets: [],
  },
];

export function tabIconForType(type) {
  if (type === 'object-type' || type === 'subtype-object') return 'object';
  if (type === 'taxonomy') return 'taxonomy';
  return 'asset';
}

export function createObjectTypeTab(objectTypeId, label) {
  return {
    id: `tab-object-${objectTypeId}`,
    label,
    type: 'object-type',
    icon: tabIconForType('object-type'),
    assetKey: `object-type:${objectTypeId}`,
    objectTypeId,
    closable: true,
  };
}

export function createSubtypeObjectTab(parentObjectTypeId, subtype) {
  return {
    id: `tab-subtype-${parentObjectTypeId}-${subtype.id}`,
    label: subtype.label,
    type: 'subtype-object',
    icon: tabIconForType('subtype-object'),
    assetKey: `subtype-object:${parentObjectTypeId}:${subtype.id}`,
    parentObjectTypeId,
    subtypeId: subtype.id,
    closable: true,
  };
}

export function createTaxonomyTab(taxonomy) {
  return {
    id: `tab-taxonomy-${taxonomy.id}`,
    label: taxonomy.name,
    type: 'taxonomy',
    icon: tabIconForType('taxonomy'),
    assetKey: `taxonomy:${taxonomy.id}`,
    taxonomyId: taxonomy.id,
    closable: true,
  };
}

export function buildL1Sections(generatedTaxonomies = [], treeByObjectId = {}) {
  return BASE_L1_SECTIONS.map((section) => {
    if (section.id === 'objects') {
      return {
        ...section,
        assets: section.assets.map((asset) => {
          const nodes = treeByObjectId[asset.id]?.nodes ?? [];
          return {
            ...asset,
            subtypeCount: nodes.length,
            children: buildL1NavChildren(nodes, null, asset.id),
          };
        }),
      };
    }

    if (section.id === 'taxonomies') {
      return {
        ...section,
        assets: generatedTaxonomies.map((taxonomy) => ({
          id: taxonomy.id,
          label: taxonomy.name,
          assetType: 'taxonomy',
          parentObjectTypeId: taxonomy.sourceObjectTypeId,
        })),
      };
    }

    return section;
  });
}

export function buildTreeByObjectId(getSplitState) {
  const result = {};
  OBJECT_TYPE_IDS.forEach((objectTypeId) => {
    result[objectTypeId] = getSplitState(objectTypeId);
  });
  return result;
}
