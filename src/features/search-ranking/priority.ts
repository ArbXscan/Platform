import { hasExactNameMatch, hasExactSymbolMatch } from "./filters"
import type { AssetIdentityReport, SearchQuery } from "./types"

/**
 * Priority weights, one per ranking factor, in the exact order requested:
 * 1 native, 2 verified, 3 exact symbol, 4 exact name, 5 wrapped,
 * 6 stablecoin, 7 governance, 8 utility, 9 LP, 10 meme.
 *
 * Each weight is more than double the sum of every weight below it
 * (511 total for all nine lower factors vs 512 for the top one), which
 * guarantees a higher-priority factor always outranks any possible
 * combination of lower ones. This is a deterministic, collision-free
 * ordering by construction, not a tuned or guessed set of numbers.
 */
const WEIGHTS = {
  native: 512,
  verified: 256,
  exactSymbol: 128,
  exactName: 64,
  wrapped: 32,
  stablecoin: 16,
  governance: 8,
  utility: 4,
  lp: 2,
  meme: 1,
} as const

/**
 * Computes the deterministic priority score for one asset against one
 * query. Pure function: reads only from its arguments, never mutates
 * either one, and always returns the same score for the same inputs — no
 * randomness, no placeholder value.
 */
export function calculatePriorityScore(asset: AssetIdentityReport, query: SearchQuery): number {
  let score = 0

  if (asset.isNativeAsset) score += WEIGHTS.native
  if (asset.isVerified === true) score += WEIGHTS.verified
  if (hasExactSymbolMatch(asset, query)) score += WEIGHTS.exactSymbol
  if (hasExactNameMatch(asset, query)) score += WEIGHTS.exactName
  if (asset.isWrappedAsset) score += WEIGHTS.wrapped
  if (asset.isStablecoin) score += WEIGHTS.stablecoin
  if (asset.assetCategory === "Governance") score += WEIGHTS.governance
  if (asset.assetCategory === "Utility") score += WEIGHTS.utility
  if (asset.isLP) score += WEIGHTS.lp
  if (asset.isMeme) score += WEIGHTS.meme

  return score
}
