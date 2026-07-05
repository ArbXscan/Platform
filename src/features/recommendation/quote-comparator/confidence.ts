import type { ConfidenceContribution, NormalizedQuoteInput } from "./types"

/** Initial heuristic liquidity buckets, not a validated product decision. */
const HIGH_CONFIDENCE_LIQUIDITY_USD = 50_000
const MEDIUM_CONFIDENCE_LIQUIDITY_USD = 5_000

/**
 * Scores how much this quote pair should contribute to an overall confidence
 * score, based on the shallower leg's liquidity depth. Requires both legs to
 * report a finite liquidity figure; otherwise the contribution is "unknown"
 * rather than guessed.
 */
export function calculateConfidenceContribution(input: NormalizedQuoteInput): ConfidenceContribution {
  const buyLiquidity = input.buy.liquidityUsd
  const sellLiquidity = input.sell.liquidityUsd

  if (!Number.isFinite(buyLiquidity) || !Number.isFinite(sellLiquidity)) {
    return {
      level: "unknown",
      reason: "Liquidity data is missing for one or both legs.",
    }
  }

  const minLiquidity = Math.min(buyLiquidity, sellLiquidity)

  if (minLiquidity >= HIGH_CONFIDENCE_LIQUIDITY_USD) {
    return {
      level: "high",
      score: 85,
      reason: `Both legs have at least ~$${Math.round(minLiquidity).toLocaleString()} in liquidity.`,
    }
  }

  if (minLiquidity >= MEDIUM_CONFIDENCE_LIQUIDITY_USD) {
    return {
      level: "medium",
      score: 50,
      reason: `Shallowest leg has ~$${Math.round(minLiquidity).toLocaleString()} in liquidity.`,
    }
  }

  return {
    level: "low",
    score: 15,
    reason: `Shallowest leg has only ~$${Math.round(minLiquidity).toLocaleString()} in liquidity.`,
  }
}
