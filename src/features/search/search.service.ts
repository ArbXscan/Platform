import { searchPairs, type DexScreenerPair } from "../../services/providers/dexscreener"
import type { TokenSearchResult } from "../../types/token"

const MAX_RESULTS = 20

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * Relevance tiers, highest first. A pair that matches neither the symbol nor
 * the name of the query (tier 0) is excluded entirely — DexScreener's search
 * already applies some server-side relevance, but nothing here assumes that;
 * every candidate is checked against the query directly.
 */
const TIER_EXACT_SYMBOL = 5
const TIER_EXACT_NAME = 4
const TIER_PREFIX = 3
const TIER_PARTIAL = 2
const TIER_NONE = 0

function matchTier(query: string, symbol: string, name: string): number {
  const q = query.trim().toLowerCase()
  const s = symbol.toLowerCase()
  const n = name.toLowerCase()

  if (s === q) return TIER_EXACT_SYMBOL
  if (n === q) return TIER_EXACT_NAME
  if (s.startsWith(q) || n.startsWith(q)) return TIER_PREFIX
  if (s.includes(q) || n.includes(q)) return TIER_PARTIAL
  return TIER_NONE
}

interface CandidateGroup {
  tier: number
  liquidityUsd: number
  volume24hUsd: number
  bestPair: DexScreenerPair
}

/**
 * Groups pairs by token identity (chain + contract address) — the same token
 * often trades on multiple pairs/DEXs, and each of those should count as ONE
 * search candidate, not one per pair. Liquidity/volume are summed across the
 * group's pairs; the group's relevance tier is the best tier found among them
 * (symbol/name are constant per token, so in practice all pairs in a group
 * share the same tier).
 */
function groupByToken(query: string, pairs: DexScreenerPair[]): Map<string, CandidateGroup> {
  const groups = new Map<string, CandidateGroup>()

  for (const pair of pairs) {
    const tier = matchTier(query, pair.baseToken.symbol, pair.baseToken.name)
    if (tier === TIER_NONE) continue // irrelevant to the query — never shown, regardless of liquidity

    const key = `${pair.chainId}:${pair.baseToken.address}`
    const liquidityUsd = pair.liquidity?.usd ?? 0
    const volume24hUsd = pair.volume?.h24 ?? 0
    const existing = groups.get(key)

    if (!existing) {
      groups.set(key, { tier, liquidityUsd, volume24hUsd, bestPair: pair })
      continue
    }

    existing.tier = Math.max(existing.tier, tier)
    existing.liquidityUsd += liquidityUsd
    existing.volume24hUsd += volume24hUsd
    if (liquidityUsd > (existing.bestPair.liquidity?.usd ?? 0)) {
      existing.bestPair = pair
    }
  }

  return groups
}

function toSearchResult(group: CandidateGroup): TokenSearchResult {
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
  }
}

/**
 * Returns ranked, deduplicated search candidates for a query — never a single
 * auto-resolved token. Ranking rule (strict, in this exact order):
 *   1. Exact symbol match
 *   2. Exact name match
 *   3. Prefix match
 *   4. Partial match
 *   5. Liquidity (tie-breaker WITHIN a tier only)
 *   6. 24h volume (secondary tie-breaker)
 * Liquidity/volume never move a candidate into a higher relevance tier — a
 * high-liquidity irrelevant token can never outrank a low-liquidity exact
 * match. This is the fix for the previous liquidity-only selection defect.
 */
export async function searchTokens(query: string): Promise<TokenSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const pairs = await searchPairs(trimmed)
  if (pairs.length === 0) return []

  const groups = groupByToken(trimmed, pairs)

  return Array.from(groups.values())
    .sort((a, b) => {
      if (b.tier !== a.tier) return b.tier - a.tier
      if (b.liquidityUsd !== a.liquidityUsd) return b.liquidityUsd - a.liquidityUsd
      return b.volume24hUsd - a.volume24hUsd
    })
    .slice(0, MAX_RESULTS)
    .map(toSearchResult)
}
