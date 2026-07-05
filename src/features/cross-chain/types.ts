/**
 * Normalized snapshot of one asset's price/liquidity on one chain.
 * Deliberately self-contained — no dependency on ArbitrageOpportunity,
 * RouterQuoteResponse, or any other feature's types, so this module can
 * never form a circular dependency with them.
 */
export interface NormalizedTokenSnapshot {
  /** Symbol or canonical identifier used to match the same asset across chains, e.g. "USDC". */
  assetSymbol: string
  chainId: string
  tokenAddress: string
  exchange: string
  priceUsd: number
  liquidityUsd: number
}

/** One asset found on more than one chain, with every known snapshot of it. */
export interface CrossChainMatch {
  assetSymbol: string
  snapshots: NormalizedTokenSnapshot[]
}

/** The lowest-priced (buy) and highest-priced (sell) snapshots for a matched asset, on two different chains. */
export interface BestCrossChainPair {
  buy: NormalizedTokenSnapshot
  sell: NormalizedTokenSnapshot
}

/**
 * "unknown" is a first-class level, not a fallback error state — it means a
 * bridge requirement could not be determined, which is different from "none".
 */
export type BridgeRequirementLevel = "none" | "required" | "unknown"

/**
 * Whether moving the asset between the buy and sell chains would require a
 * bridge. This module has no bridge-cost/route provider — it can only say
 * whether a bridge is required, never its cost, time, or specific route.
 */
export interface BridgeRequirement {
  level: BridgeRequirementLevel
  reason: string
}

/** Result of comparing a buy leg's price against a sell leg's price. */
export interface CrossChainSpreadResult {
  rawSpreadUsd: number
  /** Undefined if the buy price is zero or non-finite — division would be meaningless, never fabricated as 0. */
  spreadPercent?: number
}

/** Full, normalized result for one asset's best cross-chain buy/sell pair. */
export interface CrossChainOpportunityReport {
  assetSymbol: string
  buy: NormalizedTokenSnapshot
  sell: NormalizedTokenSnapshot
  spread: CrossChainSpreadResult
  bridgeRequirement: BridgeRequirement
  opportunityExists: boolean
  reason: string
  detectedAt: string
}
