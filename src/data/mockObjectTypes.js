/** Central mock data for Object Type taxonomy prototype. */

export const GROUP_LABELS = {
  europe: 'Europe',
  asia: 'Asia',
  americas: 'Americas',
};

export const OBJECT_TYPE_IDS = ['jira-issue', 'facility'];

/** Attribute ids hidden from the Attributes table (still on the model for splits / data). */
export const OBJECT_TYPE_ATTRIBUTES_TABLE_HIDDEN = {};

function getAttributeDisplaySortRank(attribute) {
  const name = attribute.name.trim();
  if (/\bID$/i.test(name) || attribute.id.endsWith('-id')) return 0;
  if (/\bName$/i.test(name) || attribute.id.endsWith('-name')) return 1;
  return 2;
}

export function sortObjectTypeAttributes(attributes) {
  return [...attributes].sort((a, b) => {
    const rankDiff = getAttributeDisplaySortRank(a) - getAttributeDisplaySortRank(b);
    if (rankDiff !== 0) return rankDiff;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export function getObjectTypeTableAttributes(objectType) {
  if (!objectType) return [];
  const hidden = new Set(OBJECT_TYPE_ATTRIBUTES_TABLE_HIDDEN[objectType.id] ?? []);
  const visible = objectType.attributes.filter((attr) => !hidden.has(attr.id));
  return sortObjectTypeAttributes(visible);
}

export function getSplitAttributeOptions(objectType, usedAttributeIds = new Set()) {
  return getObjectTypeTableAttributes(objectType).filter((attr) => !usedAttributeIds.has(attr.id));
}

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
    'issue-id': {
      distinctValueCount: 7500,
      recommendation: 'Not recommended',
      uniquenessPercent: 100,
      reason: 'IDs identify individual records, not reusable object subtypes.',
    },
    'issue-type': {
      distinctValueCount: 4,
      recommendation: 'Recommended',
      uniquenessPercent: 33,
      reason:
        'Recommended because it has a small set of stable business categories that describe different kinds of Jira issues.',
    },
    status: {
      distinctValueCount: 5,
      recommendation: 'Caution',
      uniquenessPercent: 28,
      reason:
        'Caution because it has few values, but it may describe lifecycle state rather than object subtype.',
    },
    priority: {
      distinctValueCount: 4,
      recommendation: 'Recommended',
      uniquenessPercent: 22,
      reason:
        'Recommended because priority levels are stable categories that can imply different handling and analysis.',
    },
    team: {
      distinctValueCount: 18,
      recommendation: 'Caution',
      uniquenessPercent: 4,
      reason:
        'Caution because teams may be useful for filtering or ownership, but usually do not define different object types.',
    },
    assignee: {
      distinctValueCount: 12,
      recommendation: 'Caution',
      uniquenessPercent: 1,
      reason:
        'Caution because assignees are useful for ownership and filtering, but rarely represent distinct object subtypes.',
    },
    'created-date': {
      distinctValueCount: 10,
      recommendation: 'Not recommended',
      uniquenessPercent: 27,
      reason:
        'Not recommended because dates change over time and are better used for filtering or time analysis.',
    },
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
      { value: 'Done', recordCount: 5529 },
      { value: 'Blocked', recordCount: 234 },
      { value: 'Backlog', recordCount: 156 },
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
      { value: 'Security', recordCount: 318 },
      { value: 'Mobile', recordCount: 276 },
      { value: 'Infrastructure', recordCount: 241 },
      { value: 'QA', recordCount: 198 },
      { value: 'Growth', recordCount: 164 },
      { value: 'Support', recordCount: 142 },
      { value: 'Finance', recordCount: 118 },
      { value: 'Legal', recordCount: 96 },
      { value: 'Research', recordCount: 84 },
      { value: 'Customer Success', recordCount: 72 },
      { value: 'DevOps', recordCount: 61 },
      { value: 'Analytics', recordCount: 48 },
      { value: 'Content', recordCount: 37 },
    ],
    assignee: [
      { value: 'Alex Chen', recordCount: 412 },
      { value: 'Sam Rivera', recordCount: 388 },
      { value: 'Jordan Lee', recordCount: 351 },
      { value: 'Morgan Blake', recordCount: 296 },
      { value: 'Riley Park', recordCount: 274 },
      { value: 'Casey Nguyen', recordCount: 248 },
      { value: 'Taylor Brooks', recordCount: 221 },
      { value: 'Jamie Ortiz', recordCount: 205 },
      { value: 'Avery Kim', recordCount: 189 },
      { value: 'Quinn Patel', recordCount: 172 },
      { value: 'Drew Morgan', recordCount: 158 },
      { value: 'Skyler Reed', recordCount: 141 },
    ],
    'created-date': [
      { value: '2024-01-15', recordCount: 890 },
      { value: '2024-03-22', recordCount: 812 },
      { value: '2024-06-08', recordCount: 298 },
      { value: '2024-02-03', recordCount: 276 },
      { value: '2024-04-17', recordCount: 254 },
      { value: '2024-05-29', recordCount: 231 },
      { value: '2024-07-11', recordCount: 208 },
      { value: '2024-08-24', recordCount: 187 },
      { value: '2024-09-06', recordCount: 165 },
      { value: '2024-10-19', recordCount: 142 },
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

const FACILITY = {
  id: 'facility',
  name: 'Facility',
  label: 'Facility',
  domain: 'Operations',
  status: 'Draft',
  metadata: {
    assetName: 'Facility',
    status: 'Draft',
    type: 'Object Type',
    referenceKey: 'facility',
    namespace: 'Custom',
    createdBy: 'Theo Bonham Carter',
    lastUpdatedBy: 'Theo Bonham Carter',
    description:
      'Physical sites across the operating network. Facility is the shared parent object—every site inherits the common Facility attributes, while object subtypes (Manufacturing Facility, Warehouse, and so on) add specialised fields without duplicating the shared definition.',
  },
  defaultSplitAttributeId: 'facility-type',
  splitCandidates: {
    'facility-id': {
      distinctValueCount: 9,
      recommendation: 'Not recommended',
      uniquenessPercent: 100,
      reason: 'IDs identify individual records, not reusable object subtypes.',
    },
    'facility-name': {
      distinctValueCount: 9,
      recommendation: 'Not recommended',
      uniquenessPercent: 100,
      reason: 'Facility names identify individual sites, not stable subtype categories.',
    },
    country: {
      distinctValueCount: 9,
      recommendation: 'Caution',
      uniquenessPercent: 11,
      reason:
        'Caution because country creates many geographic subtypes; useful for regional taxonomies, not for operational facility kinds.',
    },
    city: {
      distinctValueCount: 9,
      recommendation: 'Not recommended',
      uniquenessPercent: 100,
      reason: 'City values are too granular and identify sites, not reusable business subtypes.',
    },
    status: {
      distinctValueCount: 1,
      recommendation: 'Caution',
      uniquenessPercent: 11,
      reason:
        'Caution because status describes lifecycle state rather than the kind of facility being modelled.',
    },
    'business-unit': {
      distinctValueCount: 6,
      recommendation: 'Caution',
      uniquenessPercent: 17,
      reason:
        'Caution because business unit organises ownership, not the physical role of the facility.',
    },
    'opened-on': {
      distinctValueCount: 9,
      recommendation: 'Not recommended',
      uniquenessPercent: 100,
      reason: 'Opened On is a date field—better for analysis filters than object subtypes.',
    },
    'facility-type': {
      distinctValueCount: 5,
      recommendation: 'Recommended',
      uniquenessPercent: 56,
      reason:
        'Recommended because facility types (Manufacturing Facility, Warehouse, Distribution Centre, Retail Store, Office) are stable business concepts that become object subtypes with their own specialised attributes.',
    },
  },
  attributes: [
    { id: 'facility-id', name: 'Facility ID', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACILITIES.FACILITY_ID' },
    { id: 'facility-name', name: 'Facility Name', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACILITIES.NAME' },
    { id: 'country', name: 'Country', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACILITIES.COUNTRY' },
    { id: 'city', name: 'City', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACILITIES.CITY' },
    { id: 'status', name: 'Status', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACILITIES.STATUS' },
    { id: 'business-unit', name: 'Business Unit', dataType: 'STRING', bindingStatus: 'Bound', source: 'FACILITIES.BUSINESS_UNIT' },
    { id: 'opened-on', name: 'Opened On', dataType: 'DATE', bindingStatus: 'Bound', source: 'FACILITIES.OPENED_ON' },
    {
      id: 'facility-type',
      name: 'Facility Type',
      dataType: 'STRING',
      bindingStatus: 'Bound',
      source: 'FACILITIES.FACILITY_TYPE',
    },
  ],
  bindings: [
    {
      id: 'facilities-primary',
      name: 'facilities_binding',
      table: 'FACILITIES',
      schema: 'OPS',
      status: 'Bound',
      mappedColumns: '8 / 8',
    },
  ],
  relationships: [
    {
      id: 'facility-inventory-zone',
      name: 'Facility has Inventory Zone',
      target: 'Inventory Zone',
      cardinality: '1:N',
      joinTable: 'FACILITIES → INVENTORY_ZONES',
      type: 'Type-to-Type',
    },
    {
      id: 'facility-shipment',
      name: 'Facility receives Shipment',
      target: 'Shipment Received',
      cardinality: '1:N',
      joinTable: 'E2O',
      type: 'Object-to-Event',
    },
  ],
  graphNeighbors: [
    { id: 'inventory-zone', label: 'Inventory Zone', kind: 'object', angle: -70 },
    { id: 'shipment', label: 'Shipment Received', kind: 'event', angle: 10 },
    { id: 'business-unit-entity', label: 'Business Unit', kind: 'object', angle: 90 },
    { id: 'operating-calendar', label: 'Operating Calendar', kind: 'object', angle: 170 },
  ],
  agentContext: `## Facility

### Description
Sites across manufacturing, logistics, retail, and corporate operations.

### Special instructions
- **Facility** is the shared parent object type. All sites inherit Facility ID, Facility Name, Country, City, Status, Business Unit, and Opened On.
- Object subtypes are **Manufacturing Facility**, **Warehouse**, **Distribution Centre**, **Retail Store**, and **Office**—each adds specialised attributes (production lines, loading docks, store format, etc.) without redefining the common Facility model.
- Prefer **Facility Type** when creating the subtype hierarchy.`,
  attributeValues: {
    country: [
      { value: 'Germany', recordCount: 1 },
      { value: 'France', recordCount: 1 },
      { value: 'Spain', recordCount: 1 },
      { value: 'India', recordCount: 1 },
      { value: 'Japan', recordCount: 1 },
      { value: 'China', recordCount: 1 },
      { value: 'Brazil', recordCount: 1 },
      { value: 'Chile', recordCount: 1 },
      { value: 'Argentina', recordCount: 1 },
    ],
    city: [
      { value: 'Munich', recordCount: 1 },
      { value: 'Lyon', recordCount: 1 },
      { value: 'Madrid', recordCount: 1 },
      { value: 'Bengaluru', recordCount: 1 },
      { value: 'Osaka', recordCount: 1 },
      { value: 'Shenzhen', recordCount: 1 },
      { value: 'São Paulo', recordCount: 1 },
      { value: 'Santiago', recordCount: 1 },
      { value: 'Buenos Aires', recordCount: 1 },
    ],
    status: [{ value: 'Active', recordCount: 9 }],
    'business-unit': [
      { value: 'Automotive', recordCount: 1 },
      { value: 'Consumer Products', recordCount: 2 },
      { value: 'Retail', recordCount: 2 },
      { value: 'Electronics', recordCount: 1 },
      { value: 'Logistics', recordCount: 2 },
      { value: 'Corporate', recordCount: 1 },
    ],
    'opened-on': [
      { value: '2018-03-12', recordCount: 1 },
      { value: '2020-06-18', recordCount: 1 },
      { value: '2021-09-01', recordCount: 1 },
      { value: '2019-11-15', recordCount: 1 },
      { value: '2017-04-09', recordCount: 1 },
      { value: '2022-01-20', recordCount: 1 },
      { value: '2016-08-03', recordCount: 1 },
      { value: '2023-02-14', recordCount: 1 },
      { value: '2020-10-05', recordCount: 1 },
    ],
    'facility-type': [
      { value: 'Manufacturing Facility', recordCount: 2 },
      { value: 'Warehouse', recordCount: 1 },
      { value: 'Distribution Centre', recordCount: 3 },
      { value: 'Retail Store', recordCount: 2 },
      { value: 'Office', recordCount: 1 },
    ],
    'facility-name': [
      { value: 'Munich Manufacturing Facility', recordCount: 1 },
      { value: 'Lyon Distribution Centre', recordCount: 1 },
      { value: 'Madrid Retail Store', recordCount: 1 },
      { value: 'Bengaluru Manufacturing Facility', recordCount: 1 },
      { value: 'Osaka Warehouse', recordCount: 1 },
      { value: 'Shenzhen Distribution Centre', recordCount: 1 },
      { value: 'São Paulo Office', recordCount: 1 },
      { value: 'Santiago Distribution Centre', recordCount: 1 },
      { value: 'Buenos Aires Retail Store', recordCount: 1 },
    ],
    'facility-id': [
      { value: 'FAC.EU.001', recordCount: 1 },
      { value: 'FAC.EU.002', recordCount: 1 },
      { value: 'FAC.EU.003', recordCount: 1 },
      { value: 'FAC.AS.001', recordCount: 1 },
      { value: 'FAC.AS.002', recordCount: 1 },
      { value: 'FAC.AS.003', recordCount: 1 },
      { value: 'FAC.SA.001', recordCount: 1 },
      { value: 'FAC.SA.002', recordCount: 1 },
      { value: 'FAC.SA.003', recordCount: 1 },
    ],
  },
  subtypeTemplates: {
    'facility-type': [
      {
        id: 'manufacturing-facility',
        label: 'Manufacturing Facility',
        matchingValue: 'Manufacturing Facility',
        recordCount: 2,
      },
      {
        id: 'warehouse',
        label: 'Warehouse',
        matchingValue: 'Warehouse',
        recordCount: 1,
      },
      {
        id: 'distribution-centre',
        label: 'Distribution Centre',
        matchingValue: 'Distribution Centre',
        recordCount: 3,
      },
      {
        id: 'retail-store',
        label: 'Retail Store',
        matchingValue: 'Retail Store',
        recordCount: 2,
      },
      {
        id: 'office',
        label: 'Office',
        matchingValue: 'Office',
        recordCount: 1,
      },
    ],
  },
  inheritedAttributes: [
    'Facility ID',
    'Facility Name',
    'Country',
    'City',
    'Status',
    'Business Unit',
    'Opened On',
  ],
  inheritedRelationships: ['Facility has Inventory Zone', 'Facility receives Shipment'],
};

export const OBJECT_TYPES = {
  'jira-issue': JIRA_ISSUE,
  facility: FACILITY,
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
  const values = getDetectedValues(objectType, attributeId);
  if (values.length) return values.length;
  const candidate = objectType.splitCandidates?.[attributeId];
  if (candidate?.distinctValueCount != null) return candidate.distinctValueCount;
  return 0;
}

export function canGenerateSubtypesFromAttribute(objectType, attributeId) {
  const attribute = getAttribute(objectType, attributeId);
  if (!attribute || attribute.bindingStatus === 'Unbound') return false;
  return getDetectedValues(objectType, attributeId).length > 0;
}

export function getAttributeSplitCandidate(objectType, attributeId) {
  const candidate = objectType.splitCandidates?.[attributeId];
  if (candidate) return candidate;

  const values = getDetectedValues(objectType, attributeId);
  const attribute = getAttribute(objectType, attributeId);
  if (!attribute || attribute.bindingStatus === 'Unbound') {
    return {
      distinctValueCount: 0,
      recommendation: 'Not recommended',
      uniquenessPercent: 0,
      reason: 'This attribute is not bound to source data.',
    };
  }
  if (!values.length) {
    return {
      distinctValueCount: 0,
      recommendation: 'Not recommended',
      uniquenessPercent: 0,
      reason: 'No attribute values are available to create object subtypes.',
    };
  }
  if (values.length > 50) {
    return {
      distinctValueCount: values.length,
      recommendation: 'Caution',
      uniquenessPercent: 5,
      reason: 'High cardinality may create too many subtypes to manage as object types.',
    };
  }
  return {
    distinctValueCount: values.length,
    recommendation: 'Recommended',
    uniquenessPercent: 25,
    reason: 'This attribute has a manageable set of categorical values that can become object subtypes.',
  };
}

export function getAttributeRecommendationReason(objectType, attributeId) {
  return getAttributeSplitCandidate(objectType, attributeId).reason ?? '';
}

export function formatSubtypeOptionCount(count) {
  return `${count.toLocaleString()} available value${count === 1 ? '' : 's'}`;
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
  const predefined = objectType.subtypeTemplates?.[attributeId] ?? [];
  const templates = (
    predefined.length
      ? predefined
      : getDetectedValues(objectType, attributeId).map((item) => ({
          id: `${attributeId}-${String(item.value)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}`,
          label: item.value,
          matchingValue: item.value,
          recordCount: item.recordCount,
        }))
  ).map((subtype) => ({
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
    status: 'Created',
    referenceKey: `taxonomy.${objectType.id}.${attributeId.replace(/-/g, '_')}`,
    createdBy: 'System',
    lastUpdatedBy: 'System',
    owner: 'Theo Bonham Carter',
    generatedAt: new Date().toISOString(),
    sourceObjectTypeId: objectType.id,
    sourceObjectTypeName: objectType.name,
    splitAttributeId: attributeId,
    splitAttributeName: attribute?.name ?? '',
    subtypeCount: subtypes.filter((s) => !s.hidden).length,
    subtypes,
    description: `Created taxonomy organising ${subtypes.filter((s) => !s.hidden).length} subtype object${subtypes.filter((s) => !s.hidden).length === 1 ? '' : 's'} from the ${attribute?.name ?? 'selected'} attribute on ${objectType.name}.`,
  };
}
