import type { NormalizedTokenSnapshot } from "./types"

export type CrossChainConfidenceLevel = "low" | "medium" | "high"

/** Bottleneck-liquidity thresholds for the confidence heuristic below. */
const HIGH_LIQUIDITY_USD = 100_000
const MEDIUM_LIQUIDITY_USD = 10_000

/**
 * Simple, self-contained confidence heuristic for one buy/sell pair, based
 * only on the liquidity already present on both legs. This module has no
 * access to (and does not call) the Recommendation Engine's risk/confidence
 * scoring — that engine is out of scope for this milestone; this is a
 * standalone, cross-chain-specific estimate only.
 *
 * Uses the shallower (bottleneck) leg's liquidity, since a cross-chain
 * trade is only as reliable as its thinner side. Missing or non-finite
 * liquidity is never treated as high confidence — it falls back to "low".
 */
export function estimateCrossChainConfidence(
  buy: NormalizedTokenSnapshot,
  sell: NormalizedTokenSnapshot,
): CrossChainConfidenceLevel {
  const buyLiquidity = Number.isFinite(buy.liquidityUsd) ? buy.liquidityUsd : 0
  const sellLiquidity = Number.isFinite(sell.liquidityUsd) ? sell.liquidityUsd : 0
  const bottleneckLiquidity = Math.min(buyLiquidity, sellLiquidity)

  if (bottleneckLiquidity <= 0) return "low"
  if (bottleneckLiquidity >= HIGH_LIQUIDITY_USD) return "high"
  if (bottleneckLiquidity >= MEDIUM_LIQUIDITY_USD) return "medium"
  return "low"
}
