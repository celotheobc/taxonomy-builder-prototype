/** Central mock data for Object Type taxonomy prototype. */

export const GROUP_LABELS = {
  europe: 'Europe',
  asia: 'Asia',
};

export const OBJECT_TYPE_IDS = ['jira-issue', 'factory'];

const JIRA_ISSUE = {
  id: 'jira-issue',
  name: 'Jira Issue',
  label: 'Jira Issue',
  domain: 'Work Management',
  status: 'Draft',
  metadata: {
    assetName: 'Jira Issue',
    status: 'Draft',
    type: 'Object Type',
    referenceKey: 'jira_issue',
    namespace: 'Custom',
    createdBy: 'Theo Bonham Carter',
    lastUpdatedBy: 'Theo Bonham Carter',
    description:
      'A work item tracked in Jira. Used for planning, delivery, and defect tracking across teams.',
  },
  defaultSplitAttributeId: 'issue-type',
  splitCandidates: {
    'issue-id': { distinctValueCount: 7500, recommendation: 'Not recommended', uniquenessPercent: 100 },
    'issue-type': { distinctValueCount: 4, recommendation: 'Recommended', uniquenessPercent: 33 },
    status: { distinctValueCount: 5, recommendation: 'Recommended', uniquenessPercent: 28 },
    priority: { distinctValueCount: 4, recommendation: 'Recommended', uniquenessPercent: 22 },
    team: { distinctValueCount: 18, recommendation: 'Caution', uniquenessPercent: 4 },
    assignee: { distinctValueCount: 82, recommendation: 'Caution', uniquenessPercent: 1 },
    'created-date': { distinctValueCount: 2000, recommendation: 'Not recommended', uniquenessPercent: 27 },
  },
  attributes: [
    { id: 'issue-type', name: 'Issue Type', dataType: 'STRING', bindingStatus: 'Bound', source: 'ISSUES.ISSUE_TYPE' },
    { id: 'issue-id', name: 'Issue ID', dataType: 'STRING', bindingStatus: 'Bound', source: 'ISSUES.ISSUE_KEY' },
    { id: 'status', name: 'Status', dataType: 'STRING', bindingStatus: 'Bound', source: 'ISSUES.STATUS' },
    { id: 'priority', name: 'Priority', dataType: 'STRING', bindingStatus: 'Bound', source: 'ISSUES.PRIORITY' },
    { id: 'team', name: 'Team', dataType: 'STRING', bindingStatus: 'Bound', source: 'ISSUES.TEAM' },
    { id: 'assignee', name: 'Assignee', dataType: 'STRING', bindingStatus: 'Partial (1/2)', source: 'ISSUES.ASSIGNEE' },
    { id: 'created-date', name: 'Created Date', dataType: 'DATE', bindingStatus: 'Bound', source: 'ISSUES.CREATED_AT' },
  ],
  bindings: [
    {
      id: 'jira-issues-primary',
      name: 'jira_issues_binding',
      table: 'ISSUES',
      schema: 'JIRA',
      status: 'Bound',
      mappedColumns: '7 / 7',
    },
  ],
  relationships: [
    {
      id: 'issue-epic',
      name: 'Issue belongs to Epic',
      target: 'Epic',
      cardinality: 'N:1',
      joinTable: 'ISSUES → EPICS',
      type: 'Type-to-Type',
    },
    {
      id: 'issue-sprint',
      name: 'Issue assigned to Sprint',
      target: 'Sprint',
      cardinality: 'N:1',
      joinTable: 'ISSUES → SPRINTS',
      type: 'Type-to-Type',
    },
    {
      id: 'issue-commented',
      name: 'Issue commented on',
      target: 'Comment Added',
      cardinality: '1:N',
      joinTable: 'E2O',
      type: 'Object-to-Event',
    },
  ],
  graphNeighbors: [
    { id: 'epic', label: 'Epic', kind: 'object', angle: -90 },
    { id: 'sprint', label: 'Sprint', kind: 'object', angle: -18 },
    { id: 'comment-added', label: 'Comment Added', kind: 'event', angle: 54 },
    { id: 'team', label: 'Team', kind: 'object', angle: 126 },
    { id: 'status-changed', label: 'Status Changed', kind: 'event', angle: 198 },
  ],
  agentContext: `## Jira Issue

### Description
Work items for agile delivery — epics, stories, bugs, and tasks.

### Special instructions
- When subtypes exist, prefer subtype names (Epic, Story, Bug, Task) over raw Issue Type values.
- Status and Priority are useful filters but are not subtype dimensions in V1.`,
  attributeValues: {
    'issue-id': [
      { value: 'PROJ-101', recordCount: 1 },
      { value: 'PROJ-102', recordCount: 1 },
      { value: 'PROJ-103', recordCount: 1 },
      { value: 'PROJ-104', recordCount: 1 },
      { value: 'PROJ-118', recordCount: 1 },
    ],
    'issue-type': [
      { value: 'Epic', recordCount: 124 },
      { value: 'Story', recordCount: 4821 },
      { value: 'Bug', recordCount: 967 },
      { value: 'Task', recordCount: 2103 },
    ],
    status: [
      { value: 'To Do', recordCount: 1204 },
      { value: 'In Progress', recordCount: 892 },
      { value: 'Done', recordCount: 5919 },
    ],
    priority: [
      { value: 'Highest', recordCount: 312 },
      { value: 'High', recordCount: 1840 },
      { value: 'Medium', recordCount: 4201 },
      { value: 'Low', recordCount: 662 },
    ],
    team: [
      { value: 'Platform', recordCount: 2140 },
      { value: 'Delivery', recordCount: 1893 },
      { value: 'Ops', recordCount: 982 },
      { value: 'Design', recordCount: 745 },
      { value: 'Data', recordCount: 540 },
    ],
    assignee: [
      { value: 'Alex Chen', recordCount: 412 },
      { value: 'Sam Rivera', recordCount: 388 },
      { value: 'Jordan Lee', recordCount: 351 },
    ],
    'created-date': [
      { value: '2024-01-15', recordCount: 890 },
      { value: '2024-03-22', recordCount: 812 },
      { value: '2024-06-08', recordCount: 298 },
    ],
  },
  subtypeTemplates: {
    'issue-type': [
      { id: 'epic', label: 'Epic', matchingValue: 'Epic', recordCount: 124 },
      { id: 'story', label: 'Story', matchingValue: 'Story', recordCount: 4821 },
      { id: 'bug', label: 'Bug', matchingValue: 'Bug', recordCount: 967 },
      { id: 'task', label: 'Task', matchingValue: 'Task', recordCount: 2103 },
    ],
  },
  inheritedAttributes: ['Issue ID', 'Status', 'Priority', 'Team', 'Assignee', 'Created Date'],
  inheritedRelationships: ['Issue belongs to Epic', 'Issue assigned to Sprint'],
};

const FACTORY = {
  id: 'factory',
  name: 'Factory',
  label: 'Factory',
  domain: 'Operations',
  status: 'Draft',
  metadata: {
    assetName: 'Factory',
    status: 'Draft',
    type: 'Object Type',
    referenceKey: 'factory',
    namespace: 'Custom',
    createdBy: 'Theo Bonham Carter',
    lastUpdatedBy: 'Theo Bonham Carter',
    description:
      'Manufacturing sites and plants. Country is used to split factories into regional subtypes for reporting.',
  },
  defaultSplitAttributeId: 'country',
  splitCandidates: {
    'factory-id': { distinctValueCount: 91, recommendation: 'Not recommended', uniquenessPercent: 100 },
    'factory-name': { distinctValueCount: 91, recommendation: 'Caution', uniquenessPercent: 100 },
    country: { distinctValueCount: 6, recommendation: 'Recommended', uniquenessPercent: 7 },
    region: { distinctValueCount: 2, recommendation: 'Recommended', uniquenessPercent: 2 },
    'factory-type': { distinctValueCount: 3, recommendation: 'Recommended', uniquenessPercent: 3 },
    status: { distinctValueCount: 2, recommendation: 'Caution', uniquenessPercent: 2 },
  },
  attributes: [
    { id: 'factory-id', name: 'Factory ID', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACTORIES.FACTORY_ID' },
    { id: 'factory-name', name: 'Factory Name', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACTORIES.NAME' },
    { id: 'country', name: 'Country', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACTORIES.COUNTRY' },
    { id: 'region', name: 'Region', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACTORIES.REGION' },
    { id: 'factory-type', name: 'Factory Type', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACTORIES.TYPE' },
    { id: 'status', name: 'Status', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACTORIES.STATUS' },
  ],
  bindings: [
    {
      id: 'factories-primary',
      name: 'factories_binding',
      table: 'FACTORIES',
      schema: 'OPS',
      status: 'Bound',
      mappedColumns: '6 / 6',
    },
  ],
  relationships: [
    {
      id: 'factory-production-line',
      name: 'Factory has Production Line',
      target: 'Production Line',
      cardinality: '1:N',
      joinTable: 'FACTORIES → PRODUCTION_LINES',
      type: 'Type-to-Type',
    },
    {
      id: 'factory-shipment',
      name: 'Factory ships goods',
      target: 'Shipment Created',
      cardinality: '1:N',
      joinTable: 'E2O',
      type: 'Object-to-Event',
    },
  ],
  graphNeighbors: [
    { id: 'production-line', label: 'Production Line', kind: 'object', angle: -70 },
    { id: 'shipment', label: 'Shipment Created', kind: 'event', angle: 10 },
    { id: 'supplier', label: 'Supplier', kind: 'object', angle: 90 },
    { id: 'region', label: 'Region', kind: 'object', angle: 170 },
  ],
  agentContext: `## Factory

### Description
Manufacturing plants used in supply chain and operations analysis.

### Special instructions
- Subtypes are derived from **Country**. Future grouping may roll up to Europe and Asia regions.
- Factory Type and Status remain on the base object type.`,
  attributeValues: {
    country: [
      { value: 'France', recordCount: 12 },
      { value: 'Germany', recordCount: 18 },
      { value: 'Spain', recordCount: 9 },
      { value: 'Japan', recordCount: 14 },
      { value: 'China', recordCount: 31 },
      { value: 'Thailand', recordCount: 7 },
    ],
    region: [
      { value: 'Europe', recordCount: 39 },
      { value: 'Asia', recordCount: 52 },
    ],
  },
  subtypeTemplates: {
    country: [
      { id: 'france', label: 'France', matchingValue: 'France', recordCount: 12, groupKey: 'europe' },
      { id: 'germany', label: 'Germany', matchingValue: 'Germany', recordCount: 18, groupKey: 'europe' },
      { id: 'spain', label: 'Spain', matchingValue: 'Spain', recordCount: 9, groupKey: 'europe' },
      { id: 'japan', label: 'Japan', matchingValue: 'Japan', recordCount: 14, groupKey: 'asia' },
      { id: 'china', label: 'China', matchingValue: 'China', recordCount: 31, groupKey: 'asia' },
      { id: 'thailand', label: 'Thailand', matchingValue: 'Thailand', recordCount: 7, groupKey: 'asia' },
    ],
  },
  inheritedAttributes: ['Factory ID', 'Factory Name', 'Region', 'Factory Type', 'Status'],
  inheritedRelationships: ['Factory has Production Line', 'Factory ships goods'],
};

export const OBJECT_TYPES = {
  'jira-issue': JIRA_ISSUE,
  factory: FACTORY,
};

export function getObjectType(id) {
  return OBJECT_TYPES[id] ?? null;
}

export function getBoundAttributes(objectType) {
  return objectType.attributes.filter(
    (attr) => attr.bindingStatus === 'Bound' || attr.bindingStatus.startsWith('Partial'),
  );
}

export function getAttribute(objectType, attributeId) {
  return objectType.attributes.find((attr) => attr.id === attributeId) ?? null;
}

export function getDetectedValues(objectType, attributeId) {
  return objectType.attributeValues[attributeId] ?? [];
}

export function getDetectedValueCount(objectType, attributeId) {
  const candidate = objectType.splitCandidates?.[attributeId];
  if (candidate?.distinctValueCount != null) return candidate.distinctValueCount;
  return getDetectedValues(objectType, attributeId).length;
}

export function canGenerateSubtypesFromAttribute(objectType, attributeId) {
  const candidate = getAttributeSplitCandidate(objectType, attributeId);
  if (candidate.recommendation === 'Not recommended') return false;
  const values = getDetectedValues(objectType, attributeId);
  return values.length > 0 && Boolean(objectType.subtypeTemplates?.[attributeId]?.length);
}

export function getAttributeSplitCandidate(objectType, attributeId) {
  const candidate = objectType.splitCandidates?.[attributeId];
  if (candidate) return candidate;

  const values = getDetectedValues(objectType, attributeId);
  const attribute = getAttribute(objectType, attributeId);
  if (!attribute || attribute.bindingStatus === 'Unbound') {
    return { distinctValueCount: 0, recommendation: 'Not recommended', uniquenessPercent: 0 };
  }
  if (!values.length) {
    return { distinctValueCount: 0, recommendation: 'Not recommended', uniquenessPercent: 0 };
  }
  if (values.length > 50) {
    return { distinctValueCount: values.length, recommendation: 'Caution', uniquenessPercent: 5 };
  }
  return { distinctValueCount: values.length, recommendation: 'Recommended', uniquenessPercent: 25 };
}

export function formatUniqueValueCount(count) {
  return `${count.toLocaleString()} unique value${count === 1 ? '' : 's'}`;
}

export function getAttributeTotalRows(objectType, attributeId) {
  const values = getDetectedValues(objectType, attributeId);
  if (values.length) {
    return values.reduce((sum, item) => sum + item.recordCount, 0);
  }
  return getDetectedValueCount(objectType, attributeId);
}

export function formatUniquenessPercent(percent) {
  return `${percent}% uniqueness`;
}

export function buildSubtypeTemplates(objectType, attributeId, selectedMatchingValues = null) {
  const templates = (objectType.subtypeTemplates[attributeId] ?? []).map((subtype) => ({
    ...subtype,
    hidden: false,
  }));
  if (!selectedMatchingValues?.length) return templates;
  const selected = new Set(selectedMatchingValues);
  return templates.filter((subtype) => selected.has(subtype.matchingValue));
}

export function buildTaxonomyAsset(objectType, attributeId, subtypes) {
  const attribute = getAttribute(objectType, attributeId);
  return {
    id: `taxonomy-${objectType.id}-${attributeId}`,
    name: `${objectType.name} by ${attribute?.name ?? 'Attribute'}`,
    type: 'Taxonomy',
    status: 'Generated',
    referenceKey: `taxonomy.${objectType.id}.${attributeId.replace(/-/g, '_')}`,
    createdBy: 'System',
    lastUpdatedBy: 'System',
    generatedAt: new Date().toISOString(),
    sourceObjectTypeId: objectType.id,
    sourceObjectTypeName: objectType.name,
    splitAttributeId: attributeId,
    splitAttributeName: attribute?.name ?? '',
    subtypeCount: subtypes.filter((s) => !s.hidden).length,
    subtypes,
    description: `This taxonomy was generated from the ${objectType.name} Object Type by splitting the ${attribute?.name ?? 'selected'} attribute.`,
  };
}
