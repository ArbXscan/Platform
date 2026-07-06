import type {
  CrossChainOpportunityReport,
  NormalizedTokenSnapshot,
  RecommendationPipelineResult,
  TokenScanResult,
} from "../recommendation/integration"
import type { AssetIdentity } from "../asset-identity"
import type { AssetIdentityReport, RankedAssetResult, SearchQuery } from "../search-ranking"

/** Re-exported so consumers of this layer don't need to reach into each module directly. */
export type { AssetIdentity, RawAssetMetadataInput } from "../asset-identity"
export type {
  CrossChainOpportunityReport,
  NormalizedTokenSnapshot,
  RecommendationPipelineResult,
  TokenScanResult,
} from "../recommendation/integration"
export type { AssetIdentityReport, RankedAssetResult, SearchQuery } from "../search-ranking"

export type StageStatus = "success" | "failed" | "skipped"

/**
 * One stage's outcome: a status plus whatever data it produced, if any.
 * "skipped" means an earlier stage's failure stopped the flow before this
 * stage ever ran. "failed" means this stage did run but didn't produce a
 * usable result — its `data`, if present, is still whatever the engine
 * returned (e.g. an invalid TokenScanResult), never discarded.
 */
export interface StageResult<T> {
  status: StageStatus
  data?: T
}

/** Input to the full Scanner Integration flow. */
export interface ScannerIntegrationRequest {
  query: SearchQuery
  /** Candidate assets to search, already identity-resolved into search-ranking's shape. */
  availableAssets: AssetIdentityReport[]
  /** Every known snapshot of the winning asset across chains, for cross-chain matching. */
  snapshots: NormalizedTokenSnapshot[]
  /** Forwarded to the Recommendation Pipeline's profitability estimate if provided. */
  tradeAmountUsd?: number
}

/**
 * Full, normalized report of running every stage. Nothing here is
 * recalculated — every field is exactly what the corresponding existing
 * engine produced, passed through unchanged.
 */
export interface ScannerIntegrationReport {
  searchResult: StageResult<RankedAssetResult>
  assetIdentity: StageResult<AssetIdentity>
  tokenScan: StageResult<TokenScanResult>
  crossChain: StageResult<CrossChainOpportunityReport>
  recommendation: StageResult<RecommendationPipelineResult>
  reason: string
}
