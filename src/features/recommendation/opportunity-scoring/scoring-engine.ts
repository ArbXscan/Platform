import { calculateConfidenceScore } from "./confidence-score"
import { calculateLiquidityScore } from "./liquidity-score"
import { calculateProfitScore } from "./profit-score"
import { calculateRiskScore } from "./risk-score"
import { deriveStarRating } from "./star-rating"
import type { OpportunityScoreReport, OpportunityScoringInput, RecommendationLevel } from "./types"

/** Initial heuristic weights (sum to 1.0), not a validated product decision. */
const WEIGHTS = {
  profit: 0.35,
  liquidity: 0.2,
  risk: 0.25,
  confidence: 0.2,
} as const

interface WeightedScore {
  weight: number
  score?: number
}

/**
 * Weighted average over whichever component scores are actually defined,
 * renormalizing weight across just those components. Returns undefined only
 * if none of the components could be scored — never fills a missing score
 * with a default value.
 */
function calculateOverallScore(components: WeightedScore[]): number | undefined {
  const scored = components.filter(
    (component): component is WeightedScore & { score: number } => typeof component.score === "number",
  )
  if (scored.length === 0) return undefined

  const totalWeight = scored.reduce((sum, component) => sum + component.weight, 0)
  if (totalWeight <= 0) return undefined

  const weightedSum = scored.reduce((sum, component) => sum + component.weight * component.score, 0)
  return weightedSum / totalWeight
}

/**
 * Risk always has the final say: a "high" overall risk level forces the
 * "High Risk" recommendation regardless of score. Otherwise, an undefined
 * overall score (too little data to have an opinion) falls back to
 * "Not Recommended" rather than defaulting to an optimistic tier.
 */
function deriveRecommendationLevel(
  overallScore: number | undefined,
  riskOverallLevel: "low" | "medium" | "high" | "unknown",
): RecommendationLevel {
  if (riskOverallLevel === "high") return "High Risk"
  if (typeof overallScore !== "number") return "Not Recommended"
  if (overallScore >= 80) return "Highly Recommended"
  if (overallScore >= 60) return "Recommended"
  if (overallScore >= 40) return "Neutral"
  return "Not Recommended"
}

/**
 * Runs the Opportunity Scoring Engine against one comparison report and one
 * risk report for the same opportunity, producing a normalized
 * OpportunityScoreReport. Fully provider-agnostic — it only reads the
 * QuoteComparisonReport/RiskReport shapes produced by the sibling
 * quote-comparator and risk-engine modules, never a specific market/router
 * provider's response. Not called from anywhere yet.
 */
export function runOpportunityScoringEngine(input: OpportunityScoringInput): OpportunityScoreReport {
  const profit = calculateProfitScore(input.comparison)
  const liquidity = calculateLiquidityScore(input.risk)
  const risk = calculateRiskScore(input.risk)
  const confidence = calculateConfidenceScore(input.comparison)

  const overallScore = calculateOverallScore([
    { weight: WEIGHTS.profit, score: profit.score },
    { weight: WEIGHTS.liquidity, score: liquidity.score },
    { weight: WEIGHTS.risk, score: risk.score },
    { weight: WEIGHTS.confidence, score: confidence.score },
  ])

  return {
    profit,
    liquidity,
    risk,
    confidence,
    overallScore,
    starRating: typeof overallScore === "number" ? deriveStarRating(overallScore) : undefined,
    recommendationLevel: deriveRecommendationLevel(overallScore, input.risk.overallLevel),
    scoredAt: new Date().toISOString(),
  }
}
