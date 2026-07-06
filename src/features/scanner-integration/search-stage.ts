import { searchAndRankAssets } from "../search-ranking"
import type { AssetIdentityReport, RankedAssetResult, SearchQuery, StageResult } from "./types"

/**
 * Stage 1: Search Ranking, executed as-is. Returns the top-ranked match, if
 * any — no ranking or scoring logic is duplicated here, only a single call
 * to the existing engine.
 */
export function runSearchStage(
  query: SearchQuery,
  availableAssets: AssetIdentityReport[],
): StageResult<RankedAssetResult> {
  const ranked = searchAndRankAssets(availableAssets, query)
  const topMatch = ranked[0]

  if (!topMatch) {
    return { status: "failed" }
  }

  return { status: "success", data: topMatch }
}
