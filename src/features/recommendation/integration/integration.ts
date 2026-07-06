import { runRecommendationPipeline } from "../pipeline"
import { runCrossChainStage } from "./cross-chain-stage"
import { mapCrossChainOpportunityToPipelineInput } from "./opportunity-mapper"
import { runTokenScanStage } from "./token-scan-stage"
import type { TokenRecommendationRequest, TokenRecommendationResult } from "./types"

/**
 * The single public entry point of the Recommendation Integration Layer.
 *
 * Orchestrates three existing, unmodified modules in order:
 *   1. Token Scanner — validates the address format and detects candidate chains.
 *   2. Cross-Chain Engine — finds a cross-chain buy/sell match among the
 *      caller-supplied snapshots for that address.
 *   3. Recommendation Pipeline — runs Verification, Quote Comparator, Risk,
 *      Opportunity Scoring, and Recommendation Engine on the mapped opportunity.
 *
 * Each stage short-circuits gracefully on missing or invalid data rather
 * than pushing an incomplete result into the next stage: an invalid address
 * never reaches cross-chain matching, and a report with no real spread never
 * reaches the pipeline. This function calculates nothing itself — no risk,
 * spread, score, confidence, or recommendation logic lives here, only
 * sequencing and structural mapping between the three modules' shapes.
 * Fully provider-agnostic: no React, no HTTP, no SDK, no API key. Not called
 * from anywhere yet.
 */
export async function runTokenRecommendationIntegration(
  request: TokenRecommendationRequest,
): Promise<TokenRecommendationResult> {
  const tokenScan = runTokenScanStage(request.address)

  if (tokenScan.validation.status !== "valid") {
    return {
      stage: "address-invalid",
      tokenScan,
      reason: tokenScan.validation.reason,
    }
  }

  const normalizedAddress = tokenScan.tokenized.normalized
  const crossChain = runCrossChainStage(normalizedAddress, request.snapshots)

  if (!crossChain || !crossChain.opportunityExists) {
    return {
      stage: "no-cross-chain-opportunity",
      tokenScan,
      crossChain,
      reason:
        crossChain?.reason ?? "No cross-chain match was found for this address among the supplied snapshots.",
    }
  }

  const pipelineInput = mapCrossChainOpportunityToPipelineInput(crossChain, normalizedAddress, request.tradeAmountUsd)

  if (!pipelineInput) {
    return {
      stage: "no-cross-chain-opportunity",
      tokenScan,
      crossChain,
      reason: "A cross-chain opportunity was detected but could not be mapped to a complete pipeline input.",
    }
  }

  const pipeline = await runRecommendationPipeline(pipelineInput)

  return {
    stage: "pipeline-complete",
    tokenScan,
    crossChain,
    pipeline,
    reason: "Recommendation pipeline completed successfully.",
  }
}
