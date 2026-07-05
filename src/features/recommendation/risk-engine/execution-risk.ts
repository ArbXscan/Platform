import type { NormalizedMarketSnapshot, RiskComponent } from "./types"

/**
 * Scores execution risk from whether each leg's route has been validated as
 * executable. Requires both legs to have been explicitly checked; if either
 * hasn't (routerValidated is undefined), the result is "unknown" rather than
 * assuming the route is safe.
 */
export function calculateExecutionRisk(snapshot: NormalizedMarketSnapshot): RiskComponent {
  const buyValidated = snapshot.buy.routerValidated
  const sellValidated = snapshot.sell.routerValidated

  if (typeof buyValidated !== "boolean" || typeof sellValidated !== "boolean") {
    return {
      level: "unknown",
      reason: "Router validation has not been performed for one or both legs yet.",
    }
  }

  if (!buyValidated || !sellValidated) {
    return {
      level: "high",
      score: 95,
      reason: "Router validation failed for one or both legs.",
    }
  }

  return {
    level: "low",
    score: 10,
    reason: "Both legs' routes have been validated as executable.",
  }
}
