import type { RouterQuoteResponse } from "../engine/types"
import type { ComparisonOutcome, QuoteComparisonResult } from "./types"

/** A quote is usable for comparison only if it reported "ok" with a finite price. */
function isUsableQuote(quote: RouterQuoteResponse): quote is RouterQuoteResponse & { quotedPriceUsd: number } {
  return quote.status === "ok" && typeof quote.quotedPriceUsd === "number" && Number.isFinite(quote.quotedPriceUsd)
}

/**
 * Picks the lowest-priced usable quote from a list — the best price to buy
 * at. Returns undefined if none of the quotes are usable, rather than
 * falling back to an unusable one.
 */
export function findBestBuyQuote(quotes: RouterQuoteResponse[]): RouterQuoteResponse | undefined {
  const usable = quotes.filter(isUsableQuote)
  if (usable.length === 0) return undefined
  return usable.reduce((best, quote) => (quote.quotedPriceUsd < best.quotedPriceUsd ? quote : best))
}

/**
 * Picks the highest-priced usable quote from a list — the best price to sell
 * at. Returns undefined if none of the quotes are usable.
 */
export function findBestSellQuote(quotes: RouterQuoteResponse[]): RouterQuoteResponse | undefined {
  const usable = quotes.filter(isUsableQuote)
  if (usable.length === 0) return undefined
  return usable.reduce((best, quote) => (quote.quotedPriceUsd > best.quotedPriceUsd ? quote : best))
}

/**
 * Computes the spread percent between a buy quote and a sell quote. Returns
 * undefined if either quote is missing, unusable, or the buy price is zero
 * or less — never divides by zero and never fabricates a number.
 */
export function computeSpreadPercent(
  buyQuote: RouterQuoteResponse | undefined,
  sellQuote: RouterQuoteResponse | undefined,
): number | undefined {
  if (!buyQuote || !sellQuote) return undefined
  if (!isUsableQuote(buyQuote) || !isUsableQuote(sellQuote)) return undefined
  if (buyQuote.quotedPriceUsd <= 0) return undefined
  return ((sellQuote.quotedPriceUsd - buyQuote.quotedPriceUsd) / buyQuote.quotedPriceUsd) * 100
}

function determineOutcome(
  bestBuy: RouterQuoteResponse | undefined,
  bestSell: RouterQuoteResponse | undefined,
): ComparisonOutcome {
  if (bestBuy && bestSell) return "comparable"
  if (bestBuy || bestSell) return "one-sided"
  return "no-data"
}

/**
 * Compares a set of buy-side router quotes against a set of sell-side router
 * quotes and produces a normalized comparison result. Quotes with status
 * "unsupported" or "error" are never used for best-price selection — they're
 * carried over in `excludedQuotes` so a caller can see which routers didn't
 * contribute, instead of being silently dropped or treated as zero.
 *
 * Fully provider-agnostic: this function only reads the normalized
 * RouterQuoteResponse shape produced by features/verification/engine — it
 * has no knowledge of which router produced any given quote. Adding a new
 * router adapter later requires no change here.
 */
export function compareQuotes(
  buyQuotes: RouterQuoteResponse[],
  sellQuotes: RouterQuoteResponse[],
): QuoteComparisonResult {
  const bestBuy = findBestBuyQuote(buyQuotes)
  const bestSell = findBestSellQuote(sellQuotes)
  const spreadPercent = computeSpreadPercent(bestBuy, bestSell)
  const excludedQuotes = [...buyQuotes, ...sellQuotes].filter((quote) => !isUsableQuote(quote))

  return {
    outcome: determineOutcome(bestBuy, bestSell),
    bestBuy,
    bestSell,
    spreadPercent,
    excludedQuotes,
    comparedAt: new Date().toISOString(),
  }
}
