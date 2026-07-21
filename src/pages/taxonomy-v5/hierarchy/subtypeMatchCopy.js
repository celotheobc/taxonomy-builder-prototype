const RECORD_WORDS = {
  facility: { one: 'facility', other: 'facilities' },
  'jira-issue': { one: 'issue', other: 'issues' },
};

function recordWord(objectType, count) {
  const mapped = RECORD_WORDS[objectType?.id];
  if (mapped) return count === 1 ? mapped.one : mapped.other;
  const base = (objectType?.name || 'record').trim().toLowerCase();
  return count === 1 ? base : `${base}s`;
}

export function formatMatchingRecords(count, objectType) {
  const n = Number(count) || 0;
  return `${n.toLocaleString()} matching ${recordWord(objectType, n)}`;
}

export function formatConditionCount(count) {
  const n = Number(count) || 0;
  return `${n} condition${n === 1 ? '' : 's'}`;
}

export const SUBTYPE_PREVIEW_EMPTY =
  'No subtypes yet. Click Add subtype to begin.';

export const SUBTYPE_EDITOR_EMPTY =
  'Create a subtype to begin defining which records belong to it.';
