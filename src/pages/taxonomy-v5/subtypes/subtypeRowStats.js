export function formatSubtypeRowPercent(recordCount, totalRows) {
  if (!totalRows) return '0%';
  return `${((recordCount / totalRows) * 100).toFixed(totalRows >= 1000 ? 0 : 1)}%`;
}

export function formatSubtypeRowStats(recordCount, totalRows) {
  return `${recordCount.toLocaleString()} rows · ${formatSubtypeRowPercent(recordCount, totalRows)}`;
}
