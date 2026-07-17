import {
  buildSubtypeTemplates,
  buildTaxonomyAsset,
  getObjectType,
} from './mockObjectTypes';
import { getDemoHierarchy } from './taxonomyHierarchy';

function buildSplit(objectTypeId, attributeId, matchingValues) {
  const objectType = getObjectType(objectTypeId);
  const subtypes = buildSubtypeTemplates(objectType, attributeId, matchingValues).map((subtype) => ({
    ...subtype,
    description: subtype.description ?? '',
  }));
  const taxonomy = buildTaxonomyAsset(objectType, attributeId, subtypes);

  return {
    subtypes,
    taxonomy,
    hierarchy: getDemoHierarchy(taxonomy.id),
  };
}

export function buildSeedWorkspaceState() {
  const jiraSplit = buildSplit('jira-issue', 'issue-type', ['Epic', 'Story', 'Bug', 'Task']);
  const facilitySplit = buildSplit('facility', 'facility-type', [
    'Manufacturing Facility',
    'Warehouse',
    'Distribution Centre',
    'Retail Store',
    'Office',
  ]);

  return {
    'jira-issue': {
      uiMode: 'creation',
      selectedAttributeId: 'issue-type',
      splitsByAttributeId: {
        'issue-type': {
          subtypes: jiraSplit.subtypes,
          taxonomy: jiraSplit.taxonomy,
        },
      },
    },
    facility: {
      uiMode: 'creation',
      selectedAttributeId: 'facility-type',
      splitsByAttributeId: {
        'facility-type': {
          subtypes: facilitySplit.subtypes,
          taxonomy: facilitySplit.taxonomy,
        },
      },
    },
  };
}

export function buildSeedHierarchyState() {
  return {
    'taxonomy-jira-issue-issue-type': getDemoHierarchy('taxonomy-jira-issue-issue-type'),
    'taxonomy-facility-facility-type': getDemoHierarchy('taxonomy-facility-facility-type'),
  };
}
