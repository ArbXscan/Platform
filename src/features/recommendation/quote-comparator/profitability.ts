import type { NormalizedQuoteInput, ProfitabilityResult, SpreadResult } from "./types"

/**
 * Estimates profitability from a spread result and (optionally) a trade
 * size and gas cost. Returns status "unknown" whenever the inputs needed to
 * estimate a dollar figure aren't available — it never fabricates a profit
 * number from an incomplete spread or a missing trade size.
 */
export function calculateProfitability(input: NormalizedQuoteInput, spread: SpreadResult): ProfitabilityResult {
  if (
    typeof input.tradeAmountUsd !== "number" ||
    !Number.isFinite(input.tradeAmountUsd) ||
    input.tradeAmountUsd <= 0
  ) {
    return { status: "unknown" }
  }

  if (typeof spread.spreadPercent !== "number" || !Number.isFinite(spread.spreadPercent)) {
    return { status: "unknown" }
  }

  const estimatedGrossProfitUsd = (spread.spreadPercent / 100) * input.tradeAmountUsd

  let estimatedNetProfitUsd: number | undefined
  if (typeof input.estimatedGasUsd === "number" && Number.isFinite(input.estimatedGasUsd)) {
    estimatedNetProfitUsd = estimatedGrossProfitUsd - input.estimatedGasUsd
  }

  const referenceProfit = estimatedNetProfitUsd ?? estimatedGrossProfitUsd

  if (referenceProfit > 0) {
    return { status: "profitable", estimatedGrossProfitUsd, estimatedNetProfitUsd }
  }
  if (referenceProfit < 0) {
    return { status: "unprofitable", estimatedGrossProfitUsd, estimatedNetProfitUsd }
  }
  return { status: "breakeven", estimatedGrossProfitUsd, estimatedNetProfitUsd }
}
