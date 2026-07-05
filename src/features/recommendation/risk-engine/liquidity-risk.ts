import type { NormalizedMarketSnapshot, RiskComponent } from "./types"

/**
 * Liquidity risk thresholds, in USD, applied to the shallower of the two
 * legs' liquidity. These are initial heuristic buckets, not a validated
 * product decision — the same caveat already applied to
 * constants/config.ts's MIN_PROFIT_USD_THRESHOLD elsewhere in this project.
 */
const HIGH_RISK_LIQUIDITY_USD = 5_000
const MEDIUM_RISK_LIQUIDITY_USD = 50_000

/**
 * Scores liquidity risk from the shallower of the opportunity's two legs —
 * a trade is only as safe as its thinnest pool. Requires both legs to report
 * a liquidity figure; if either is missing or non-finite, the risk is
 * "unknown" rather than guessed.
 */
export function calculateLiquidityRisk(snapshot: NormalizedMarketSnapshot): RiskComponent {
  const buyLiquidity = snapshot.buy.liquidityUsd
  const sellLiquidity = snapshot.sell.liquidityUsd

  if (!Number.isFinite(buyLiquidity) || !Number.isFinite(sellLiquidity)) {
    return {
      level: "unknown",
      reason: "Liquidity data is missing for one or both legs.",
    }
  }

  const minLiquidity = Math.min(buyLiquidity, sellLiquidity)

  if (minLiquidity < HIGH_RISK_LIQUIDITY_USD) {
    return {
      level: "high",
      score: 90,
      reason: `Shallowest leg has only ~$${Math.round(minLiquidity).toLocaleString()} in liquidity.`,
    }
  }

  if (minLiquidity < MEDIUM_RISK_LIQUIDITY_USD) {
    return {
      level: "medium",
      score: 50,
      reason: `Shallowest leg has ~$${Math.round(minLiquidity).toLocaleString()} in liquidity.`,
    }
  }

  return {
    level: "low",
    score: 15,
    reason: `Both legs have at least ~$${Math.round(minLiquidity).toLocaleString()} in liquidity.`,
  }
}
