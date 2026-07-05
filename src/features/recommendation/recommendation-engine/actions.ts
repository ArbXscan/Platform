import type { RecommendationEngineInput } from "./types"

/**
 * Suggests concrete next steps based on gaps or risk flags already present
 * in the upstream reports. These are process suggestions, not financial
 * advice or a fabricated execution plan — each one maps directly to a
 * specific missing or risky field.
 */
export function buildSuggestedActions(input: RecommendationEngineInput): string[] {
  const { verification, risk, scoring } = input
  const actions: string[] = []

  if (verification.buyQuote.status !== "ok" || verification.sellQuote.status !== "ok") {
    actions.push("Re-run verification once a router adapter is available for both legs.")
  }

  if (risk.liquidity.level === "high" || risk.liquidity.level === "unknown") {
    actions.push("Confirm current pool liquidity before committing a trade size.")
  }

  if (risk.execution.level === "unknown") {
    actions.push("Validate the route through a router before executing.")
  }

  if (risk.slippage.level === "unknown") {
    actions.push("Obtain a slippage estimate for the intended trade size before executing.")
  }

  if (scoring.recommendationLevel === "High Risk") {
    actions.push("Treat this opportunity as high risk; consider skipping it.")
  }

  if (scoring.recommendationLevel === "Not Recommended") {
    actions.push("Do not act on this opportunity without additional data.")
  }

  if (actions.length === 0) {
    actions.push("Proceed with standard due diligence before executing.")
  }

  return actions
}
