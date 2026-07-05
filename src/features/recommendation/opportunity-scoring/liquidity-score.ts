import type { RiskReport } from "../risk-engine"
import type { ScoreComponent } from "./types"

/** Inverse mapping: lower liquidity risk means a higher liquidity score. */
const LEVEL_SCORE: Record<"low" | "medium" | "high", number> = { low: 90, medium: 55, high: 15 }

/**
 * Scores liquidity from the Risk Engine's liquidity risk component. Returns
 * an undefined score when that component's level is "unknown" — never
 * guesses a liquidity score when the underlying liquidity data was missing.
 */
export function calculateLiquidityScore(risk: RiskReport): ScoreComponent {
  const { liquidity } = risk

  if (liquidity.level === "unknown") {
    return { reason: "Liquidity data was not available to score." }
  }

  return { score: LEVEL_SCORE[liquidity.level], reason: liquidity.reason }
}
