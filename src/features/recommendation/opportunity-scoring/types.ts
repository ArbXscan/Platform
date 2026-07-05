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
