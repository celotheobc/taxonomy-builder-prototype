import { FACILITY_ROWS } from '../../../data/facilityDemoRows';
import { getDetectedValues, getObjectTypeTableAttributes } from '../../../data/mockObjectTypes';

const FIELD_TO_ROW_KEY = {
  'facility-type': 'facilityType',
  country: 'country',
  status: 'status',
  'business-unit': 'businessUnit',
};

export const RULE_OPERATORS = [
  { id: 'equals', label: 'equals' },
  { id: 'not_equals', label: 'does not equal' },
  { id: 'contains', label: 'contains' },
  { id: 'starts_with', label: 'starts with' },
];

export const RULE_JOINS = [
  { id: 'and', label: 'And' },
  { id: 'or', label: 'Or' },
];

function rowMatchesCondition(row, condition) {
  const key = FIELD_TO_ROW_KEY[condition.fieldId];
  if (!key) return false;
  const cell = String(row[key] ?? '').toLowerCase();
  const target = String(condition.value ?? '').toLowerCase();
  if (!target) return false;
  if (condition.operator === 'equals') return cell === target;
  if (condition.operator === 'not_equals') return cell !== target;
  if (condition.operator === 'contains') return cell.includes(target);
  if (condition.operator === 'starts_with') return cell.startsWith(target);
  return false;
}

function matchRowsForConditions(conditions) {
  if (!conditions?.length) return [];
  const valid = conditions.filter((c) => c.fieldId && c.value);
  if (!valid.length) return [];

  let matched = FACILITY_ROWS.filter((row) => rowMatchesCondition(row, valid[0]));
  for (let i = 1; i < valid.length; i += 1) {
    const join = valid[i].join === 'or' ? 'or' : 'and';
    const next = FACILITY_ROWS.filter((row) => rowMatchesCondition(row, valid[i]));
    if (join === 'or') {
      const names = new Set([...matched.map((r) => r.name), ...next.map((r) => r.name)]);
      matched = FACILITY_ROWS.filter((row) => names.has(row.name));
    } else {
      const nextNames = new Set(next.map((r) => r.name));
      matched = matched.filter((row) => nextNames.has(row.name));
    }
  }
  return matched;
}

export function getRuleBuilderFields(objectType) {
  return getObjectTypeTableAttributes(objectType).map((attr) => ({
    id: attr.id,
    label: attr.name,
  }));
}

export function getRuleFieldValues(objectType, fieldId) {
  if (!fieldId) return [];
  return getDetectedValues(objectType, fieldId);
}

export function previewRuleSubtypes(objectTypeId, rules) {
  if (objectTypeId !== 'facility') {
    return rules.map((rule) => ({
      label: rule.label,
      recordCount: rule.recordCount ?? 0,
      sampleRecords: [],
    }));
  }

  return rules.map((rule) => {
    const matches = matchRowsForConditions(rule.conditions);
    return {
      label: rule.label,
      recordCount: matches.length,
      sampleRecords: matches.slice(0, 3).map((row) => row.name),
    };
  });
}

export function createEmptyRule() {
  return {
    id: `rule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    label: '',
    conditions: [],
  };
}

export function createEmptyCondition(defaultFieldId = '') {
  return {
    fieldId: defaultFieldId,
    operator: 'equals',
    value: '',
    join: 'and',
  };
}

export function formatConditionLabel(objectType, condition, fields = null) {
  const fieldList = fields ?? getRuleBuilderFields(objectType);
  const field = fieldList.find((item) => item.id === condition.fieldId);
  const op = RULE_OPERATORS.find((item) => item.id === condition.operator);
  const name = field?.label ?? 'Attribute';
  const opLabel = op?.label ?? 'equals';
  const value = condition.value || '…';
  return `${name} ${opLabel} ${value}`;
}

export function formatRuleSummary(objectType, rule) {
  const fields = getRuleBuilderFields(objectType);
  if (!rule.conditions?.length) return 'No rules defined yet';
  return rule.conditions
    .map((condition, index) => {
      const text = formatConditionLabel(objectType, condition, fields);
      if (index === 0) return text;
      const join = condition.join === 'or' ? 'Or' : 'And';
      return `${join} ${text}`;
    })
    .join(' ');
}
