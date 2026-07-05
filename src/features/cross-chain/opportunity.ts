import type { CrossChainSpreadResult, NormalizedTokenSnapshot } from "./types"

/**
 * Computes the raw and percentage spread between a buy leg and a sell leg.
 * spreadPercent is left undefined when the buy price is zero or non-finite —
 * dividing by it would be meaningless, so this never reports a fabricated 0%.
 */
export function calculateCrossChainSpread(
  buy: NormalizedTokenSnapshot,
  sell: NormalizedTokenSnapshot,
): CrossChainSpreadResult {
  const rawSpreadUsd = sell.priceUsd - buy.priceUsd

  if (!Number.isFinite(buy.priceUsd) || buy.priceUsd <= 0) {
    return { rawSpreadUsd }
  }

  return {
    rawSpreadUsd,
    spreadPercent: (rawSpreadUsd / buy.priceUsd) * 100,
  }
}

/**
 * Determines whether a real, currently-measurable cross-chain opportunity
 * exists. Requires a defined, positive spread percentage — an undefined
 * spread (missing or invalid price data) is reported as "could not be
 * determined" via the reason string, never silently treated the same as
 * "no opportunity found".
 */
export function determineOpportunityExists(spread: CrossChainSpreadResult): { exists: boolean; reason: string } {
  if (typeof spread.spreadPercent !== "number") {
    return {
      exists: false,
      reason: "Spread percentage could not be determined from the available price data.",
    }
  }

  if (spread.spreadPercent <= 0) {
    return {
      exists: false,
      reason: `No positive spread across chains: ${spread.spreadPercent.toFixed(2)}%.`,
    }
  }

  return {
    exists: true,
    reason: `Positive spread of ${spread.spreadPercent.toFixed(2)}% detected across chains.`,
  }
}
