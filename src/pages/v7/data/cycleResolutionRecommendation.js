import { getCycleImpactPreview } from './cycleImpactPreviews';

const IMPACT_SUMMARIES = {
  'r-customer-di':
    'Keeps fulfilment reachable; filter propagation stays intact.',
  'r-delivery-di':
    'Most cases remain reachable; a small number of joins are affected.',
  'r-so-delivery':
    'Partial filter propagation; several joins become unavailable.',
  'r-customer-so':
    'Breaks customer filtering and removes a direct invoice path.',
};

const RECOMMENDATION_RATIONALE = {
  'r-customer-di':
    'Preserves the main fulfilment path and keeps filter propagation available.',
  'r-delivery-di':
    'Keeps most delivery items reachable with only minor join loss.',
  'r-so-delivery':
    'Still workable, but filter propagation becomes partial.',
  'r-customer-so':
    'Likely to break customer-led analysis across orders.',
};

function scoreImpactItem(item) {
  if (item.status === 'bad') return 10;
  if (item.status === 'warn') return 3;
  return 0;
}

function extractMissingJoins(dataImpact) {
  for (const item of dataImpact) {
    if (/no joins become unavailable/i.test(item.text)) return 0;
    if (item.detail && /0 missing joins/i.test(item.detail)) return 0;
    const match = item.text.match(/([\d,]+)\s+joins become unavailable/i);
    if (match) return Number.parseInt(match[1].replace(/,/g, ''), 10);
  }
  return 0;
}

function extractReachabilityPercent(dataImpact) {
  for (const item of dataImpact) {
    const match = item.text.match(/(\d+)%/);
    if (match) return Number.parseInt(match[1], 10);
  }
  return 0;
}

function scorePreview(preview) {
  const items = [...preview.businessConsequences, ...preview.dataImpact];
  let score = items.reduce((sum, item) => sum + scoreImpactItem(item), 0);
  score += extractMissingJoins(preview.dataImpact) / 2000;
  score -= extractReachabilityPercent(preview.dataImpact) / 25;
  if (preview.results?.error) score += 20;
  return score;
}

function buildImpactSummary(preview, relId) {
  if (IMPACT_SUMMARIES[relId]) return IMPACT_SUMMARIES[relId];

  const hasBad = [...preview.businessConsequences, ...preview.dataImpact].some(
    (item) => item.status === 'bad',
  );
  const hasWarn = [...preview.businessConsequences, ...preview.dataImpact].some(
    (item) => item.status === 'warn',
  );
  if (hasBad) return 'Higher risk of broken paths or filter propagation.';
  if (hasWarn) return 'Some indirect effects; review before removing.';
  return 'Likely lower disruption based on remaining paths.';
}

function buildRecommendationRationale(preview, relId) {
  if (RECOMMENDATION_RATIONALE[relId]) return RECOMMENDATION_RATIONALE[relId];

  const missingJoins = extractMissingJoins(preview.dataImpact);
  if (missingJoins === 0) {
    return 'Preserves the main path and keeps filter propagation available.';
  }
  return 'May be workable, but compare consequences before removing.';
}

export function rankCycleResolutionOptions(loopRows) {
  return loopRows
    .map((row) => {
      const preview = getCycleImpactPreview(row.id, row.name);
      return {
        ...row,
        score: scorePreview(preview),
        impactSummary: buildImpactSummary(preview, row.id),
        recommendationRationale: buildRecommendationRationale(preview, row.id),
      };
    })
    .sort((a, b) => a.score - b.score)
    .map((row, index) => ({
      ...row,
      isLowestImpact: index === 0,
      summary: index === 0 ? row.recommendationRationale : row.impactSummary,
    }));
}
