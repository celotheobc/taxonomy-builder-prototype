const FACILITY_ROWS = [
  {
    id: 'FAC.EU.001',
    name: 'Munich Manufacturing Facility',
    country: 'Germany',
    city: 'Munich',
    status: 'Active',
    businessUnit: 'Automotive',
    openedOn: '2018-03-12',
    facilityType: 'Manufacturing Facility',
  },
  {
    id: 'FAC.EU.002',
    name: 'Lyon Distribution Centre',
    country: 'France',
    city: 'Lyon',
    status: 'Active',
    businessUnit: 'Consumer Products',
    openedOn: '2020-06-18',
    facilityType: 'Distribution Centre',
  },
  {
    id: 'FAC.EU.003',
    name: 'Madrid Retail Store',
    country: 'Spain',
    city: 'Madrid',
    status: 'Active',
    businessUnit: 'Retail',
    openedOn: '2021-09-01',
    facilityType: 'Retail Store',
  },
  {
    id: 'FAC.AS.001',
    name: 'Bengaluru Manufacturing Facility',
    country: 'India',
    city: 'Bengaluru',
    status: 'Active',
    businessUnit: 'Electronics',
    openedOn: '2019-11-15',
    facilityType: 'Manufacturing Facility',
  },
  {
    id: 'FAC.AS.002',
    name: 'Osaka Warehouse',
    country: 'Japan',
    city: 'Osaka',
    status: 'Active',
    businessUnit: 'Logistics',
    openedOn: '2017-04-09',
    facilityType: 'Warehouse',
  },
  {
    id: 'FAC.AS.003',
    name: 'Shenzhen Distribution Centre',
    country: 'China',
    city: 'Shenzhen',
    status: 'Active',
    businessUnit: 'Consumer Products',
    openedOn: '2022-01-20',
    facilityType: 'Distribution Centre',
  },
  {
    id: 'FAC.SA.001',
    name: 'São Paulo Office',
    country: 'Brazil',
    city: 'São Paulo',
    status: 'Active',
    businessUnit: 'Corporate',
    openedOn: '2016-08-03',
    facilityType: 'Office',
  },
  {
    id: 'FAC.SA.002',
    name: 'Santiago Distribution Centre',
    country: 'Chile',
    city: 'Santiago',
    status: 'Active',
    businessUnit: 'Logistics',
    openedOn: '2023-02-14',
    facilityType: 'Distribution Centre',
  },
  {
    id: 'FAC.SA.003',
    name: 'Buenos Aires Retail Store',
    country: 'Argentina',
    city: 'Buenos Aires',
    status: 'Active',
    businessUnit: 'Retail',
    openedOn: '2020-10-05',
    facilityType: 'Retail Store',
  },
];

const JIRA_PREVIEW = {
  default: [
    { id: 'PROJ-101', issueType: 'Story', status: 'In Progress', priority: 'High', team: 'Platform' },
    { id: 'PROJ-102', issueType: 'Bug', status: 'To Do', priority: 'Highest', team: 'Platform' },
    { id: 'PROJ-103', issueType: 'Epic', status: 'Done', priority: 'Medium', team: 'Delivery' },
    { id: 'PROJ-104', issueType: 'Task', status: 'Done', priority: 'Low', team: 'Ops' },
  ],
  epic: [
    { id: 'PROJ-103', issueType: 'Epic', status: 'Done', priority: 'Medium', team: 'Delivery' },
    { id: 'PROJ-210', issueType: 'Epic', status: 'In Progress', priority: 'High', team: 'Platform' },
  ],
  story: [
    { id: 'PROJ-101', issueType: 'Story', status: 'In Progress', priority: 'High', team: 'Platform' },
    { id: 'PROJ-118', issueType: 'Story', status: 'Done', priority: 'Medium', team: 'Delivery' },
  ],
  bug: [{ id: 'PROJ-102', issueType: 'Bug', status: 'To Do', priority: 'Highest', team: 'Platform' }],
  task: [{ id: 'PROJ-104', issueType: 'Task', status: 'Done', priority: 'Low', team: 'Ops' }],
};

const FACILITY_PREVIEW = {
  default: FACILITY_ROWS,
  'manufacturing-facility': FACILITY_ROWS.filter((row) => row.facilityType === 'Manufacturing Facility'),
  warehouse: FACILITY_ROWS.filter((row) => row.facilityType === 'Warehouse'),
  'distribution-centre': FACILITY_ROWS.filter((row) => row.facilityType === 'Distribution Centre'),
  'retail-store': FACILITY_ROWS.filter((row) => row.facilityType === 'Retail Store'),
  office: FACILITY_ROWS.filter((row) => row.facilityType === 'Office'),
  germany: FACILITY_ROWS.filter((row) => row.country === 'Germany'),
  france: FACILITY_ROWS.filter((row) => row.country === 'France'),
};

export function getDataPreviewRows(objectTypeId, subtypeId = null) {
  if (objectTypeId === 'jira-issue') {
    if (subtypeId && JIRA_PREVIEW[subtypeId]) return JIRA_PREVIEW[subtypeId];
    return JIRA_PREVIEW.default;
  }
  if (objectTypeId === 'facility') {
    if (subtypeId && FACILITY_PREVIEW[subtypeId]) return FACILITY_PREVIEW[subtypeId];
    return FACILITY_PREVIEW.default;
  }
  return [];
}

const FACILITY_SPLIT_FIELD_BY_ATTR = {
  'facility-id': 'id',
  'facility-name': 'name',
  country: 'country',
  city: 'city',
  status: 'status',
  'business-unit': 'businessUnit',
  'opened-on': 'openedOn',
  'facility-type': 'facilityType',
};

/** Rows that match the ancestor split chain for a nested facility split. */
export function getFacilityRowsInSplitScope(parentId, nodes = []) {
  let rows = FACILITY_ROWS;
  if (!parentId || !nodes.length) return rows;

  const chain = [];
  let current = nodes.find((node) => node.id === parentId) ?? null;
  while (current) {
    chain.unshift(current);
    current = current.parentId ? nodes.find((node) => node.id === current.parentId) : null;
  }

  chain.forEach((node) => {
    const field = FACILITY_SPLIT_FIELD_BY_ATTR[node.createdByAttributeId];
    const matchValue = node.matchingValue ?? node.label;
    if (field) {
      rows = rows.filter((row) => row[field] === matchValue);
    }
  });

  return rows;
}

/** Distinct attribute values with row counts scoped to a split parent (facility mock data). */
export function getScopedDetectedValues(objectTypeId, attributeId, parentId, nodes = []) {
  if (objectTypeId !== 'facility') return null;
  const field = FACILITY_SPLIT_FIELD_BY_ATTR[attributeId];
  if (!field) return [];

  const rows = getFacilityRowsInSplitScope(parentId, nodes);
  const counts = new Map();
  rows.forEach((row) => {
    const value = row[field];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([value, recordCount]) => ({ value, recordCount }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

export function getPreviewColumns(objectTypeId) {
  if (objectTypeId === 'jira-issue') {
    return [
      { key: 'id', label: 'Issue ID' },
      { key: 'issueType', label: 'Issue Type' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'team', label: 'Team' },
    ];
  }
  return [
    { key: 'id', label: 'Facility ID' },
    { key: 'name', label: 'Facility Name' },
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' },
    { key: 'status', label: 'Status' },
    { key: 'businessUnit', label: 'Business Unit' },
    { key: 'openedOn', label: 'Opened On' },
  ];
}
