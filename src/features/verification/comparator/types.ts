import type { RouterQuoteResponse } from "../engine/types"

/** Re-exported so consumers of the Quote Comparator don't need to reach into features/verification/engine directly. */
export type { RouterQuoteResponse } from "../engine/types"

/**
 * Outcome of comparing a set of buy-side and sell-side router quotes.
 *  - "comparable": at least one usable ("ok") quote exists on both sides.
 *  - "one-sided": a usable quote exists on only one side.
 *  - "no-data": no usable quote exists on either side (all "unsupported" or "error").
 */
export type ComparisonOutcome = "comparable" | "one-sided" | "no-data"

/**
 * Normalized result of comparing router quotes for one opportunity's buy and
 * sell legs. Never contains a fabricated price — every field is either taken
 * directly from a quote that reported status "ok", or left undefined.
 */
export interface QuoteComparisonResult {
  outcome: ComparisonOutcome
  /** The lowest-priced usable buy quote. Undefined if none was usable. */
  bestBuy?: RouterQuoteResponse
  /** The highest-priced usable sell quote. Undefined if none was usable. */
  bestSell?: RouterQuoteResponse
  /** Undefined unless both bestBuy and bestSell are present and bestBuy's price is greater than zero. */
  spreadPercent?: number
  /** Every input quote that could not be used for comparison ("unsupported" or "error" status), from both sides. */
  excludedQuotes: RouterQuoteResponse[]
  comparedAt: string
}
