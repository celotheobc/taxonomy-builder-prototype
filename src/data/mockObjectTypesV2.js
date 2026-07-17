/**
 * V2 mock data extensions — nested subtype trees, recommendation bullets,
 * and a process-mining-centric third object type.
 */
import {
  OBJECT_TYPES as BASE_OBJECT_TYPES,
  getAttribute as baseGetAttribute,
  getAttributeSplitCandidate as baseGetCandidate,
  getAttributeTotalRows,
  getDetectedValueCount,
  getDetectedValues,
  buildTaxonomyAsset,
  canGenerateSubtypesFromAttribute,
  formatSubtypeOptionCount,
  getAttributeRecommendationReason,
  getBoundAttributes,
} from './mockObjectTypes';
import { flattenSubtypeTree } from '../components/hierarchy/hierarchyUtils';

export {
  getAttributeTotalRows,
  getDetectedValueCount,
  getDetectedValues,
  buildTaxonomyAsset,
  canGenerateSubtypesFromAttribute,
  formatSubtypeOptionCount,
  getBoundAttributes,
  GROUP_LABELS,
} from './mockObjectTypes';

const RECOMMENDATION_BULLETS = {
  'issue-type': [
    'Represents a stable business concept',
    'Suitable number of distinct values',
    'Good candidate for semantic classification',
  ],
  priority: [
    'Priority levels imply different handling workflows',
    'Small, stable set of categorical values',
    'Useful for routing and analysis rules',
  ],
  country: [
    'Clear geographic categories for facilities',
    'Manageable cardinality for subtype objects',
    'Can be organised into regional taxonomy groups later',
  ],
  region: [
    'Rolls facilities into stable reporting regions',
    'Complements country-level specialisation',
    'Useful for a separate geographic taxonomy',
  ],
  'facility-type': [
    'Describes distinct operational categories',
    'Manufacturing Facility, Warehouse, and other kinds add specialised attributes without duplicating Facility',
    'Stable business concept for object subtypes',
  ],
  'document-type': [
    'Core process mining document categories',
    'Maps directly to SAP FI document types',
    'Foundation for downstream conformance analysis',
  ],
  'posting-type': [
    'Distinguishes debit and credit posting behaviour',
    'Low cardinality with clear semantic meaning',
    'Useful for payment and clearing analysis',
  ],
};

const ACCOUNTING_DOCUMENT = {
  id: 'accounting-document',
  name: 'Accounting Document',
  label: 'Accounting Document',
  domain: 'Finance',
  status: 'Draft',
  metadata: {
    assetName: 'Accounting Document',
    status: 'Draft',
    type: 'Object Type',
    referenceKey: 'accounting_document',
    namespace: 'SAP',
    createdBy: 'Theo Bonham Carter',
    lastUpdatedBy: 'Theo Bonham Carter',
    description:
      'FI documents from SAP. Used in process mining for invoice-to-payment and credit memo analysis.',
  },
  defaultSplitAttributeId: 'document-type',
  splitCandidates: {
    'document-id': {
      distinctValueCount: 12400,
      recommendation: 'Not recommended',
      uniquenessPercent: 100,
      reason: 'Document numbers identify individual records, not reusable object subtypes.',
    },
    'document-type': {
      distinctValueCount: 3,
      recommendation: 'Recommended',
      uniquenessPercent: 12,
      reason:
        'Recommended because document types are stable FI categories that define different business objects in the process.',
    },
    'posting-type': {
      distinctValueCount: 2,
      recommendation: 'Recommended',
      uniquenessPercent: 8,
      reason:
        'Recommended because posting types distinguish debit and credit behaviour in payment flows.',
    },
    'company-code': {
      distinctValueCount: 14,
      recommendation: 'Caution',
      uniquenessPercent: 3,
      reason:
        'Caution because company codes are useful for filtering but usually describe organisational scope rather than object subtype.',
    },
    status: {
      distinctValueCount: 4,
      recommendation: 'Caution',
      uniquenessPercent: 6,
      reason:
        'Caution because document status describes lifecycle state rather than a distinct object type.',
    },
  },
  attributes: [
    { id: 'document-type', name: 'Document Type', dataType: 'STRING', bindingStatus: 'Bound', source: 'BSEG.BLART' },
    { id: 'document-id', name: 'Document Number', dataType: 'STRING', bindingStatus: 'Bound', source: 'BSEG.BELNR' },
    { id: 'posting-type', name: 'Posting Type', dataType: 'STRING', bindingStatus: 'Bound', source: 'BSEG.SHKZG' },
    { id: 'company-code', name: 'Company Code', dataType: 'STRING', bindingStatus: 'Bound', source: 'BSEG.BUKRS' },
    { id: 'status', name: 'Status', dataType: 'STRING', bindingStatus: 'Bound', source: 'BSEG.STATUS' },
  ],
  bindings: [
    {
      id: 'bseg-primary',
      name: 'bseg_binding',
      table: 'BSEG',
      schema: 'SAP',
      status: 'Bound',
      mappedColumns: '5 / 5',
    },
  ],
  relationships: [
    {
      id: 'doc-vendor-invoice',
      name: 'Document references Vendor Invoice',
      target: 'Vendor Invoice',
      cardinality: 'N:1',
      joinTable: 'BSEG → VENDOR_INVOICES',
      type: 'Type-to-Type',
    },
    {
      id: 'doc-payment',
      name: 'Document cleared by Payment',
      target: 'Payment Cleared',
      cardinality: '1:N',
      joinTable: 'E2O',
      type: 'Object-to-Event',
    },
  ],
  graphNeighbors: [
    { id: 'vendor-invoice', label: 'Vendor Invoice', kind: 'object', angle: -60 },
    { id: 'payment-cleared', label: 'Payment Cleared', kind: 'event', angle: 30 },
    { id: 'company-code', label: 'Company Code', kind: 'object', angle: 120 },
    { id: 'clearing', label: 'Clearing Posted', kind: 'event', angle: 200 },
  ],
  agentContext: `## Accounting Document

### Description
SAP FI accounting documents for procure-to-pay and order-to-cash process mining.

### Special instructions
- Prefer document subtypes (Invoice, Credit Memo, Payment) over raw BLART codes.
- Payment subtypes distinguish incoming vs outgoing flows.`,
  attributeValues: {
    'document-type': [
      { value: 'Invoice', recordCount: 4820 },
      { value: 'Credit Memo', recordCount: 612 },
      { value: 'Payment', recordCount: 2940 },
    ],
    'posting-type': [
      { value: 'Debit', recordCount: 4102 },
      { value: 'Credit', recordCount: 4270 },
    ],
    'company-code': [
      { value: '1000', recordCount: 2100 },
      { value: '2000', recordCount: 1840 },
      { value: '3000', recordCount: 1420 },
    ],
    status: [
      { value: 'Open', recordCount: 890 },
      { value: 'Cleared', recordCount: 6200 },
      { value: 'Reversed', recordCount: 412 },
      { value: 'Parked', recordCount: 870 },
    ],
    'document-id': [
      { value: '1900000123', recordCount: 1 },
      { value: '1900000456', recordCount: 1 },
    ],
  },
  subtypeTreeTemplates: {
    'document-type': [
      {
        id: 'invoice',
        label: 'Invoice',
        matchingValue: 'Invoice',
        recordCount: 4820,
      },
      {
        id: 'credit-memo',
        label: 'Credit Memo',
        matchingValue: 'Credit Memo',
        recordCount: 612,
      },
      {
        id: 'payment',
        label: 'Payment',
        matchingValue: 'Payment',
        recordCount: 2940,
        children: [
          { id: 'incoming-payment', label: 'Incoming Payment', recordCount: 1680 },
          { id: 'outgoing-payment', label: 'Outgoing Payment', recordCount: 1260 },
        ],
      },
    ],
  },
  inheritedAttributes: ['Document Number', 'Company Code', 'Status'],
  inheritedRelationships: ['Document references Vendor Invoice'],
};

const V2_ENHANCEMENTS = {
  'jira-issue': {
    subtypeTreeTemplates: {
      'issue-type': [
        { id: 'epic', label: 'Epic', matchingValue: 'Epic', recordCount: 124 },
        {
          id: 'story',
          label: 'Story',
          matchingValue: 'Story',
          recordCount: 4821,
          children: [
            { id: 'feature-story', label: 'Feature Story', recordCount: 3102 },
            { id: 'technical-story', label: 'Technical Story', recordCount: 1719 },
          ],
        },
        { id: 'bug', label: 'Bug', matchingValue: 'Bug', recordCount: 967 },
        { id: 'task', label: 'Task', matchingValue: 'Task', recordCount: 2103 },
      ],
    },
  },
  facility: {
    subtypeTreeTemplates: {
      'facility-type': [
        { id: 'manufacturing-facility', label: 'Manufacturing Facility', matchingValue: 'Manufacturing Facility', recordCount: 2 },
        { id: 'warehouse', label: 'Warehouse', matchingValue: 'Warehouse', recordCount: 1 },
        { id: 'distribution-centre', label: 'Distribution Centre', matchingValue: 'Distribution Centre', recordCount: 3 },
        { id: 'retail-store', label: 'Retail Store', matchingValue: 'Retail Store', recordCount: 2 },
        { id: 'office', label: 'Office', matchingValue: 'Office', recordCount: 1 },
      ],
    },
  },
};

export const OBJECT_TYPE_IDS = ['jira-issue', 'facility', 'accounting-document'];

export const OBJECT_TYPES = {
  ...BASE_OBJECT_TYPES,
  'accounting-document': ACCOUNTING_DOCUMENT,
  'jira-issue': {
    ...BASE_OBJECT_TYPES['jira-issue'],
    ...V2_ENHANCEMENTS['jira-issue'],
  },
  facility: {
    ...BASE_OBJECT_TYPES.facility,
    ...V2_ENHANCEMENTS.facility,
  },
};

export function getObjectType(id) {
  return OBJECT_TYPES[id] ?? null;
}

export function getAttribute(objectType, attributeId) {
  return baseGetAttribute(objectType, attributeId);
}

export function getAttributeSplitCandidate(objectType, attributeId) {
  return baseGetCandidate(objectType, attributeId);
}

export function getAttributeRecommendationBullets(objectType, attributeId) {
  const bullets = RECOMMENDATION_BULLETS[attributeId];
  if (bullets?.length) return bullets;

  const candidate = getAttributeSplitCandidate(objectType, attributeId);
  if (candidate.reason) {
    return candidate.reason
      .replace(/^Recommended because |^Caution because |^Not recommended because /i, '')
      .split(/[.;]/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

export { getAttributeRecommendationReason };

export function buildSubtypeTemplates(objectType, attributeId, selectedMatchingValues = null) {
  const tree = objectType.subtypeTreeTemplates?.[attributeId];
  if (tree?.length) {
    const flat = flattenSubtypeTree(tree);
    const templates = flat.map((subtype) => ({
      ...subtype,
      hidden: false,
    }));
    if (!selectedMatchingValues?.length) return templates;

    const selected = new Set(selectedMatchingValues);
    const included = new Set();

    const includeDescendants = (id) => {
      included.add(id);
      templates
        .filter((node) => node.parentId === id)
        .forEach((child) => includeDescendants(child.id));
    };

    templates.forEach((node) => {
      if (node.matchingValue && selected.has(node.matchingValue)) {
        let current = node;
        while (current) {
          included.add(current.id);
          current = current.parentId
            ? templates.find((item) => item.id === current.parentId)
            : null;
        }
        includeDescendants(node.id);
      }
    });

    return templates.filter((node) => included.has(node.id));
  }

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
