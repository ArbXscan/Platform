import { DEFAULT_VALIDATION_THRESHOLDS } from "./thresholds"
import {
  calculateNetProfitAfterAllCosts,
  isConfidenceAboveMinimum,
  isLiquidityAboveMinimum,
  isLiquidityAcceptable,
  isNetProfitAboveMinimum,
  isOverallRiskAcceptable,
  isProfitableAfterCosts,
  isSlippageAcceptable,
  isVolumeAboveMinimum,
} from "./validation-filters"
import type {
  OpportunityEvaluationInput,
  OpportunityValidationCheck,
  OpportunityValidationResult,
  OpportunityValidationThresholds,
} from "./types"

/**
 * Runs the Opportunity Validation Pipeline: the single, fixed sequence of
 * named checks every arbitrage opportunity must pass before it can be
 * displayed. Every check reads already-computed engine output (or
 * caller-supplied market/cost data) verbatim — nothing here recalculates a
 * price, fee, spread, or risk score. The verdict is "valid" only when every
 * check passes. `thresholds` is fully optional and additive; omitted
 * fields fall back to DEFAULT_VALIDATION_THRESHOLDS.
 */
export function validateOpportunity(
  input: OpportunityEvaluationInput,
  thresholds: Partial<OpportunityValidationThresholds> = {},
): OpportunityValidationResult {
  const resolvedThresholds: OpportunityValidationThresholds = { ...DEFAULT_VALIDATION_THRESHOLDS, ...thresholds }
  const checks: OpportunityValidationCheck[] = []

  const profitable = isProfitableAfterCosts(input.comparison)
  checks.push({
    name: "profitability",
    passed: profitable,
    reason: profitable
      ? "Estimated profit (after gas cost, if available) is positive."
      : `Profitability status is "${input.comparison.profitability.status}".`,
  })

  const netProfitUsd = calculateNetProfitAfterAllCosts(input.comparison, input.costs)
  const netProfitOk = isNetProfitAboveMinimum(input.comparison, resolvedThresholds.minNetProfitUsd, input.costs)
  checks.push({
    name: "minimum-profit",
    passed: netProfitOk,
    reason: netProfitOk
      ? `Net profit after gas, protocol fee, and slippage ($${netProfitUsd?.toFixed(2)}) meets the minimum of $${resolvedThresholds.minNetProfitUsd.toFixed(2)}.`
      : netProfitUsd === undefined
        ? "Net profit after all costs could not be determined."
        : `Net profit after all costs ($${netProfitUsd.toFixed(2)}) is below the minimum of $${resolvedThresholds.minNetProfitUsd.toFixed(2)}.`,
  })

  const liquidityOk = isLiquidityAcceptable(input.risk)
  checks.push({
    name: "liquidity-risk",
    passed: liquidityOk,
    reason: liquidityOk
      ? "Liquidity risk is within an acceptable level."
      : `Liquidity risk level is "${input.risk.liquidity.level}".`,
  })

  const minLiquidityOk = isLiquidityAboveMinimum(input.market, resolvedThresholds.minLiquidityUsd)
  checks.push({
    name: "minimum-liquidity",
    passed: minLiquidityOk,
    reason:
      input.market === undefined
        ? "Liquidity was not supplied for this opportunity; check not applicable."
        : minLiquidityOk
          ? `Liquidity ($${input.market.liquidityUsd?.toFixed(2)}) meets the minimum of $${resolvedThresholds.minLiquidityUsd.toFixed(2)}.`
          : input.market.liquidityUsd === undefined
            ? "Liquidity was not supplied for this opportunity."
            : `Liquidity ($${input.market.liquidityUsd.toFixed(2)}) is below the minimum of $${resolvedThresholds.minLiquidityUsd.toFixed(2)}.`,
  })

  const minVolumeOk = isVolumeAboveMinimum(input.market, resolvedThresholds.minVolume24hUsd)
  checks.push({
    name: "minimum-volume",
    passed: minVolumeOk,
    reason:
      input.market === undefined
        ? "24h volume was not supplied for this opportunity; check not applicable."
        : minVolumeOk
          ? `24h volume ($${input.market.volume24hUsd?.toFixed(2)}) meets the minimum of $${resolvedThresholds.minVolume24hUsd.toFixed(2)}.`
          : input.market.volume24hUsd === undefined
            ? "24h volume was not supplied for this opportunity."
            : `24h volume ($${input.market.volume24hUsd.toFixed(2)}) is below the minimum of $${resolvedThresholds.minVolume24hUsd.toFixed(2)}.`,
  })

  const slippageOk = isSlippageAcceptable(input.risk)
  checks.push({
    name: "slippage",
    passed: slippageOk,
    reason: slippageOk
      ? "Slippage risk is within an acceptable level."
      : `Slippage risk level is "${input.risk.slippage.level}".`,
  })

  const overallRiskOk = isOverallRiskAcceptable(input.risk, resolvedThresholds.maxAcceptableRiskLevel)
  checks.push({
    name: "overall-risk",
    passed: overallRiskOk,
    reason: overallRiskOk
      ? `Overall risk level is "${input.risk.overallLevel}", within the acceptable "${resolvedThresholds.maxAcceptableRiskLevel}" threshold.`
      : `Overall risk level is "${input.risk.overallLevel}", which exceeds the acceptable "${resolvedThresholds.maxAcceptableRiskLevel}" threshold.`,
  })

  const confidenceOk = isConfidenceAboveMinimum(input.scoring, resolvedThresholds.minConfidenceScore)
  checks.push({
    name: "minimum-confidence",
    passed: confidenceOk,
    reason: confidenceOk
      ? `Confidence score (${input.scoring.confidence.score}) meets the minimum of ${resolvedThresholds.minConfidenceScore}.`
      : input.scoring.confidence.score === undefined
        ? "Confidence score could not be determined."
        : `Confidence score (${input.scoring.confidence.score}) is below the minimum of ${resolvedThresholds.minConfidenceScore}.`,
  })

  const verdict = checks.every((check) => check.passed) ? "valid" : "invalid"

  return {
    verdict,
    checks,
    estimatedNetProfitUsd: netProfitUsd,
    validatedAt: new Date().toISOString(),
  }
}

/**
 * Keeps only the opportunities whose validateOpportunity verdict is
 * "valid" under the given thresholds. Order is preserved; no ranking or
 * scoring happens here.
 */
export function filterValidOpportunities(
  inputs: OpportunityEvaluationInput[],
  thresholds: Partial<OpportunityValidationThresholds> = {},
): OpportunityEvaluationInput[] {
  return inputs.filter((input) => validateOpportunity(input, thresholds).verdict === "valid")
}
