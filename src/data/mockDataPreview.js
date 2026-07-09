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

const FACTORY_PREVIEW = {
  default: [
    { id: 'F-001', name: 'Lyon Plant', country: 'France', region: 'Europe', type: 'Assembly', status: 'Active' },
    { id: 'F-002', name: 'Munich Plant', country: 'Germany', region: 'Europe', type: 'Assembly', status: 'Active' },
    { id: 'F-003', name: 'Osaka Plant', country: 'Japan', region: 'Asia', type: 'Component', status: 'Active' },
    { id: 'F-004', name: 'Shenzhen Plant', country: 'China', region: 'Asia', type: 'Assembly', status: 'Active' },
  ],
  france: [{ id: 'F-001', name: 'Lyon Plant', country: 'France', region: 'Europe', type: 'Assembly', status: 'Active' }],
  germany: [{ id: 'F-002', name: 'Munich Plant', country: 'Germany', region: 'Europe', type: 'Assembly', status: 'Active' }],
  spain: [{ id: 'F-005', name: 'Barcelona Plant', country: 'Spain', region: 'Europe', type: 'Component', status: 'Active' }],
  japan: [{ id: 'F-003', name: 'Osaka Plant', country: 'Japan', region: 'Asia', type: 'Component', status: 'Active' }],
  china: [{ id: 'F-004', name: 'Shenzhen Plant', country: 'China', region: 'Asia', type: 'Assembly', status: 'Active' }],
  thailand: [{ id: 'F-006', name: 'Bangkok Plant', country: 'Thailand', region: 'Asia', type: 'Assembly', status: 'Planned' }],
};

export function getDataPreviewRows(objectTypeId, subtypeId = null) {
  if (objectTypeId === 'jira-issue') {
    if (subtypeId && JIRA_PREVIEW[subtypeId]) return JIRA_PREVIEW[subtypeId];
    return JIRA_PREVIEW.default;
  }
  if (objectTypeId === 'factory') {
    if (subtypeId && FACTORY_PREVIEW[subtypeId]) return FACTORY_PREVIEW[subtypeId];
    return FACTORY_PREVIEW.default;
  }
  return [];
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
    { key: 'id', label: 'Factory ID' },
    { key: 'name', label: 'Factory Name' },
    { key: 'country', label: 'Country' },
    { key: 'region', label: 'Region' },
    { key: 'type', label: 'Factory Type' },
    { key: 'status', label: 'Status' },
  ];
}
