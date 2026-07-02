import type { DataSourceMeta } from "./api"

/**
 * Deliberately NOT a full Token — GeckoTerminal's trending_pools endpoint (used to
 * populate this) doesn't return the base token's contract address by default, only
 * pair name/price/volume. See services/providers/geckoterminal.ts for the raw shape.
 */
export interface TrendingToken {
  pairName: string
  chainId: string
  priceUsd: number
  change24h: number | null
  volume24hUsd: number
  /** From GeckoTerminal's reserve_in_usd. null when the pool doesn't report it. */
  liquidityUsd: number | null
  poolUrl: string
  source: DataSourceMeta
}

export interface MarketMover {
  pairName: string
  changePercent: number
}

/**
 * Snapshot derived from the pairs we actually track — NOT a true global market cap.
 * Neither DexScreener nor GeckoTerminal's free API exposes a whole-market aggregate,
 * so we don't claim one (see docs/PRD/09-API_PROVIDER_SECURITY.md on not overstating data).
 */
export interface MarketSnapshot {
  trackedPairCount: number
  volume24hUsd: number
  trending: TrendingToken[]
  source: DataSourceMeta
}

export interface NetworkStatus {
  chainId: string
  operational: boolean
  latencyMs?: number
}

/** Sort options for the Market Analytics page tabs. */
export type MarketSortKey = "trending" | "gainers" | "losers" | "volume" | "liquidity"
