import type { RecommendationEngineInput } from "./types"

/**
 * Builds a one-sentence human-readable summary from the upstream reports.
 * Only states what the upstream data actually reported; wherever a value is
 * missing, the summary says so explicitly instead of omitting it silently or
 * filling in a plausible-sounding number.
 */
export function buildSummary(input: RecommendationEngineInput): string {
  const { comparison, risk, scoring } = input

  const spreadPart =
    typeof comparison.spread.spreadPercent === "number"
      ? `a ${comparison.spread.spreadPercent.toFixed(2)}% spread`
      : "a spread that could not be measured"

  const riskPart = risk.overallLevel === "unknown" ? "an undetermined risk level" : `${risk.overallLevel} overall risk`

  const scorePart =
    typeof scoring.overallScore === "number"
      ? `an opportunity score of ${Math.round(scoring.overallScore)}/100`
      : "no opportunity score yet"

  return `This opportunity shows ${spreadPart}, ${riskPart}, and ${scorePart}. Recommendation: ${scoring.recommendationLevel}.`
}
