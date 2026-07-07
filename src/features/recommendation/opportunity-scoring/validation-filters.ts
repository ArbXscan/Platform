import type { QuoteComparisonReport, RiskReport } from "./types"

/** Risk levels ordered from least to most risky, for threshold comparisons. "unknown" is treated as worse than "high" since it means the data needed to clear the bar was never confirmed. */
const RISK_ORDER: Record<RiskReport["overallLevel"], number> = { low: 0, medium: 1, high: 2, unknown: 3 }

/**
 * Whether an opportunity is profitable after known costs. Reads
 * QuoteComparisonReport.profitability.status verbatim — that status already
 * accounts for gas cost when available (see quote-comparator/profitability.ts) —
 * no fee math is duplicated here. "unknown" (insufficient data) does not pass.
 */
export function isProfitableAfterCosts(comparison: QuoteComparisonReport): boolean {
  return comparison.profitability.status === "profitable"
}

/**
 * Whether liquidity risk is within an acceptable level. Reads the Risk
 * Engine's own liquidity component verbatim — no liquidity math is
 * duplicated here. "unknown" does not pass: liquidity was never confirmed
 * acceptable, so it isn't assumed to be.
 */
export function isLiquidityAcceptable(
  risk: RiskReport,
  maxAcceptableLevel: RiskReport["overallLevel"] = "medium",
): boolean {
  const level = risk.liquidity.level
  if (level === "unknown") return false
  return RISK_ORDER[level] <= RISK_ORDER[maxAcceptableLevel]
}

/**
 * Whether slippage risk is within an acceptable level. Reads the Risk
 * Engine's own slippage component verbatim — no slippage math is
 * duplicated here. "unknown" does not pass, for the same reason as liquidity.
 */
export function isSlippageAcceptable(
  risk: RiskReport,
  maxAcceptableLevel: RiskReport["overallLevel"] = "medium",
): boolean {
  const level = risk.slippage.level
  if (level === "unknown") return false
  return RISK_ORDER[level] <= RISK_ORDER[maxAcceptableLevel]
}

/**
 * Whether the Risk Engine's aggregated overall risk level is acceptable.
 * Reads RiskReport.overallLevel verbatim — no risk math is duplicated here.
 */
export function isOverallRiskAcceptable(
  risk: RiskReport,
  maxAcceptableLevel: RiskReport["overallLevel"] = "medium",
): boolean {
  const level = risk.overallLevel
  if (level === "unknown") return false
  return RISK_ORDER[level] <= RISK_ORDER[maxAcceptableLevel]
}
