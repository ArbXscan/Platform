import { calculateConfidenceContribution } from "./confidence"
import { calculateProfitability } from "./profitability"
import { calculateSpread } from "./spread"
import type { NormalizedQuoteInput, QuoteComparisonReport } from "./types"

/**
 * The single public entry point of the Quote Comparator (recommendation).
 * Accepts one normalized buy/sell quote pair and produces a normalized
 * comparison report combining spread, profitability, and confidence
 * contribution — suitable for a future Recommendation Engine to consume.
 *
 * Fully provider-agnostic: it only reads the NormalizedQuoteInput shape
 * defined in this module, never a specific market/router provider's
 * response, and never imports React, HTTP, or any SDK. Not called from
 * anywhere yet.
 */
export function compareNormalizedQuotes(input: NormalizedQuoteInput): QuoteComparisonReport {
  const spread = calculateSpread(input)
  const profitability = calculateProfitability(input, spread)
  const confidence = calculateConfidenceContribution(input)

  return {
    tokenAddress: input.tokenAddress,
    spread,
    profitability,
    confidence,
    comparedAt: new Date().toISOString(),
  }
}
