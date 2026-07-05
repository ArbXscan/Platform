import type { VerificationEngineResult } from "../../verification/engine"
import type { OpportunityScoreReport } from "../opportunity-scoring"
import type { NormalizedQuoteInput, QuoteComparisonReport } from "../quote-comparator"
import type { RecommendationReport } from "../recommendation-engine"
import type { NormalizedMarketSnapshot, RiskReport } from "../risk-engine"
import type { ArbitrageOpportunity } from "../../../types/arbitrage"

/** Re-exported so consumers of the pipeline don't need to reach into each engine module directly. */
export type { VerificationEngineResult } from "../../verification/engine"
export type { OpportunityScoreReport } from "../opportunity-scoring"
export type { NormalizedQuoteInput, QuoteComparisonReport } from "../quote-comparator"
export type { RecommendationReport } from "../recommendation-engine"
export type { NormalizedMarketSnapshot, RiskReport } from "../risk-engine"
export type { ArbitrageOpportunity } from "../../../types/arbitrage"

/**
 * Normalized input the pipeline accepts: one already-normalized input per
 * stage that needs one. The pipeline never derives one shape from another —
 * deriving NormalizedQuoteInput or NormalizedMarketSnapshot from an
 * ArbitrageOpportunity would itself be a calculation, which is outside this
 * pipeline's orchestration-only responsibility. The caller supplies all
 * three already built.
 */
export interface RecommendationPipelineInput {
  /** Passed to the Verification Engine untouched. */
  opportunity: ArbitrageOpportunity
  /** Passed to the Quote Comparator untouched. */
  comparisonInput: NormalizedQuoteInput
  /** Passed to the Risk Engine untouched. */
  riskInput: NormalizedMarketSnapshot
}

/**
 * Full pipeline result — every stage's output, verbatim. No field here is
 * recalculated or transformed; each one is exactly what its engine produced.
 */
export interface RecommendationPipelineResult {
  verification: VerificationEngineResult
  comparison: QuoteComparisonReport
  risk: RiskReport
  scoring: OpportunityScoreReport
  recommendation: RecommendationReport
}
