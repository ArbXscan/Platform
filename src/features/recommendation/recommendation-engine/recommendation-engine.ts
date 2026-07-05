import { buildSuggestedActions } from "./actions"
import { buildReasons, deriveOverallConfidence } from "./recommendation"
import { buildSummary } from "./summary"
import type { RecommendationEngineInput, RecommendationReport } from "./types"
import { buildWarnings } from "./warnings"

/**
 * Runs the Recommendation Engine against the normalized outputs of the
 * Verification Engine, Quote Comparator, Risk Engine, and Opportunity
 * Scoring Engine, producing one normalized RecommendationReport.
 *
 * This engine never recalculates spread, risk, or scoring — it only reads,
 * summarizes, and aggregates what those upstream engines already produced.
 * Fully provider-agnostic: it has no knowledge of which market/router
 * provider ultimately backed any given input. Not called from anywhere yet.
 */
export function runRecommendationEngine(input: RecommendationEngineInput): RecommendationReport {
  return {
    recommendationLevel: input.scoring.recommendationLevel,
    opportunityScore: input.scoring.overallScore,
    starRating: input.scoring.starRating,
    summary: buildSummary(input),
    reasons: buildReasons(input),
    warnings: buildWarnings(input),
    suggestedActions: buildSuggestedActions(input),
    overallConfidence: deriveOverallConfidence(input),
    generatedAt: new Date().toISOString(),
  }
}
