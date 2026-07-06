import { classifyMatch } from "./filters"
import { buildRankedResult, compareRankedResults } from "./scoring"
import type { AssetIdentityReport, RankedAssetResult, SearchQuery } from "./types"

/**
 * Ranks a list of assets against a search query: filters out assets that
 * don't match at all, scores and sorts the rest deterministically, and
 * assigns a final 1-based rank. Pure function — never mutates the input
 * array or any asset within it; always returns a new array and new result
 * objects.
 */
export function rankAssets(assets: AssetIdentityReport[], query: SearchQuery): RankedAssetResult[] {
  const matching = assets.filter((asset) => classifyMatch(asset, query) !== "none")
  const scored = matching.map((asset) => buildRankedResult(asset, query))
  const sorted = [...scored].sort(compareRankedResults)

  return sorted.map((result, index) => ({ ...result, rank: index + 1 }))
}
