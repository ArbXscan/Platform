import type {
  OpportunityCostInputs,
  OpportunityMarketMetrics,
  OpportunityScoreReport,
  QuoteComparisonReport,
  RiskReport,
} from "./types"

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

/**
 * Computes net profit after every known cost: starts from
 * QuoteComparisonReport.profitability.estimatedNetProfitUsd (already
 * gas-deducted — reused verbatim, gas math is never recalculated here),
 * then subtracts protocol fee and estimated slippage if supplied via
 * OpportunityCostInputs. Omitted costs are treated as zero — never
 * fabricated as a guessed non-zero amount. Returns undefined only when the
 * base gas-aware figure itself was unavailable, since a further deduction
 * from an unknown base is still unknown.
 */
export function calculateNetProfitAfterAllCosts(
  comparison: QuoteComparisonReport,
  costs?: OpportunityCostInputs,
): number | undefined {
  const base = comparison.profitability.estimatedNetProfitUsd
  if (base === undefined) return undefined

  const protocolFeeUsd = costs?.protocolFeeUsd ?? 0
  const estimatedSlippageUsd = costs?.estimatedSlippageUsd ?? 0

  return base - protocolFeeUsd - estimatedSlippageUsd
}

/**
 * Whether net profit after all costs (see calculateNetProfitAfterAllCosts)
 * meets or exceeds the minimum threshold. An unavailable net profit figure
 * does not pass — it was never confirmed to meet the bar.
 */
export function isNetProfitAboveMinimum(
  comparison: QuoteComparisonReport,
  minNetProfitUsd: number,
  costs?: OpportunityCostInputs,
): boolean {
  const netProfitUsd = calculateNetProfitAfterAllCosts(comparison, costs)
  if (netProfitUsd === undefined) return false
  return netProfitUsd >= minNetProfitUsd
}

/**
 * Whether supplied liquidity meets or exceeds the minimum threshold.
 * OpportunityMarketMetrics is an entirely new, opt-in input with no
 * existing source elsewhere in this pipeline (see types.ts): if the whole
 * `market` object is omitted, this check is treated as not applicable and
 * passes, so callers that haven't started supplying market data yet are
 * never gated by a check they never opted into. If `market` is supplied
 * but `liquidityUsd` specifically is missing, that's an attempted-but-
 * incomplete case and fails closed instead.
 */
export function isLiquidityAboveMinimum(market: OpportunityMarketMetrics | undefined, minLiquidityUsd: number): boolean {
  if (market === undefined) return true
  if (market.liquidityUsd === undefined) return false
  return market.liquidityUsd >= minLiquidityUsd
}

/**
 * Whether supplied 24h volume meets or exceeds the minimum threshold. Same
 * opt-in, fail-closed-only-when-attempted behavior as
 * isLiquidityAboveMinimum.
 */
export function isVolumeAboveMinimum(market: OpportunityMarketMetrics | undefined, minVolume24hUsd: number): boolean {
  if (market === undefined) return true
  if (market.volume24hUsd === undefined) return false
  return market.volume24hUsd >= minVolume24hUsd
}

/**
 * Whether the scoring engine's own confidence component score meets or
 * exceeds the minimum threshold. Reads OpportunityScoreReport.confidence
 * verbatim — no confidence math is duplicated here. An unscored ("unknown")
 * confidence does not pass.
 */
export function isConfidenceAboveMinimum(scoring: OpportunityScoreReport, minConfidenceScore: number): boolean {
  const score = scoring.confidence.score
  if (score === undefined) return false
  return score >= minConfidenceScore
}
