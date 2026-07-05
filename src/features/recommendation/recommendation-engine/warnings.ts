import type { RecommendationEngineInput } from "./types"

/**
 * Surfaces warnings directly from the upstream reports — every warning here
 * traces back to a concrete field the Verification Engine, Quote Comparator,
 * or Risk Engine already reported. Nothing is inferred beyond what those
 * reports state.
 */
export function buildWarnings(input: RecommendationEngineInput): string[] {
  const { verification, risk, comparison } = input
  const warnings: string[] = []

  if (verification.buyQuote.status !== "ok") {
    warnings.push(`Buy-side router quote is "${verification.buyQuote.status}".`)
  }
  if (verification.sellQuote.status !== "ok") {
    warnings.push(`Sell-side router quote is "${verification.sellQuote.status}".`)
  }

  if (risk.liquidity.level === "high") warnings.push(`Liquidity risk is high: ${risk.liquidity.reason}`)
  if (risk.slippage.level === "high") warnings.push(`Slippage risk is high: ${risk.slippage.reason}`)
  if (risk.bridge.level === "high") warnings.push(`Bridge risk is high: ${risk.bridge.reason}`)
  if (risk.execution.level === "high") warnings.push(`Execution risk is high: ${risk.execution.reason}`)
  if (risk.volatility.level === "high") warnings.push(`Volatility risk is high: ${risk.volatility.reason}`)

  if (comparison.confidence.level === "unknown") {
    warnings.push("Confidence could not be determined from the available quote data.")
  }

  if (comparison.profitability.status === "unprofitable") {
    warnings.push("Estimated profit is negative after available costs.")
  }

  if (comparison.profitability.status === "unknown") {
    warnings.push("Profitability could not be estimated from the available data.")
  }

  return warnings
}
