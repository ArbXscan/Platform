import {
  isLiquidityAcceptable,
  isOverallRiskAcceptable,
  isProfitableAfterCosts,
  isSlippageAcceptable,
} from "./validation-filters"
import type {
  OpportunityEvaluationInput,
  OpportunityValidationCheck,
  OpportunityValidationResult,
} from "./types"

/**
 * Runs the Opportunity Validation Pipeline: a fixed sequence of named
 * checks over an already-computed comparison/risk/scoring bundle. Every
 * check reads existing engine output verbatim (profitability status,
 * liquidity/slippage/overall risk levels) — nothing here recalculates a
 * price, fee, spread, or risk score. The verdict is "valid" only when every
 * check passes.
 */
export function validateOpportunity(input: OpportunityEvaluationInput): OpportunityValidationResult {
  const checks: OpportunityValidationCheck[] = []

  const profitable = isProfitableAfterCosts(input.comparison)
  checks.push({
    name: "profitability",
    passed: profitable,
    reason: profitable
      ? "Estimated profit (after gas cost, if available) is positive."
      : `Profitability status is "${input.comparison.profitability.status}".`,
  })

  const liquidityOk = isLiquidityAcceptable(input.risk)
  checks.push({
    name: "liquidity",
    passed: liquidityOk,
    reason: liquidityOk
      ? "Liquidity risk is within an acceptable level."
      : `Liquidity risk level is "${input.risk.liquidity.level}".`,
  })

  const slippageOk = isSlippageAcceptable(input.risk)
  checks.push({
    name: "slippage",
    passed: slippageOk,
    reason: slippageOk
      ? "Slippage risk is within an acceptable level."
      : `Slippage risk level is "${input.risk.slippage.level}".`,
  })

  const overallRiskOk = isOverallRiskAcceptable(input.risk)
  checks.push({
    name: "overall-risk",
    passed: overallRiskOk,
    reason: overallRiskOk
      ? `Overall risk level is "${input.risk.overallLevel}".`
      : `Overall risk level is "${input.risk.overallLevel}", which exceeds the acceptable threshold.`,
  })

  const verdict = checks.every((check) => check.passed) ? "valid" : "invalid"

  return {
    verdict,
    checks,
    estimatedNetProfitUsd: input.comparison.profitability.estimatedNetProfitUsd,
    validatedAt: new Date().toISOString(),
  }
}

/**
 * Keeps only the opportunities whose validateOpportunity verdict is
 * "valid". Order is preserved; no ranking or scoring happens here.
 */
export function filterValidOpportunities(inputs: OpportunityEvaluationInput[]): OpportunityEvaluationInput[] {
  return inputs.filter((input) => validateOpportunity(input).verdict === "valid")
}
