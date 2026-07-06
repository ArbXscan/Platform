/**
 * Raw, caller-supplied token metadata. This is the only input the Asset
 * Identity engine ever reads — it never fetches this itself. Every optional
 * field left out stays unknown throughout the engine; nothing here is ever
 * defaulted or invented downstream.
 */
export interface RawAssetMetadataInput {
  contractAddress: string
  chain: string
  symbol: string
  name?: string
  decimals?: number
  logoUrl?: string
  verified?: boolean
}

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

/**
 * "unknown" is a first-class level, not a fallback error state — it means
 * there wasn't enough metadata to have an opinion about this asset's
 * identity at all.
 */
export type IdentityConfidence = "high" | "medium" | "low" | "unknown"

/**
 * Fully resolved asset identity. Every field is either copied straight from
 * the input, derived from a documented pattern match, or left undefined —
 * never fabricated.
 */
export interface AssetIdentity {
  /** Undefined if the input didn't supply a name — never falls back to the symbol or address. */
  displayName?: string
  displaySymbol: string
  contractAddress: string
  chain: string
  assetCategory: AssetCategory
  isNativeAsset: boolean
  isWrappedAsset: boolean
  isStablecoin: boolean
  isLP: boolean
  isMeme: boolean
  /** Undefined whenever the input didn't supply `verified` — verification is never inferred. */
  isVerified?: boolean
  /** Undefined if the input didn't supply decimals — never defaulted (e.g. to 18). */
  decimals?: number
  /** Undefined if the input didn't supply a logo — never guessed from a symbol or address. */
  logoUrl?: string
  confidence: IdentityConfidence
}
