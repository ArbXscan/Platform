/**
 * One side (buy or sell leg) of a quote comparison, normalized into the
 * minimal shape this module needs. Deliberately self-contained — this module
 * has no dependency on features/arbitrage, features/verification, or any
 * other feature, so it can never form a circular dependency with them. A
 * future integration point maps other shapes into this one.
 */
export interface NormalizedQuoteLeg {
  exchange: string
  chainId: string
  priceUsd: number
  liquidityUsd: number
}

/** Normalized input this module accepts. */
export interface NormalizedQuoteInput {
  tokenAddress: string
  buy: NormalizedQuoteLeg
  sell: NormalizedQuoteLeg
  /** Trade size in USD, used to estimate gross/net profit. Undefined = profit can't be estimated, only spread. */
  tradeAmountUsd?: number
  /** Estimated gas cost in USD for executing both legs. Undefined = not available yet (needs a gas-oracle provider). */
  estimatedGasUsd?: number
}

/** Result of comparing the two legs' prices. */
export interface SpreadResult {
  rawSpreadUsd: number
  /** Undefined if the buy price is zero or non-finite — division would be meaningless, never fabricated as 0. */
  spreadPercent?: number
}

export type ProfitabilityStatus = "profitable" | "unprofitable" | "breakeven" | "unknown"

/** Result of estimating profitability from a spread and (optionally) a trade size and gas cost. */
export interface ProfitabilityResult {
  status: ProfitabilityStatus
  /** Undefined unless tradeAmountUsd and a usable spreadPercent were both available. */
  estimatedGrossProfitUsd?: number
  /** Undefined unless estimatedGrossProfitUsd and estimatedGasUsd were both available. */
  estimatedNetProfitUsd?: number
}

/**
 * "unknown" is a first-class level, not a fallback error state — it means
 * the inputs needed to score confidence weren't available.
 */
export type QuoteConfidenceLevel = "low" | "medium" | "high" | "unknown"

/** How much this quote comparison should contribute to an overall confidence score. */
export interface ConfidenceContribution {
  level: QuoteConfidenceLevel
  /** Normalized 0-100 score, higher = more confidence. Undefined whenever level is "unknown". */
  score?: number
  reason: string
}

/** Full, normalized comparison report for one token's buy/sell quote pair. */
export interface QuoteComparisonReport {
  tokenAddress: string
  spread: SpreadResult
  profitability: ProfitabilityResult
  confidence: ConfidenceContribution
  comparedAt: string
}
