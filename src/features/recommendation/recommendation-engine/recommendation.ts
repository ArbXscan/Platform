import type { OverallConfidenceLevel, RecommendationEngineInput } from "./types"

/**
 * Builds the list of reasons supporting the recommendation, each backed
 * directly by a field from an upstream report. A dimension that couldn't be
 * determined upstream contributes no reason here, rather than a vague or
 * inferred one.
 */
export function buildReasons(input: RecommendationEngineInput): string[] {
  const { comparison, risk, scoring } = input
  const reasons: string[] = []

  if (typeof comparison.spread.spreadPercent === "number") {
    reasons.push(`Spread is ${comparison.spread.spreadPercent.toFixed(2)}%.`)
  }

  if (risk.overallLevel !== "unknown") {
    reasons.push(`Overall risk is assessed as ${risk.overallLevel}.`)
  }

  if (typeof scoring.overallScore === "number") {
    reasons.push(`Opportunity score is ${Math.round(scoring.overallScore)}/100.`)
  }

  if (comparison.profitability.status === "profitable") {
    reasons.push("Estimated profit is positive after available costs.")
  }

  return reasons
}

/**
 * Overall confidence combines the Quote Comparator's confidence contribution
 * with the Risk Engine's ability to assess risk at all. If either input
 * couldn't be determined, overall confidence can never read as "high" — it's
 * either "unknown" or capped at "medium"/"low".
 */
export function deriveOverallConfidence(input: RecommendationEngineInput): OverallConfidenceLevel {
  const { comparison, risk } = input

  if (comparison.confidence.level === "unknown" || risk.overallLevel === "unknown") {
    return "unknown"
  }

  if (comparison.confidence.level === "low" || risk.overallLevel === "high") {
    return "low"
  }

  if (comparison.confidence.level === "high" && risk.overallLevel === "low") {
    return "high"
  }

  return "medium"
}
