import {
  runComparisonStage,
  runRecommendationStage,
  runRiskStage,
  runScoringStage,
  runVerificationStage,
} from "./pipeline"
import type { RecommendationPipelineInput, RecommendationPipelineResult } from "./types"

/**
 * Runs every stage in the required order — Verification Engine, Quote
 * Comparator, Risk Engine, Opportunity Scoring Engine, Recommendation
 * Engine — and assembles their outputs into one RecommendationPipelineResult.
 *
 * Pure orchestration: every field in the result comes directly from the
 * engine that produced it, untouched. This function calculates nothing
 * itself — no risk, spread, score, confidence, or recommendation logic
 * lives here. Comparison and risk run independently of verification (their
 * inputs don't depend on it) before scoring combines them, and
 * recommendation is only run once every other stage has completed.
 */
export async function orchestrateRecommendationPipeline(
  input: RecommendationPipelineInput,
): Promise<RecommendationPipelineResult> {
  const verification = await runVerificationStage(input)
  const comparison = runComparisonStage(input)
  const risk = runRiskStage(input)
  const scoring = runScoringStage(comparison, risk)
  const recommendation = runRecommendationStage(verification, comparison, risk, scoring)

  return { verification, comparison, risk, scoring, recommendation }
}
