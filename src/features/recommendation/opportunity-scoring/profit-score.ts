import type { QuoteComparisonReport } from "../quote-comparator"
import type { ScoreComponent } from "./types"

/** Initial heuristic spread buckets, not a validated product decision. */
const HIGH_PROFIT_SPREAD_PERCENT = 2
const MEDIUM_PROFIT_SPREAD_PERCENT = 0.5

/**
 * Scores profit potential from the Quote Comparator's profitability status
 * and spread percentage. Returns an undefined score whenever the comparator
 * itself couldn't determine profitability or a spread percentage — never
 * guesses a number from incomplete data.
 */
export function calculateProfitScore(comparison: QuoteComparisonReport): ScoreComponent {
  const { profitability, spread } = comparison

  if (profitability.status === "unknown") {
    return { reason: "Profitability could not be determined from the available quote data." }
  }

  if (profitability.status === "unprofitable") {
    return { score: 10, reason: "Estimated profit is negative after available costs." }
  }

  if (typeof spread.spreadPercent !== "number") {
    return { reason: "Spread percentage is not available." }
  }

  if (spread.spreadPercent >= HIGH_PROFIT_SPREAD_PERCENT) {
    return { score: 90, reason: `Spread of ${spread.spreadPercent.toFixed(2)}% is strong.` }
  }

  if (spread.spreadPercent >= MEDIUM_PROFIT_SPREAD_PERCENT) {
    return { score: 55, reason: `Spread of ${spread.spreadPercent.toFixed(2)}% is moderate.` }
  }

  return { score: 25, reason: `Spread of ${spread.spreadPercent.toFixed(2)}% is thin.` }
}
