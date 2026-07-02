import { DEFAULT_CHAIN_ID } from "../../constants/chains"
import { searchPairs, type DexScreenerPair } from "../../services/providers/dexscreener"
import type { ConfidenceLevel, DataSourceMeta } from "../../types/api"
import type { ArbitrageOpportunity, ExchangeQuote } from "../../types/arbitrage"
import type { TrendingToken } from "../../types/market"
import { getMarketSnapshot } from "../market/market.service"

/**
 * Our internal chain ids (constants/chains.ts) mostly match DexScreener's chainId
 * values directly (ethereum, arbitrum, base, polygon, optimism, avalanche, solana),
 * except BNB Chain — DexScreener calls it "bsc", we call it "bnb". Same class of
 * problem GECKOTERMINAL_NETWORK_MAP solves in services/providers/geckoterminal.ts.
 * Kept local to this file since it's specific to matching against trending-token
 * chain ids, not a general DexScreener concern.
 */
const DEXSCREENER_CHAIN_MAP: Record<string, string> = { bnb: "bsc" }

function toDexScreenerChainId(chainId: string): string {
  return DEXSCREENER_CHAIN_MAP[chainId] ?? chainId
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * GeckoTerminal's trending_pools response only gives a combined pair name like
 * "PEPE / WETH" (see the comment on GeckoTerminalPoolAttributes.name in
 * services/providers/geckoterminal.ts) — no contract address. Splitting on "/"
 * to recover the base symbol is a best-effort bridge to DexScreener's search,
 * not an exact match; token/address grouping below (by baseToken.address) is
 * what actually protects against symbol collisions.
 */
function extractBaseSymbol(pairName: string): string {
  const [base] = pairName.split("/")
  return (base ?? pairName).trim()
}

function toExchangeQuote(pair: DexScreenerPair, fetchedAt: string): ExchangeQuote {
  return {
    exchange: pair.dexId,
    chainId: pair.chainId,
    priceUsd: toNumber(pair.priceUsd),
    liquidityUsd: pair.liquidity?.usd ?? 0,
    source: {
      provider: "dexscreener",
      fetchedAt,
      // Single-source (DexScreener only) — same "medium" convention as
      // features/market/market.service.ts and features/token/token.service.ts.
      confidence: "medium",
    } satisfies DataSourceMeta,
  }
}

/**
 * Confidence score built only from data actually available in this step — no
 * gas or routing data involved, per the "no fake data" requirement:
 *  - More independent pools quoting the same token = the spread isn't just one
 *    thin/stale pool.
 *  - Deeper liquidity on the thinner leg = less likely the price would move
 *    against you before the trade fills.
 *  - Meaningful 24h volume = the pools are actually active, not abandoned.
 *  - Extreme spreads (>50%) are penalized rather than rewarded — in practice
 *    these usually mean a stale quote or a broken/illiquid pool, not a real
 *    opportunity.
 * This is a heuristic, not a financial guarantee — it only reflects data
 * quality/depth, never gas cost or execution risk (those are "Not available").
 */
function computeConfidence(input: {
  poolCount: number
  minLiquidityUsd: number
  spreadPercent: number
  volume24hUsd: number
}): ConfidenceLevel {
  let score = 0
  if (input.poolCount >= 3) score += 2
  else if (input.poolCount >= 2) score += 1

  if (input.minLiquidityUsd >= 50_000) score += 2
  else if (input.minLiquidityUsd >= 10_000) score += 1

  if (input.volume24hUsd >= 20_000) score += 1

  if (input.spreadPercent > 0 && input.spreadPercent <= 15) score += 1
  if (input.spreadPercent > 50) score -= 2

  if (score >= 5) return "high"
  if (score >= 3) return "medium"
  if (score >= 1) return "low"
  return "unknown"
}

/**
 * Finds cross-DEX arbitrage opportunities for a single trending token by
 * pulling every pair DexScreener knows about for that symbol, then comparing
 * prices across DEXs on the same chain.
 */
async function findOpportunitiesForToken(token: TrendingToken): Promise<ArbitrageOpportunity[]> {
  const symbol = extractBaseSymbol(token.pairName)
  if (!symbol) return []

  let pairs: DexScreenerPair[]
  try {
    pairs = await searchPairs(symbol)
  } catch {
    // One token's provider hiccup shouldn't fail the whole scan — skip it.
    return []
  }

  const targetChain = toDexScreenerChainId(token.chainId)
  const candidatePairs = pairs.filter(
    (p) => p.chainId === targetChain && p.baseToken.symbol.toUpperCase() === symbol.toUpperCase(),
  )

  // Group by contract address — the same symbol can belong to unrelated tokens
  // on the same chain, so address (not symbol) is the real identity boundary.
  const byAddress = new Map<string, DexScreenerPair[]>()
  for (const pair of candidatePairs) {
    const key = pair.baseToken.address
    const group = byAddress.get(key) ?? []
    group.push(pair)
    byAddress.set(key, group)
  }

  const fetchedAt = new Date().toISOString()
  const opportunities: ArbitrageOpportunity[] = []

  for (const [address, group] of byAddress) {
    // One quote per DEX: if the token has multiple pools on the same DEX
    // (different quote assets), keep only the deepest-liquidity one so a
    // single DEX can't be compared against itself.
    const byDex = new Map<string, DexScreenerPair>()
    for (const pair of group) {
      const existing = byDex.get(pair.dexId)
      if (!existing || (pair.liquidity?.usd ?? 0) > (existing.liquidity?.usd ?? 0)) {
        byDex.set(pair.dexId, pair)
      }
    }
    const dexPairs = Array.from(byDex.values()).filter((p) => toNumber(p.priceUsd) > 0)
    if (dexPairs.length < 2) continue // need at least 2 independent DEXs to compare

    const cheapest = dexPairs.reduce((a, b) => (toNumber(a.priceUsd) < toNumber(b.priceUsd) ? a : b))
    const priciest = dexPairs.reduce((a, b) => (toNumber(a.priceUsd) > toNumber(b.priceUsd) ? a : b))
    if (cheapest.dexId === priciest.dexId) continue

    const buyPrice = toNumber(cheapest.priceUsd)
    const sellPrice = toNumber(priciest.priceUsd)
    const spreadPercent = ((sellPrice - buyPrice) / buyPrice) * 100
    if (!Number.isFinite(spreadPercent) || spreadPercent <= 0) continue

    const buyFrom = toExchangeQuote(cheapest, fetchedAt)
    const sellTo = toExchangeQuote(priciest, fetchedAt)
    const minLiquidityUsd = Math.min(buyFrom.liquidityUsd, sellTo.liquidityUsd)
    const volume24hUsd = (cheapest.volume?.h24 ?? 0) + (priciest.volume?.h24 ?? 0)

    opportunities.push({
      id: `${address}-${cheapest.dexId}-${priciest.dexId}`,
      token: {
        address,
        chainId: cheapest.chainId,
        symbol: cheapest.baseToken.symbol,
        name: cheapest.baseToken.name,
        // Same caveat as features/token/token.service.ts: DexScreener doesn't
        // expose decimals, and it isn't displayed anywhere in this UI.
        decimals: 0,
        logoUrl: cheapest.info?.imageUrl,
      },
      buyFrom,
      sellTo,
      priceDiffPercent: spreadPercent,
      // Gas estimation needs a gas-oracle/RPC provider — not wired up yet.
      // Left undefined (not 0, not a guess) so the UI can render "Not available".
      estimatedGasUsd: undefined,
      estimatedNetProfitUsd: undefined,
      confidence: computeConfidence({
        poolCount: dexPairs.length,
        minLiquidityUsd,
        spreadPercent,
        volume24hUsd,
      }),
      detectedAt: fetchedAt,
    })
  }

  return opportunities
}

/**
 * Scans for arbitrage opportunities across the current trending-token set for
 * one chain. Reuses features/market/market.service.ts (the same source Dashboard
 * already uses) rather than calling GeckoTerminal directly, so both features
 * stay consistent about what "trending" means and don't duplicate that fetch.
 *
 * NOTE: fires one DexScreener search per trending token concurrently. GeckoTerminal
 * trending_pools returns a modest list (~20), well under DexScreener's 300 req/min
 * limit, so this is fine for Step 3. If more chains/tokens are scanned at once
 * later, this should be batched instead of fully parallel.
 */
export async function scanArbitrageOpportunities(
  chainId: string = DEFAULT_CHAIN_ID,
): Promise<ArbitrageOpportunity[]> {
  const snapshot = await getMarketSnapshot(chainId)
  const results = await Promise.all(snapshot.trending.map((token) => findOpportunitiesForToken(token)))
  const opportunities = results.flat()
  opportunities.sort((a, b) => b.priceDiffPercent - a.priceDiffPercent)
  return opportunities
}
