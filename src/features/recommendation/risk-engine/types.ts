/**
 * Normalized snapshot of one side (buy or sell leg) of an opportunity, in
 * whatever shape the Risk Engine needs — deliberately independent of
 * ArbitrageOpportunity/RouterQuoteResponse so this module has no dependency
 * on features/arbitrage or features/verification. A future integration
 * point maps those shapes into this one; this module never imports them.
 */
export interface NormalizedLegSnapshot {
  exchange: string
  chainId: string
  priceUsd: number
  liquidityUsd: number
  /** Expected slippage percent for the trade size. Undefined = not available yet (needs a slippage-estimation provider). */
  estimatedSlippagePercent?: number
  /** Whether this leg's route has been validated as executable. Undefined = not yet checked. */
  routerValidated?: boolean
}

/** Recent price volatility for a token, if known. Every field is optional — never fabricated when a provider hasn't supplied it. */
export interface VolatilitySnapshot {
  /** Percent price change over a recent window (e.g. 24h). */
  priceChangePercent24h?: number
}

/** Normalized market data the Risk Engine accepts as input. */
export interface NormalizedMarketSnapshot {
  tokenAddress: string
  chainId: string
  buy: NormalizedLegSnapshot
  sell: NormalizedLegSnapshot
  /** Number of bridge hops required to execute both legs together. Undefined = single-chain, no bridge involved. */
  bridgeHopCount?: number
  /** Undefined = volatility data not available. */
  volatility?: VolatilitySnapshot
}

/**
 * "unknown" is a first-class level, not a fallback error state — it means
 * the inputs needed to score this dimension weren't available, which is
 * meaningfully different from having scored it "low".
 */
export type RiskLevel = "low" | "medium" | "high" | "unknown"

/** One scored dimension of risk. */
export interface RiskComponent {
  level: RiskLevel
  /** Normalized 0-100 score, higher = riskier. Undefined whenever level is "unknown" — never fabricated. */
  score?: number
  reason: string
}

/** Full risk assessment for one opportunity, combining every scored dimension. */
export interface RiskReport {
  tokenAddress: string
  chainId: string
  liquidity: RiskComponent
  slippage: RiskComponent
  bridge: RiskComponent
  execution: RiskComponent
  volatility: RiskComponent
  /**
   * Worst level among components that could actually be scored. "unknown"
   * only when none of the five components could be scored at all.
   */
  overallLevel: RiskLevel
  generatedAt: string
}
