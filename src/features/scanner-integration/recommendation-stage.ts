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
    return {
      crossChain: result.crossChain ? { status: "failed", data: result.crossChain } : { status: "failed" },
      recommendation: { status: "skipped" },
    }
  }

  // result.stage === "pipeline-complete"
  return {
    crossChain: result.crossChain ? { status: "success", data: result.crossChain } : { status: "failed" },
    recommendation: result.pipeline ? { status: "success", data: result.pipeline } : { status: "failed" },
  }
}
