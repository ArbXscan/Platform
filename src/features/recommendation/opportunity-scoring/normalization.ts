import { validateOpportunity } from "./validation"
import type { NormalizedOpportunity, OpportunityEvaluationInput, OpportunityValidationThresholds } from "./types"

/**
 * Builds a flat NormalizedOpportunity from one comparison/risk/scoring
 * bundle. Every field is copied verbatim from the existing reports, or, for
 * `estimatedNetProfitUsd` and `validationVerdict`, taken directly from
 * validateOpportunity's own result — nothing here is calculated, scored, or
 * re-derived a second time. `thresholds` is fully optional and forwarded
 * as-is to validateOpportunity.
 */
export function normalizeOpportunity(
  input: OpportunityEvaluationInput,
  thresholds: Partial<OpportunityValidationThresholds> = {},
): NormalizedOpportunity {
  const validation = validateOpportunity(input, thresholds)

  return {
    tokenAddress: input.comparison.tokenAddress,
    chainId: input.risk.chainId,
    spreadPercent: input.comparison.spread.spreadPercent,
    estimatedNetProfitUsd: validation.estimatedNetProfitUsd,
    confidenceScore: input.scoring.confidence.score,
    overallScore: input.scoring.overallScore,
    starRating: input.scoring.starRating,
    recommendationLevel: input.scoring.recommendationLevel,
    overallRiskLevel: input.risk.overallLevel,
    validationVerdict: validation.verdict,
  }
}

/**
 * Normalizes multiple comparison/risk/scoring bundles into a single flat
 * list. Order is preserved; no ranking or filtering happens here — pair
 * with rankOpportunities or filterValidOpportunities as needed.
 */
export function normalizeOpportunities(
  inputs: OpportunityEvaluationInput[],
  thresholds: Partial<OpportunityValidationThresholds> = {},
): NormalizedOpportunity[] {
  return inputs.map((input) => normalizeOpportunity(input, thresholds))
}
