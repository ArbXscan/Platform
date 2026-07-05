import type { NormalizedQuoteInput, SpreadResult } from "./types"

/**
 * Computes the raw and percentage spread between a buy leg and a sell leg.
 * spreadPercent is left undefined when the buy price is zero or non-finite —
 * dividing by it would be meaningless, so this never reports a fabricated 0%.
 */
export function calculateSpread(input: NormalizedQuoteInput): SpreadResult {
  const rawSpreadUsd = input.sell.priceUsd - input.buy.priceUsd

  if (!Number.isFinite(input.buy.priceUsd) || input.buy.priceUsd <= 0) {
    return { rawSpreadUsd }
  }

  return {
    rawSpreadUsd,
    spreadPercent: (rawSpreadUsd / input.buy.priceUsd) * 100,
  }
}
