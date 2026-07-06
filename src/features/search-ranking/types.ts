export type AssetCategory =
  | "Native Coin"
  | "Wrapped Asset"
  | "Stablecoin"
  | "Liquid Staking"
  | "LP Token"
  | "Meme"
  | "Governance"
  | "Utility"
  | "Unknown"

export type IdentityConfidence = "high" | "medium" | "low" | "unknown"

/**
 * Normalized asset identity data the Search Ranking Engine ranks against.
 * Deliberately self-contained — mirrors the shape a module like
 * features/asset-identity conceptually produces, but is defined locally so
 * this engine has zero dependency on that or any other feature, ruling out
 * any possibility of a circular dependency.
 */
export interface AssetIdentityReport {
  contractAddress: string
  chain: string
  displaySymbol: string
  displayName?: string
  assetCategory: AssetCategory
  isNativeAsset: boolean
  isWrappedAsset: boolean
  isStablecoin: boolean
  isLP: boolean
  isMeme: boolean
  isVerified?: boolean
  confidence: IdentityConfidence
}

export interface SearchQuery {
  term: string
}

/**
 * How an asset matched the query, from most to least specific. "none" means
 * the term wasn't found in the symbol or name at all — such assets are
 * excluded from ranked results rather than ranked last.
 */
export type MatchType = "exact-symbol" | "exact-name" | "prefix" | "contains" | "none"

export interface RankedAssetResult {
  asset: AssetIdentityReport
  matchType: MatchType
  /** Deterministic, non-negative priority score used for primary sorting. Higher ranks first. */
  score: number
  /** 1-based position in the final ranked list. */
  rank: number
}
