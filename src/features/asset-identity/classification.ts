import type { AssetCategory, RawAssetMetadataInput } from "./types"

/** Well-known native gas-token symbols. A real, static reference list — not fetched, not guessed. */
const NATIVE_SYMBOLS = new Set(["ETH", "BNB", "MATIC", "POL", "AVAX", "SOL", "APT", "SUI"])

/** Common "wrapped native" ticker convention: a leading "W" plus a known native symbol. */
const WRAPPED_SYMBOL_PATTERN = /^W(ETH|BNB|MATIC|POL|AVAX|BTC|SOL)$/

const STABLECOIN_SYMBOLS = new Set([
  "USDC",
  "USDT",
  "DAI",
  "BUSD",
  "TUSD",
  "USDE",
  "FDUSD",
  "USDP",
  "GUSD",
  "FRAX",
  "PYUSD",
  "USDD",
])

const LIQUID_STAKING_SYMBOLS = new Set([
  "STETH",
  "WSTETH",
  "RETH",
  "CBETH",
  "MSOL",
  "STSOL",
  "JITOSOL",
  "SFRXETH",
  "ANKRETH",
])

const LP_KEYWORDS = ["lp", "liquidity", "uni-v2", "uni-v3", "slp", "cake-lp", "pair"]
const MEME_KEYWORDS = ["inu", "pepe", "doge", "shib", "elon", "moon", "meme", "wojak", "floki"]
const GOVERNANCE_KEYWORDS = ["governance", "dao"]

function normalizedSymbol(input: RawAssetMetadataInput): string {
  return input.symbol.trim().toUpperCase()
}

function normalizedName(input: RawAssetMetadataInput): string {
  return (input.name ?? "").trim().toLowerCase()
}

/** True only when the symbol is an exact match against the known native-coin list. */
export function isNativeAsset(input: RawAssetMetadataInput): boolean {
  return NATIVE_SYMBOLS.has(normalizedSymbol(input))
}

/** True when the symbol matches the "W" + native-symbol convention, or the name is explicitly prefixed "Wrapped". */
export function isWrappedAsset(input: RawAssetMetadataInput): boolean {
  return WRAPPED_SYMBOL_PATTERN.test(normalizedSymbol(input)) || normalizedName(input).startsWith("wrapped ")
}

/** True when the symbol is an exact match against known stablecoin tickers, or contains "USD". */
export function isStablecoin(input: RawAssetMetadataInput): boolean {
  const symbol = normalizedSymbol(input)
  return STABLECOIN_SYMBOLS.has(symbol) || symbol.includes("USD")
}

/** True when the symbol matches a known liquid-staking ticker, or the name references staking. */
export function isLiquidStaking(input: RawAssetMetadataInput): boolean {
  const symbol = normalizedSymbol(input)
  const name = normalizedName(input)
  return LIQUID_STAKING_SYMBOLS.has(symbol) || name.includes("staked") || name.includes("liquid staking")
}

/** True when the symbol or name contains a common LP-token keyword. */
export function isLPToken(input: RawAssetMetadataInput): boolean {
  const symbol = normalizedSymbol(input).toLowerCase()
  const name = normalizedName(input)
  return LP_KEYWORDS.some((keyword) => symbol.includes(keyword) || name.includes(keyword))
}

/** True when the symbol or name contains a common meme-token keyword. A heuristic signal only, not a definitive judgment. */
export function isMemeAsset(input: RawAssetMetadataInput): boolean {
  const symbol = normalizedSymbol(input).toLowerCase()
  const name = normalizedName(input)
  return MEME_KEYWORDS.some((keyword) => symbol.includes(keyword) || name.includes(keyword))
}

/** True when the name references governance or a DAO. */
export function isGovernanceAsset(input: RawAssetMetadataInput): boolean {
  const name = normalizedName(input)
  return GOVERNANCE_KEYWORDS.some((keyword) => name.includes(keyword))
}

/**
 * Determines the single best-matching asset category from symbol/name
 * pattern matching only. Priority matters where categories could otherwise
 * overlap: native, wrapped, stablecoin, and liquid-staking are checked
 * before the broader LP/governance/meme buckets. Returns "Unknown" whenever
 * no pattern matches, rather than guessing.
 *
 * "Utility" is a valid AssetCategory but is never assigned by this function —
 * there's no reliable signal in a bare symbol or name that positively
 * indicates general utility, so classifying something as "Utility" from
 * pattern matching alone would be a guess. That category exists in the type
 * for a future layer with more information (e.g. a curated registry) to use.
 */
export function classifyAssetCategory(input: RawAssetMetadataInput): AssetCategory {
  if (isNativeAsset(input)) return "Native Coin"
  if (isWrappedAsset(input)) return "Wrapped Asset"
  if (isStablecoin(input)) return "Stablecoin"
  if (isLiquidStaking(input)) return "Liquid Staking"
  if (isLPToken(input)) return "LP Token"
  if (isGovernanceAsset(input)) return "Governance"
  if (isMemeAsset(input)) return "Meme"
  return "Unknown"
}
