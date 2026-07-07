/**
 * The five asset shapes the registry is required to represent. Deliberately
 * its own type, not imported from features/asset-identity, so this module
 * stays independent and reusable — asset-identity will consume registry
 * data later, not the other way around.
 */
export type AssetCategory = "Native" | "Wrapped" | "Stablecoin" | "Meme" | "Utility"

/**
 * "unknown" is a first-class level, not a fallback — it means verification
 * was never confirmed one way or the other for this entry, which is
 * different from actively confirming it's unverified.
 */
export type VerificationStatus = "verified" | "unverified" | "unknown"

/**
 * Full, registry-held metadata for one supported asset on one chain. This
 * is identity/reference data only — no price, no liquidity, no volume, and
 * nothing here is ever calculated. Every optional field left unset by
 * whoever populates the registry stays undefined; nothing is defaulted or
 * guessed (e.g. decimals never falls back to 18).
 */
export interface AssetRegistryEntry {
  symbol: string
  /** Undefined if no display name was supplied — never falls back to the symbol. */
  displayName?: string
  chain: string
  contractAddress: string
  /** Undefined if not supplied — never defaulted to a common value like 18. */
  decimals?: number
  category: AssetCategory
  verificationStatus: VerificationStatus
  /** Undefined if no logo was supplied — never guessed from a symbol or address. */
  logoUrl?: string
  /** Other symbols/names this asset is known by (e.g. "WBTC" as an alias entry for wrapped Bitcoin). Undefined if none are declared. */
  aliases?: string[]
}
