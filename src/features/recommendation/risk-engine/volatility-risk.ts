import type { NormalizedMarketSnapshot, RiskComponent } from "./types"

/** Initial heuristic buckets for absolute 24h price change percent, not a validated product decision. */
const HIGH_RISK_VOLATILITY_PERCENT = 20
const MEDIUM_RISK_VOLATILITY_PERCENT = 8

/**
 * Scores volatility risk from the token's recent price change. Requires a
 * volatility snapshot with a finite 24h change figure; if it's missing, the
 * result is "unknown" rather than assuming the token is stable.
 */
export function calculateVolatilityRisk(snapshot: NormalizedMarketSnapshot): RiskComponent {
  const change = snapshot.volatility?.priceChangePercent24h

  if (typeof change !== "number" || !Number.isFinite(change)) {
    return {
      level: "unknown",
      reason: "24h price change data is not available for this token.",
    }
  }

  const magnitude = Math.abs(change)

  if (magnitude >= HIGH_RISK_VOLATILITY_PERCENT) {
    return {
      level: "high",
      score: 85,
      reason: `Price has moved ${magnitude.toFixed(1)}% over the last 24h.`,
    }
  }

  if (magnitude >= MEDIUM_RISK_VOLATILITY_PERCENT) {
    return {
      level: "medium",
      score: 45,
      reason: `Price has moved ${magnitude.toFixed(1)}% over the last 24h.`,
    }
  }

  return {
    level: "low",
    score: 15,
    reason: `Price has moved ${magnitude.toFixed(1)}% over the last 24h.`,
  }
}
