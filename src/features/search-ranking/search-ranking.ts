import { rankAssets } from "./ranking"
import type { AssetIdentityReport, RankedAssetResult, SearchQuery } from "./types"

/**
 * The single public entry point of the Search Ranking Engine. Given a list
 * of normalized asset identity reports and a search query, returns a
 * deterministically ranked, filtered list of matches — no random ordering,
 * no mutation of the input, no placeholder scores. Assets that don't match
 * the query at all are excluded rather than ranked last.
 */
export function searchAndRankAssets(assets: AssetIdentityReport[], query: SearchQuery): RankedAssetResult[] {
  return rankAssets(assets, query)
}
