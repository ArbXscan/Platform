import { searchPairs } from "../../services/providers/dexscreener"
import type { DexScreenerPair } from "../../services/providers/dexscreener"
import { normalizeSearchQuery, rankAssets } from "../search-ranking"
import type { AssetIdentityReport, RankedAssetResult, SearchQuery } from "../search-ranking"
import type { TokenSearchResult } from "../../types/token"
import { toAssetIdentityReport } from "./search-adapter"

const MAX_RESULTS = 20

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

interface CandidateGroup {
  liquidityUsd: number
  volume24hUsd: number
  bestPair: DexScreenerPair
}

function groupKey(chainId: string, address: string): string {
  return `${chainId.trim().toLowerCase()}:${address.trim().toLowerCase()}`
}

/**
 * Groups pairs by token identity (chain + contract address) — the same
 * token often trades on multiple pairs/DEXs, and each of those should
 * count as ONE search candidate, not one per pair. Liquidity/volume are
 * summed across the group's pairs; the group's bestPair is whichever
 * single pair has the highest liquidity, used for display fields (logo,
 * price, dexId). This aggregation has no equivalent in the Search Ranking
 * Engine, so it stays here; relevance filtering and ranking do not — see
 * searchTokens(), which hands every group to rankAssets() instead of
 * scoring/sorting candidates itself.
 */
function groupByToken(pairs: DexScreenerPair[]): Map<string, CandidateGroup> {
  const groups = new Map<string, CandidateGroup>()

  for (const pair of pairs) {
    const key = groupKey(pair.chainId, pair.baseToken.address)
    const liquidityUsd = pair.liquidity?.usd ?? 0
    const volume24hUsd = pair.volume?.h24 ?? 0
    const existing = groups.get(key)

    if (!existing) {
      groups.set(key, { liquidityUsd, volume24hUsd, bestPair: pair })
      continue
    }

    existing.liquidityUsd += liquidityUsd
    existing.volume24hUsd += volume24hUsd
    if (liquidityUsd > (existing.bestPair.liquidity?.usd ?? 0)) {
      existing.bestPair = pair
    }
  }

  return groups
}

function toSearchResult(ranked: RankedAssetResult, group: CandidateGroup): TokenSearchResult {
  const { bestPair } = group
  return {
    address: bestPair.baseToken.address,
    chainId: bestPair.chainId,
    symbol: bestPair.baseToken.symbol,
    name: bestPair.baseToken.name,
    // Same caveat as features/token/token.service.ts: DexScreener doesn't expose
    // decimals, and it isn't displayed anywhere in the search result card either.
    decimals: 0,
    logoUrl: bestPair.info?.imageUrl,
    priceUsd: bestPair.priceUsd ? toNumber(bestPair.priceUsd) : undefined,
    liquidityUsd: group.liquidityUsd,
    volume24hUsd: group.volume24hUsd,
    dexId: bestPair.dexId,
    isRecognized: ranked.asset.isVerified === true,
  }
}

/**
 * Returns ranked, deduplicated search candidates for a query — never a
 * single auto-resolved token.
 *
 * Flow: DexScreenerPair[] → grouped by token identity (liquidity/volume
 * aggregated) → converted to AssetIdentityReport via the Search Adapter
 * (search-adapter.ts) → ranked by the Search Ranking Engine
 * (features/search-ranking), which owns match relevance, canonical/
 * native/official-wrapped/verified prioritization, duplicate elimination,
 * and deterministic ordering — none of that logic is duplicated here —
 * → mapped back into TokenSearchResult.
 */
export async function searchTokens(query: string): Promise<TokenSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const pairs = await searchPairs(trimmed)
  if (pairs.length === 0) return []

  const groups = groupByToken(pairs)
  const groupList = Array.from(groups.values())

  const assets: AssetIdentityReport[] = groupList.map((group) => toAssetIdentityReport(group.bestPair))
  const searchQuery: SearchQuery = normalizeSearchQuery({ term: trimmed })
  const ranked = rankAssets(assets, searchQuery)

  const groupByAssetKey = new Map<string, CandidateGroup>(
    groupList.map((group) => [groupKey(group.bestPair.chainId, group.bestPair.baseToken.address), group]),
  )

  const results: TokenSearchResult[] = []
  for (const rankedResult of ranked.slice(0, MAX_RESULTS)) {
    const group = groupByAssetKey.get(groupKey(rankedResult.asset.chain, rankedResult.asset.contractAddress))
    if (!group) continue
    results.push(toSearchResult(rankedResult, group))
  }

  return results
}
