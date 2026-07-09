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
  const factorySplit = buildSplit('factory', 'country', [
    'France',
    'Germany',
    'Italy',
    'Spain',
    'Portugal',
    'Japan',
    'China',
    'Thailand',
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
    factory: {
      uiMode: 'creation',
      selectedAttributeId: 'country',
      splitsByAttributeId: {
        country: {
          subtypes: factorySplit.subtypes,
          taxonomy: factorySplit.taxonomy,
        },
      },
    },
  };
}

export function buildSeedHierarchyState() {
  return {
    'taxonomy-jira-issue-issue-type': getDemoHierarchy('taxonomy-jira-issue-issue-type'),
    'taxonomy-factory-country': getDemoHierarchy('taxonomy-factory-country'),
  };
}
