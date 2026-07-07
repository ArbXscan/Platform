import type {
  CrossChainOpportunityReport,
  NormalizedTokenSnapshot,
  RecommendationPipelineResult,
  TokenScanResult,
} from "../recommendation/integration"
import type { AssetIdentity } from "../asset-identity"
import type { AssetIdentityReport, RankedAssetResult, SearchQuery } from "../search-ranking"
import type { AssetRegistryEntry } from "../asset-registry"
import type { ProviderDataResponse } from "../backend-api"

/** Re-exported so consumers of this layer don't need to reach into each module directly. */
export type { AssetIdentity, RawAssetMetadataInput } from "../asset-identity"
export type {
  CrossChainOpportunityReport,
  NormalizedTokenSnapshot,
  RecommendationPipelineResult,
  TokenScanResult,
} from "../recommendation/integration"
export type { AssetIdentityReport, RankedAssetResult, SearchQuery } from "../search-ranking"
export type { AssetRegistryEntry } from "../asset-registry"
export type { ProviderDataResponse } from "../backend-api"

/** Carried over verbatim from RecommendationPipelineResult — never recalculated here. */
export type VerificationEngineResult = RecommendationPipelineResult["verification"]

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
 *
 * `assetRegistry`, `backendApi`, and `verification` are additive,
 * supplementary fields: they never gate or alter the existing
 * search/identity/scan/crossChain/recommendation short-circuit flow. Any
 * consumer reading only the original five fields plus `reason` sees
 * identical behavior to before.
 */
export interface ScannerIntegrationReport {
  searchResult: StageResult<RankedAssetResult>
  assetIdentity: StageResult<AssetIdentity>
  tokenScan: StageResult<TokenScanResult>
  crossChain: StageResult<CrossChainOpportunityReport>
  recommendation: StageResult<RecommendationPipelineResult>
  reason: string
  /** Asset Registry lookup for the resolved asset, if one is registered (features/asset-registry). Supplementary — never overrides Asset Identity's own resolution. */
  assetRegistry?: StageResult<AssetRegistryEntry>
  /** Raw market-data provider status for the resolved asset via the Backend API Gateway (features/backend-api). Supplementary telemetry only. */
  backendApi?: StageResult<ProviderDataResponse>
  /** Unwrapped from `recommendation.data.verification` for direct access — not a new engine call. */
  verification?: StageResult<VerificationEngineResult>
}

/**
 * Normalized, flat view of one successful scan, built only from fields the
 * existing engines already produced (no field here is calculated). Used
 * for aggregating multiple scans into a single opportunity list.
 */
export interface ScannerOpportunity {
  assetSymbol: string
  buyChainId: string
  buyExchange: string
  sellChainId: string
  sellExchange: string
  spreadPercent?: number
  bridgeRequirementLevel: CrossChainOpportunityReport["bridgeRequirement"]["level"]
  overallScore?: RecommendationPipelineResult["scoring"]["overallScore"]
  starRating?: RecommendationPipelineResult["scoring"]["starRating"]
  recommendationLevel: RecommendationPipelineResult["recommendation"]["recommendationLevel"]
  overallRiskLevel: RecommendationPipelineResult["risk"]["overallLevel"]
  overallConfidence: RecommendationPipelineResult["recommendation"]["overallConfidence"]
  detectedAt: string
}
