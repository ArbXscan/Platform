import { searchPairs } from "../../services/providers/dexscreener"
import type { DexScreenerPair } from "../../services/providers/dexscreener"
import { normalizeSearchQuery, rankAssets } from "../search-ranking"
import type { AssetIdentityReport, RankedAssetResult, SearchQuery } from "../search-ranking"
import type { TokenSearchResult } from "../../types/token"
import { findRecognizedAsset } from "../../registry/assets"
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
 * The Search Adapter (search-adapter.ts) recognizes an asset via
 * findRecognizedAsset(symbol) ?? findRecognizedAsset(name) — but that
 * lookup index is keyed by symbol, name, AND alias together (see
 * registry/assets/index.ts), so a token whose *symbol* happens to collide
 * with a canonical asset's *name* (e.g. a meme coin trading under the
 * symbol "BITCOIN") gets incorrectly marked verified/native/wrapped, which
 * then outranks the real canonical asset. This corrects exactly that case:
 * an asset only keeps its recognized-derived flags when the recognized
 * entry's actual symbol or actual name precisely matches this token's own
 * symbol or name — not merely some other field colliding in the shared
 * lookup index. Reuses the same findRecognizedAsset() the adapter already
 * calls; no recognition logic is duplicated, only re-validated.
 */
function reconcileCanonicalIdentity(asset: AssetIdentityReport, pair: DexScreenerPair): AssetIdentityReport {
  const recognized = findRecognizedAsset(pair.baseToken.symbol) ?? findRecognizedAsset(pair.baseToken.name)
  if (!recognized) return asset

  const symbol = pair.baseToken.symbol.trim().toLowerCase()
  const name = pair.baseToken.name.trim().toLowerCase()
  const isPreciseMatch =
    recognized.symbol.toLowerCase() === symbol ||
    recognized.name.toLowerCase() === name ||
    recognized.name.toLowerCase() === symbol ||
    recognized.symbol.toLowerCase() === name

  if (isPreciseMatch) return asset

  // Recognized only through a coincidental cross-field collision in the shared
  // lookup index (e.g. this token's symbol matches another asset's name) —
  // not a genuine identity match. Treat as unrecognized rather than trusting it.
  return {
    ...asset,
    isNativeAsset: false,
    isWrappedAsset: false,
    isStablecoin: false,
    assetCategory: "Unknown",
    isVerified: undefined,
    confidence: "unknown",
  }
}

/**
 * Returns the same grouped, adapted candidates searchTokens() ranks
 * internally, but as raw AssetIdentityReport[] instead of ranked
 * TokenSearchResult[] — for callers (like Scanner Integration's
 * availableAssets) that need to do their own matching/ranking via
 * features/search-ranking themselves. Reuses searchPairs, groupByToken, and
 * the Search Adapter exactly as searchTokens() does; nothing here is a
 * second search implementation.
 */
export async function searchAssetIdentities(query: string): Promise<AssetIdentityReport[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const pairs = await searchPairs(trimmed)
  if (pairs.length === 0) return []

  const groups = groupByToken(pairs)
  return Array.from(groups.values()).map((group) =>
    reconcileCanonicalIdentity(toAssetIdentityReport(group.bestPair), group.bestPair),
  )
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

  const assets: AssetIdentityReport[] = groupList.map((group) =>
    reconcileCanonicalIdentity(toAssetIdentityReport(group.bestPair), group.bestPair),
  )
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
