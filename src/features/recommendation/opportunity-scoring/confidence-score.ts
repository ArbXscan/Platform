import type { QuoteComparisonReport } from "../quote-comparator"
import type { ScoreComponent } from "./types"

/**
 * Scores confidence directly from the Quote Comparator's confidence
 * contribution. Returns an undefined score when that contribution's level
 * is "unknown" or it has no numeric score — never fabricates one.
 */
export function calculateConfidenceScore(comparison: QuoteComparisonReport): ScoreComponent {
  const { confidence } = comparison

  if (confidence.level === "unknown" || typeof confidence.score !== "number") {
    return { reason: "Confidence contribution was not available to score." }
  }

  return { score: confidence.score, reason: confidence.reason }
}
