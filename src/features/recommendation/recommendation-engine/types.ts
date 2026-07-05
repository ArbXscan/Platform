import type { VerificationEngineResult } from "../../verification/engine"
import type { OpportunityScoreReport, RecommendationLevel, StarRating } from "../opportunity-scoring"
import type { QuoteComparisonReport } from "../quote-comparator"
import type { RiskReport } from "../risk-engine"

/** Re-exported so consumers of this engine don't need to reach into each upstream module directly. */
export type { VerificationEngineResult } from "../../verification/engine"
export type { OpportunityScoreReport, RecommendationLevel, StarRating } from "../opportunity-scoring"
export type { QuoteComparisonReport } from "../quote-comparator"
export type { RiskReport } from "../risk-engine"

/**
 * Normalized input this engine accepts — the outputs of four upstream
 * engines for the same opportunity. This engine never recalculates any of
 * these; it only reads, summarizes, and aggregates them.
 */
export interface RecommendationEngineInput {
  verification: VerificationEngineResult
  comparison: QuoteComparisonReport
  risk: RiskReport
  scoring: OpportunityScoreReport
}

/**
 * "unknown" is a first-class level, not a fallback error state — it means
 * the upstream data needed to assess overall confidence wasn't available.
 */
export type OverallConfidenceLevel = "low" | "medium" | "high" | "unknown"

/** Final, normalized recommendation report for one opportunity. */
export interface RecommendationReport {
  /** Carried over from the Opportunity Scoring Engine verbatim — never recalculated here. */
  recommendationLevel: RecommendationLevel
  /** Carried over from the Opportunity Scoring Engine verbatim. Undefined if scoring couldn't produce one. */
  opportunityScore?: number
  /** Carried over from the Opportunity Scoring Engine verbatim. Undefined if scoring couldn't produce one. */
  starRating?: StarRating
  summary: string
  /** Human-readable reasons supporting the recommendation. Only includes points backed by available data. */
  reasons: string[]
  /** Human-readable warnings surfaced from the upstream reports. */
  warnings: string[]
  /** Human-readable next steps a user could take before acting on this opportunity. */
  suggestedActions: string[]
  overallConfidence: OverallConfidenceLevel
  generatedAt: string
}
