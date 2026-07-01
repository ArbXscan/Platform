import type { DataSourceMeta } from "./api"
import type { Token, TokenPrice } from "./token"

export interface TrendingToken {
  token: Token
  price: TokenPrice
  rank: number
}

export interface MarketMover {
  token: Token
  changePercent: number
}

/** Aggregate payload for the Dashboard's market overview section. */
export interface MarketOverview {
  totalMarketCapUsd: number
  totalVolume24hUsd: number
  trending: TrendingToken[]
  topGainers: MarketMover[]
  topLosers: MarketMover[]
  source: DataSourceMeta
}

export interface NetworkStatus {
  chainId: string
  operational: boolean
  latencyMs?: number
}

/** Sort options for the Market Analytics page tabs. */
export type MarketSortKey = "trending" | "gainers" | "losers" | "volume" | "liquidity"
