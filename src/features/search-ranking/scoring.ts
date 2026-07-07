import { classifyMatch } from "./filters"
import { calculateSearchConfidenceScore } from "./confidence"
import { calculatePriorityScore } from "./priority"
import type { AssetIdentityReport, MatchType, RankedAssetResult, SearchQuery } from "./types"

/** Match specificity ordinal, used only as a tiebreaker layer here — the same match-type distinctions already contribute to the priority score itself in priority.ts. */
const MATCH_TYPE_ORDER: Record<MatchType, number> = {
  "exact-symbol": 4,
  "exact-name": 3,
  prefix: 2,
  contains: 1,
  none: 0,
}

/**
 * Builds an unranked result (rank is assigned later, once the full list is
 * sorted — see ranking.ts) for one asset against one query. Pure function:
 * no mutation, no randomness.
 */
export function buildRankedResult(asset: AssetIdentityReport, query: SearchQuery): Omit<RankedAssetResult, "rank"> {
  const matchType = classifyMatch(asset, query)

  return {
    asset,
    matchType,
    score: calculatePriorityScore(asset, query),
    confidenceScore: calculateSearchConfidenceScore(matchType, asset.confidence),
  }
}

function lower(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Deterministic comparator. Sorts by:
 *  1. priority score, descending
 *  2. confidence score, descending
 *  3. match specificity, descending
 *  4. displaySymbol, then displayName, then chain, then contractAddress —
 *     all lexicographic, ascending
 *
 * Two results can only ever be considered equal here if every one of these
 * is identical between them — nothing is ever left to depend on the
 * original input array's order, so the same input always produces the same
 * ranked order regardless of how the assets were originally supplied. Never
 * random, never mutates either argument.
 */
export function compareRankedResults(
  a: Omit<RankedAssetResult, "rank">,
  b: Omit<RankedAssetResult, "rank">,
): number {
  if (b.score !== a.score) return b.score - a.score
  if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore

  const matchOrderDelta = MATCH_TYPE_ORDER[b.matchType] - MATCH_TYPE_ORDER[a.matchType]
  if (matchOrderDelta !== 0) return matchOrderDelta

  const symbolA = lower(a.asset.displaySymbol)
  const symbolB = lower(b.asset.displaySymbol)
  if (symbolA !== symbolB) return symbolA < symbolB ? -1 : 1

  const nameA = lower(a.asset.displayName ?? "")
  const nameB = lower(b.asset.displayName ?? "")
  if (nameA !== nameB) return nameA < nameB ? -1 : 1

  const chainA = lower(a.asset.chain)
  const chainB = lower(b.asset.chain)
  if (chainA !== chainB) return chainA < chainB ? -1 : 1

  const addressA = lower(a.asset.contractAddress)
  const addressB = lower(b.asset.contractAddress)
  if (addressA !== addressB) return addressA < addressB ? -1 : 1

  return 0
}
