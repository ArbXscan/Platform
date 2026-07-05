import type { NormalizedMarketSnapshot, RiskComponent } from "./types"

/** Initial heuristic buckets for combined slippage percent, not a validated product decision. */
const HIGH_RISK_SLIPPAGE_PERCENT = 3
const MEDIUM_RISK_SLIPPAGE_PERCENT = 1

/**
 * Scores slippage risk from the combined estimated slippage of both legs.
 * Requires both legs to report an estimate; today no provider supplies one
 * (see NormalizedLegSnapshot.estimatedSlippagePercent), so this reliably
 * returns "unknown" until that data exists — it never guesses a number.
 */
export function calculateSlippageRisk(snapshot: NormalizedMarketSnapshot): RiskComponent {
  const buySlippage = snapshot.buy.estimatedSlippagePercent
  const sellSlippage = snapshot.sell.estimatedSlippagePercent

  if (typeof buySlippage !== "number" || typeof sellSlippage !== "number") {
    return {
      level: "unknown",
      reason: "Slippage estimate is not available for one or both legs yet.",
    }
  }

  const combinedSlippage = buySlippage + sellSlippage

  if (combinedSlippage >= HIGH_RISK_SLIPPAGE_PERCENT) {
    return {
      level: "high",
      score: 85,
      reason: `Combined estimated slippage is ${combinedSlippage.toFixed(2)}%.`,
    }
  }

  if (combinedSlippage >= MEDIUM_RISK_SLIPPAGE_PERCENT) {
    return {
      level: "medium",
      score: 45,
      reason: `Combined estimated slippage is ${combinedSlippage.toFixed(2)}%.`,
    }
  }

  return {
    level: "low",
    score: 10,
    reason: `Combined estimated slippage is ${combinedSlippage.toFixed(2)}%.`,
  }
}
