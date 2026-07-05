import { runOpportunityScoringEngine } from "../opportunity-scoring"
import { compareNormalizedQuotes } from "../quote-comparator"
import { runRecommendationEngine } from "../recommendation-engine"
import { runRiskEngine } from "../risk-engine"
import { runVerificationEngine } from "../../verification/engine"
import type {
  OpportunityScoreReport,
  QuoteComparisonReport,
  RecommendationPipelineInput,
  RecommendationReport,
  RiskReport,
  VerificationEngineResult,
} from "./types"

/**
 * Stage 1: Verification Engine, executed as-is. This wrapper performs no
 * calculation of its own — it only forwards the opportunity to the existing
 * engine and returns its result untouched.
 */
export function runVerificationStage(input: RecommendationPipelineInput): Promise<VerificationEngineResult> {
  return runVerificationEngine(input.opportunity)
}

/**
 * Stage 2: Quote Comparator, executed as-is. No spread, profitability, or
 * confidence math happens here — that logic lives entirely in the comparator.
 */
export function runComparisonStage(input: RecommendationPipelineInput): QuoteComparisonReport {
  return compareNormalizedQuotes(input.comparisonInput)
}

/**
 * Stage 3: Risk Engine, executed as-is. No risk scoring happens here — that
 * logic lives entirely in the risk engine.
 */
export function runRiskStage(input: RecommendationPipelineInput): RiskReport {
  return runRiskEngine(input.riskInput)
}

/**
 * Stage 4: Opportunity Scoring Engine, executed as-is, consuming stage 2 and
 * stage 3's outputs. No scoring math happens here — that logic lives
 * entirely in the scoring engine.
 */
export function runScoringStage(comparison: QuoteComparisonReport, risk: RiskReport): OpportunityScoreReport {
  return runOpportunityScoringEngine({ comparison, risk })
}

/**
 * Stage 5: Recommendation Engine, executed as-is, consuming every prior
 * stage's output. No summarization, warning, or confidence logic happens
 * here — that logic lives entirely in the recommendation engine.
 */
export function runRecommendationStage(
  verification: VerificationEngineResult,
  comparison: QuoteComparisonReport,
  risk: RiskReport,
  scoring: OpportunityScoreReport,
): RecommendationReport {
  return runRecommendationEngine({ verification, comparison, risk, scoring })
}
