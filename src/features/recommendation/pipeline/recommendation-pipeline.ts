import { orchestrateRecommendationPipeline } from "./orchestrator"
import type { RecommendationPipelineInput, RecommendationPipelineResult } from "./types"

/**
 * The single public entry point of the Recommendation Pipeline.
 *
 * Runs the Verification Engine, Quote Comparator, Risk Engine, Opportunity
 * Scoring Engine, and Recommendation Engine in order, and returns every
 * stage's output untouched: { verification, comparison, risk, scoring,
 * recommendation }.
 *
 * This pipeline is responsible only for orchestration — it never calculates
 * risk, spread, score, confidence, or recommendation itself, and never
 * duplicates logic that already lives in those engines. Fully
 * provider-agnostic: no React, no HTTP, no SDK, no API key. Not called from
 * anywhere yet.
 */
export function runRecommendationPipeline(
  input: RecommendationPipelineInput,
): Promise<RecommendationPipelineResult> {
  return orchestrateRecommendationPipeline(input)
}
