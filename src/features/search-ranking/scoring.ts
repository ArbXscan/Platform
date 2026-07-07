import { classifyMatch } from "./filters"
import { calculateSearchConfidenceScore } from "./confidence"
import { calculatePriorityScore } from "./priority"
import type { AssetIdentityReport, IdentityConfidence, RankedAssetResult, SearchQuery } from "./types"

/** Ordinal used only for the confidence tiebreaker — never blended into the priority score itself. */
const CONFIDENCE_ORDER: Record<IdentityConfidence, number> = { high: 3, medium: 2, low: 1, unknown: 0 }

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

/**
 * Deterministic comparator: sorts by priority score descending, then by
 * confidence descending as the tiebreaker requested ("then sort by
 * confidence"). Never random, never mutates either argument.
 */
export function compareRankedResults(
  a: Omit<RankedAssetResult, "rank">,
  b: Omit<RankedAssetResult, "rank">,
): number {
  if (b.score !== a.score) return b.score - a.score
  return CONFIDENCE_ORDER[b.asset.confidence] - CONFIDENCE_ORDER[a.asset.confidence]
}
