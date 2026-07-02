import type { DataSourceMeta } from "./api"

/** Minimal chain reference — full chain metadata lives in constants/chains.ts */
export interface ChainRef {
  id: string
  name: string
}

/** Core identity of a token, chain-scoped (same symbol can exist on multiple chains). */
export interface Token {
  address: string
  chainId: string
  symbol: string
  name: string
  decimals: number
  logoUrl?: string
}

export interface TokenPrice {
  usd: number
  change24h: number
  source: DataSourceMeta
}

export interface TokenLiquidity {
  totalUsd: number
  poolCount: number
  source: DataSourceMeta
}

export interface TokenMarketStats {
  marketCapUsd?: number
  volume24hUsd: number
  source: DataSourceMeta
}

/** Full payload for the Token Detail page. */
export interface TokenDetail extends Token {
  price: TokenPrice
  liquidity: TokenLiquidity
  stats: TokenMarketStats
  supportedExchanges: string[]
}

/** Lightweight shape used in search results / autocomplete, before the full detail is fetched. */
export interface TokenSearchResult extends Token {
  priceUsd?: number
}
