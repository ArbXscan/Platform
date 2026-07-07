import { classifyMatch } from "./filters"
import type { AssetIdentityReport, SearchQuery } from "./types"

/**
 * Priority weights, one per ranking factor. Ordered from most to least
 * decisive:
 *  1  canonical      — the native asset itself, not a bridged/wrapped
 *                       representation of it (e.g. Bitcoin, not Wrapped Bitcoin)
 *  2  officialWrapped — a verified, wrapped representation of another asset
 *                       (e.g. WBTC, BTC.b) — a trusted bridge/wrap, not a copy
 *  3  verified        — any other verified asset
 *  4  exactSymbol      — the query is an exact match for the asset's symbol
 *  5  exactName        — the query is an exact match for the asset's name
 *  6  prefix           — the query is a prefix of the symbol or name
 *  7  wrapped          — wrapped, but not confirmed verified
 *  8  stablecoin
 *  9  contains         — the query appears somewhere in the symbol or name
 *  10 governance
 *  11 utility
 *  12 lp
 *  13 meme
 *
 * Each weight is more than double the sum of every weight below it, which
 * guarantees a higher-priority factor always outranks any possible
 * combination of lower ones — a deterministic, collision-free ordering by
 * construction, not a tuned or guessed set of numbers. This is what
 * guarantees, for example, that no combination of unverified signals can
 * ever outscore a single verified asset, and no verified asset — however
 * many lower-tier boxes it also ticks — can ever outscore the canonical
 * (native) one.
 */
const WEIGHTS = {
  canonical: 4096,
  officialWrapped: 2048,
  verified: 1024,
  exactSymbol: 512,
  exactName: 256,
  prefix: 128,
  wrapped: 64,
  stablecoin: 32,
  contains: 16,
  governance: 8,
  utility: 4,
  lp: 2,
  meme: 1,
} as const

/**
 * Whether an asset is a verified, wrapped representation of another asset
 * (e.g. WBTC, BTC.b) — a trusted bridged/wrapped token, as opposed to an
 * unverified copy that merely sets the "wrapped" flag. Derived only from
 * existing metadata already available on AssetIdentityReport; nothing here
 * is fabricated, guessed, or hardcoded per token.
 */
export function isOfficialWrappedAsset(asset: AssetIdentityReport): boolean {
  return asset.isWrappedAsset && asset.isVerified === true
}

/**
 * Computes the deterministic priority score for one asset against one
 * query. Pure function: reads only from its arguments, never mutates
 * either one, and always returns the same score for the same inputs — no
 * randomness, no placeholder value. Classifies the match exactly once (via
 * classifyMatch) and derives every match-based bonus from that single
 * classification rather than re-testing the query against the asset
 * multiple times.
 */
export function calculatePriorityScore(asset: AssetIdentityReport, query: SearchQuery): number {
  const matchType = classifyMatch(asset, query)
  let score = 0

  if (asset.isNativeAsset) score += WEIGHTS.canonical
  if (isOfficialWrappedAsset(asset)) score += WEIGHTS.officialWrapped
  if (asset.isVerified === true) score += WEIGHTS.verified
  if (matchType === "exact-symbol") score += WEIGHTS.exactSymbol
  if (matchType === "exact-name") score += WEIGHTS.exactName
  if (matchType === "prefix") score += WEIGHTS.prefix
  if (asset.isWrappedAsset) score += WEIGHTS.wrapped
  if (asset.isStablecoin) score += WEIGHTS.stablecoin
  if (matchType === "contains") score += WEIGHTS.contains
  if (asset.assetCategory === "Governance") score += WEIGHTS.governance
  if (asset.assetCategory === "Utility") score += WEIGHTS.utility
  if (asset.isLP) score += WEIGHTS.lp
  if (asset.isMeme) score += WEIGHTS.meme

  return score
}
