import type { AlertRulesConfig } from "./config"
import type { OpportunityAlertInput } from "./types"

/**
 * Whether one opportunity qualifies for an alert under `rules`. Reads
 * spreadPercent, liquidity, roiPercent, confidenceScore, recommendation,
 * and riskLevel verbatim from the already-computed input — no spread,
 * profit, or recommendation math happens here.
 */
export function matchesAlertRules(input: OpportunityAlertInput, rules: AlertRulesConfig): boolean {
  if (!Number.isFinite(input.opportunity.spreadPercent) || input.opportunity.spreadPercent < rules.minSpreadPercent) {
    return false
  }

  const roiPercent = input.profit.roiPercent
  if (roiPercent === undefined || !Number.isFinite(roiPercent) || roiPercent < rules.minRoiPercent) {
    return false
  }

  if (input.recommendation.confidenceScore < rules.minConfidenceScore) {
    return false
  }

  if (!Number.isFinite(input.opportunity.liquidity) || input.opportunity.liquidity < rules.minLiquidityUsd) {
    return false
  }

  if (!rules.allowedRecommendations.includes(input.recommendation.recommendation)) {
    return false
  }

  if (!rules.allowedRiskLevels.includes(input.recommendation.riskLevel)) {
    return false
  }

  return true
}
