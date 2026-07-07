import type { QuoteComparisonReport } from "../quote-comparator"
import type { RiskReport } from "../risk-engine"

/** Re-exported so consumers of this engine don't need to reach into the sibling modules directly. */
export type { QuoteComparisonReport } from "../quote-comparator"
export type { RiskReport } from "../risk-engine"

/** Normalized input this engine accepts: one comparison report and one risk report for the same opportunity. */
export interface OpportunityScoringInput {
  comparison: QuoteComparisonReport
  risk: RiskReport
}

/** One scored dimension. Undefined score means the inputs needed to score it weren't available — never fabricated. */
export interface ScoreComponent {
  /** Normalized 0-100 score, higher = better. Undefined if this dimension couldn't be scored. */
  score?: number
  reason: string
}

export type StarRating = 1 | 2 | 3 | 4 | 5

export type RecommendationLevel = "Highly Recommended" | "Recommended" | "Neutral" | "High Risk" | "Not Recommended"

/** Full scoring result for one opportunity, combining every scored dimension. */
export interface OpportunityScoreReport {
  profit: ScoreComponent
  liquidity: ScoreComponent
  risk: ScoreComponent
  confidence: ScoreComponent
  /** Weighted average of whichever component scores were available. Undefined only if none of the four could be scored. */
  overallScore?: number
  /** Undefined whenever overallScore is undefined. */
  starRating?: StarRating
  recommendationLevel: RecommendationLevel
  scoredAt: string
}

/**
 * Normalized input for evaluation/validation/ranking/normalization: the same
 * comparison and risk reports the scoring engine reads, plus the scoring
 * result it already produced. Nothing in this module recalculates any of
 * these three — every check reads them as-is.
 */
export interface OpportunityEvaluationInput {
  comparison: QuoteComparisonReport
  risk: RiskReport
  scoring: OpportunityScoreReport
}

export type OpportunityValidationVerdict = "valid" | "invalid"

/** One named pass/fail check performed during validation, with a human-readable reason either way. */
export interface OpportunityValidationCheck {
  name: string
  passed: boolean
  reason: string
}

/** Full validation result: an overall verdict plus every individual check that produced it. */
export interface OpportunityValidationResult {
  verdict: OpportunityValidationVerdict
  checks: OpportunityValidationCheck[]
  /** Carried over from QuoteComparisonReport.profitability verbatim — never recalculated here. */
  estimatedNetProfitUsd?: number
  validatedAt: string
}

/** One opportunity's evaluation input plus its computed validation, after ranking. */
export interface RankedOpportunity extends OpportunityEvaluationInput {
  validation: OpportunityValidationResult
  /** 1-based position in the final ranked list. */
  rank: number
}

/**
 * Flat, normalized view of one opportunity, built only from fields the
 * comparison/risk/scoring reports already produced (no field here is
 * calculated). Used for aggregating multiple opportunities into a single
 * comparable list.
 */
export interface NormalizedOpportunity {
  tokenAddress: string
  chainId: string
  spreadPercent?: number
  estimatedNetProfitUsd?: number
  confidenceScore?: number
  overallScore?: number
  starRating?: StarRating
  recommendationLevel: RecommendationLevel
  overallRiskLevel: RiskReport["overallLevel"]
  validationVerdict: OpportunityValidationVerdict
}
