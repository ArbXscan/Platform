import type { CrossChainOpportunityReport, NormalizedTokenSnapshot } from "../../cross-chain"
import type { RecommendationPipelineResult } from "../pipeline"
import type { TokenScanResult } from "../../token-scanner"

/** Re-exported so consumers of the integration layer don't need to reach into each module directly. */
export type { CrossChainOpportunityReport, NormalizedTokenSnapshot } from "../../cross-chain"
export type { RecommendationPipelineResult } from "../pipeline"
export type { TokenScanResult } from "../../token-scanner"

/**
 * Input to the integration layer: a raw address to scan, plus the caller-
 * supplied normalized snapshots to search for a cross-chain match. This
 * layer never fetches these itself (no HTTP, no SDK) — the caller gathers
 * them from whichever market provider it already uses.
 */
export interface TokenRecommendationRequest {
  address: string
  /** Every known snapshot of this asset across chains, used for cross-chain matching. */
  snapshots: NormalizedTokenSnapshot[]
  /** Trade size in USD, forwarded to the Quote Comparator's profitability estimate if provided. Undefined = profitability estimate stays unavailable. */
  tradeAmountUsd?: number
}

/**
 * How far the integration got. Each stage short-circuits gracefully rather
 * than pushing incomplete or fabricated data into the next one.
 */
export type IntegrationStage = "address-invalid" | "no-cross-chain-opportunity" | "pipeline-complete"

/**
 * Normalized result of running the full integration. `crossChain` is only
 * populated once the address scan passed; `pipeline` is only populated once
 * a real cross-chain opportunity was mapped and run through the
 * Recommendation Pipeline. Nothing here is recalculated — every field comes
 * from the module that already produced it.
 */
export interface TokenRecommendationResult {
  stage: IntegrationStage
  tokenScan: TokenScanResult
  /** Undefined unless the token scan passed and cross-chain matching was attempted. */
  crossChain?: CrossChainOpportunityReport
  /** Undefined unless the Recommendation Pipeline actually ran. */
  pipeline?: RecommendationPipelineResult
  reason: string
}
