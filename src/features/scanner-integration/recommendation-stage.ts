import { runTokenRecommendationIntegration } from "../recommendation/integration"
import type {
  CrossChainOpportunityReport,
  NormalizedTokenSnapshot,
  RecommendationPipelineResult,
  StageResult,
} from "./types"

export interface RecommendationStageResult {
  crossChain: StageResult<CrossChainOpportunityReport>
  recommendation: StageResult<RecommendationPipelineResult>
}

/**
 * Stage 4: Recommendation Integration, executed as-is. This single existing
 * module already orchestrates the Cross-Chain Engine and the full five-engine
 * Recommendation Pipeline internally (see features/recommendation/integration)
 * — calling it here covers both of those steps without this layer
 * duplicating either one's logic.
 */
export async function runRecommendationStage(
  normalizedAddress: string,
  snapshots: NormalizedTokenSnapshot[],
  tradeAmountUsd: number | undefined,
): Promise<RecommendationStageResult> {
  const result = await runTokenRecommendationIntegration({
    address: normalizedAddress,
    snapshots,
    tradeAmountUsd,
  })

  if (result.stage === "address-invalid") {
    return {
      crossChain: { status: "skipped" },
      recommendation: { status: "skipped" },
    }
  }

  if (result.stage === "no-cross-chain-opportunity") {
    // A defined report means the Cross-Chain Engine ran successfully and found
    // this asset on 2+ chains — it just determined the spread doesn't clear
    // the opportunity bar (opportunityExists: false). That's a valid, complete
    // result (source/destination chain, buy/sell DEX, spread, reason are all
    // present), not a failure. Only the absence of any report at all (the
    // asset wasn't matchable across 2+ of the supplied snapshots) is "failed".
    return {
      crossChain: result.crossChain ? { status: "success", data: result.crossChain } : { status: "failed" },
      recommendation: { status: "skipped" },
    }
  }

  // result.stage === "pipeline-complete"
  return {
    crossChain: result.crossChain ? { status: "success", data: result.crossChain } : { status: "failed" },
    recommendation: result.pipeline ? { status: "success", data: result.pipeline } : { status: "failed" },
  }
}
