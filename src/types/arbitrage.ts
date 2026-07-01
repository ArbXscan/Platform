import type { ConfidenceLevel, DataSourceMeta } from "./api"
import type { Token } from "./token"

/** A single exchange's quote for a token, as gathered by services/aggregator.ts */
export interface ExchangeQuote {
  exchange: string
  chainId: string
  priceUsd: number
  liquidityUsd: number
  source: DataSourceMeta
}

/** One arbitrage opportunity, as produced by features/arbitrage/scanner-engine.ts */
export interface ArbitrageOpportunity {
  id: string
  token: Token
  buyFrom: ExchangeQuote
  sellTo: ExchangeQuote
  priceDiffPercent: number
  estimatedGasUsd: number
  estimatedBridgeUsd?: number
  estimatedNetProfitUsd: number
  /** Set by features/arbitrage/confidence-engine.ts, not by the raw provider data. */
  confidence: ConfidenceLevel
  detectedAt: string
}

export interface ArbitrageFilters {
  chainId?: string
  minProfitUsd?: number
  minConfidence?: ConfidenceLevel
}
