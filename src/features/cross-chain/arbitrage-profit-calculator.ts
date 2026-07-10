import type { CrossChainOpportunity } from "./normalized-opportunity"

/**
 * Caller-supplied figures this calculator has no way to know on its own —
 * there is no gas estimation API, bridge estimation API, or trading-fee
 * source anywhere in this project yet (later milestones). Every field is
 * optional; an omitted one is never guessed.
 */
export interface ArbitrageProfitInputs {
  gasFeeUsd?: number
  bridgeFeeUsd?: number
  tradingFeeUsd?: number
  /** Capital to simulate the trade with. Defaults to the opportunity's own liquidity ceiling when not supplied — see calculateArbitrageProfit. */
  capitalUsd?: number
}

/** Profit breakdown for one CrossChainOpportunity. Every field except `profitable` is optional — undefined means "could not be determined," never a guessed number. */
export interface ArbitrageProfit {
  grossProfitUsd?: number
  grossProfitPercent?: number
  estimatedGasFeeUsd?: number
  estimatedBridgeFeeUsd?: number
  estimatedTradingFeeUsd?: number
  totalFeesUsd?: number
  netProfitUsd?: number
  netProfitPercent?: number
  roiPercent?: number
  minimumCapitalUsd?: number
  /** True only when net profit (after every known fee) is confirmed positive. False covers both "confirmed unprofitable" and "unknown due to missing fee data" — it never claims profitability it can't confirm. */
  profitable: boolean
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0
}

/**
 * Sums only the fee components that are actually known. Returns undefined
 * — not a partial sum silently labeled "total" — unless gas, bridge, and
 * trading fee are all defined, finite, non-negative numbers. A "total"
 * that quietly treats an unknown cost as zero would misrepresent
 * completeness, which is its own kind of fabrication.
 */
function calculateTotalFees(
  gasFeeUsd: number | undefined,
  bridgeFeeUsd: number | undefined,
  tradingFeeUsd: number | undefined,
): number | undefined {
  if (gasFeeUsd === undefined || bridgeFeeUsd === undefined || tradingFeeUsd === undefined) {
    return undefined
  }
  return gasFeeUsd + bridgeFeeUsd + tradingFeeUsd
}

/**
 * Milestone 4.2 — Cross-Chain Arbitrage Profit Calculator.
 *
 * Computes profit metrics for one CrossChainOpportunity (Milestone 4.1 —
 * see normalized-opportunity.ts). Fully independent of the Recommendation
 * Engine, Search, Dashboard, Landing Page, Market, and UI — it only reads
 * the opportunity object passed to it and, optionally, caller-supplied
 * fee/capital figures; it imports nothing from any of those modules.
 *
 * Gas fee, bridge fee, and trading fee are never guessed — there is no
 * estimation source for any of them yet (no gas estimation API, no bridge
 * estimation API; those and AI scoring/recommendation are later
 * milestones). They come back as undefined unless supplied via `inputs`,
 * and so does every figure that depends on them (`totalFeesUsd`,
 * `netProfitUsd`, `netProfitPercent`, `roiPercent`).
 *
 * Never throws. Invalid opportunity data (non-finite, zero, or negative
 * prices; a non-finite spread) results in an ArbitrageProfit with
 * `profitable: false` and every other field left undefined — never NaN or
 * Infinity.
 */
export function calculateArbitrageProfit(
  opportunity: CrossChainOpportunity,
  inputs: ArbitrageProfitInputs = {},
): ArbitrageProfit {
  const emptyResult: ArbitrageProfit = { profitable: false }

  if (!opportunity) return emptyResult

  const { buyPrice, sellPrice, spreadPercent, liquidity } = opportunity

  if (!isPositiveFiniteNumber(buyPrice) || !isPositiveFiniteNumber(sellPrice) || !isFiniteNumber(spreadPercent)) {
    return emptyResult
  }

  // The smallest real, non-fabricated capital threshold this data supports:
  // the cost of one unit of the asset at the buy leg.
  const minimumCapitalUsd = buyPrice

  const safeLiquidity = isPositiveFiniteNumber(liquidity) ? liquidity : 0
  const requestedCapital = inputs.capitalUsd
  // Defaults to the opportunity's own liquidity ceiling (real, already-known
  // data) when the caller doesn't specify a capital amount, falling back to
  // minimumCapitalUsd only if liquidity itself is unusable.
  const capitalUsd = isPositiveFiniteNumber(requestedCapital)
    ? requestedCapital
    : Math.max(safeLiquidity, minimumCapitalUsd)

  const grossProfitPercent = spreadPercent
  const grossProfitUsd = capitalUsd * (grossProfitPercent / 100)

  const estimatedGasFeeUsd = isNonNegativeFiniteNumber(inputs.gasFeeUsd) ? inputs.gasFeeUsd : undefined
  const estimatedBridgeFeeUsd = isNonNegativeFiniteNumber(inputs.bridgeFeeUsd) ? inputs.bridgeFeeUsd : undefined
  const estimatedTradingFeeUsd = isNonNegativeFiniteNumber(inputs.tradingFeeUsd) ? inputs.tradingFeeUsd : undefined

  const totalFeesUsd = calculateTotalFees(estimatedGasFeeUsd, estimatedBridgeFeeUsd, estimatedTradingFeeUsd)

  const netProfitUsd = totalFeesUsd !== undefined ? grossProfitUsd - totalFeesUsd : undefined
  const netProfitPercent =
    netProfitUsd !== undefined && capitalUsd > 0 ? (netProfitUsd / capitalUsd) * 100 : undefined
  // ROI shares netProfitPercent's basis in this milestone — there's no
  // separate financing-cost or holding-period data yet to compute a
  // genuinely different figure, so this intentionally isn't a second,
  // fabricated calculation.
  const roiPercent = netProfitPercent

  return {
    grossProfitUsd,
    grossProfitPercent,
    estimatedGasFeeUsd,
    estimatedBridgeFeeUsd,
    estimatedTradingFeeUsd,
    totalFeesUsd,
    netProfitUsd,
    netProfitPercent,
    roiPercent,
    minimumCapitalUsd,
    profitable: netProfitUsd !== undefined && netProfitUsd > 0,
  }
}
