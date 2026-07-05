import type { RiskReport } from "../risk-engine"
import type { ScoreComponent } from "./types"

/** Inverse mapping: lower overall risk means a higher risk score. */
const LEVEL_SCORE: Record<"low" | "medium" | "high", number> = { low: 90, medium: 50, high: 10 }

/**
 * Scores overall risk from the Risk Engine's aggregated overallLevel.
 * Returns an undefined score when overallLevel is "unknown" — never guesses
 * a risk score when none of the Risk Engine's components could be scored.
 */
export function calculateRiskScore(risk: RiskReport): ScoreComponent {
  if (risk.overallLevel === "unknown") {
    return { reason: "Overall risk could not be determined from the available data." }
  }

  return { score: LEVEL_SCORE[risk.overallLevel], reason: `Overall risk level is "${risk.overallLevel}".` }
}
