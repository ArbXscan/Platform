import { DEFAULT_CHAIN_ID } from "../../constants/chains"
import { getTrendingPools, type GeckoTerminalPool } from "../../services/providers/geckoterminal"
import type { MarketSnapshot, TrendingToken } from "../../types/market"

function toNumber(value: string | null | undefined): number {
  if (!value) return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function normalizePool(pool: GeckoTerminalPool, chainId: string): TrendingToken {
  const { attributes } = pool
  return {
    pairName: attributes.name,
    chainId,
    priceUsd: toNumber(attributes.base_token_price_usd),
    change24h: attributes.price_change_percentage.h24
      ? toNumber(attributes.price_change_percentage.h24)
      : null,
    volume24hUsd: toNumber(attributes.volume_usd.h24),
    liquidityUsd: attributes.reserve_in_usd ? toNumber(attributes.reserve_in_usd) : null,
    poolUrl: `https://www.geckoterminal.com/${chainId}/pools/${attributes.address}`,
    source: {
      provider: "geckoterminal",
      fetchedAt: new Date().toISOString(),
      // Single-source data (GeckoTerminal only, not cross-checked against DexScreener yet)
      // is "medium" at best per docs/PRD/09-API_PROVIDER_SECURITY.md's confidence rules —
      // "high" is reserved for values two or more providers agree on.
      confidence: "medium",
    },
  }
}

/**
 * Fetches trending pools for one chain and shapes them into a MarketSnapshot.
 * Step 1 only pulls one chain at a time (DEFAULT_CHAIN_ID) to stay well under
 * GeckoTerminal's 30 req/min free-tier limit — multi-chain aggregation is a
 * later enhancement, not a Step 1 requirement.
 */
export async function getMarketSnapshot(chainId: string = DEFAULT_CHAIN_ID): Promise<MarketSnapshot> {
  const pools = await getTrendingPools(chainId)
  const trending = pools.map((pool) => normalizePool(pool, chainId))
  const volume24hUsd = trending.reduce((sum, t) => sum + t.volume24hUsd, 0)

  return {
    trackedPairCount: trending.length,
    volume24hUsd,
    trending,
    source: {
      provider: "geckoterminal",
      fetchedAt: new Date().toISOString(),
      confidence: "medium",
    },
  }
}
