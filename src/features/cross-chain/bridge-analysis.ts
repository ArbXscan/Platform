import type { BridgeRequirement, NormalizedTokenSnapshot } from "./types"

/**
 * Determines whether moving the asset from the buy leg's chain to the sell
 * leg's chain would require a bridge. This module has no bridge-cost or
 * bridge-route provider wired up — it can only report whether a bridge is
 * required at all, never which one, its cost, or its transfer time. Those
 * stay unavailable until a bridge provider is integrated in a future
 * milestone; this never estimates them.
 */
export function analyzeBridgeRequirement(
  buy: NormalizedTokenSnapshot,
  sell: NormalizedTokenSnapshot,
): BridgeRequirement {
  if (!buy.chainId || !sell.chainId) {
    return {
      level: "unknown",
      reason: "Chain id is missing for one or both legs.",
    }
  }

  if (buy.chainId === sell.chainId) {
    return {
      level: "none",
      reason: "Both legs are on the same chain; no bridge is required.",
    }
  }

  return {
    level: "required",
    reason: `Moving this asset from "${buy.chainId}" to "${sell.chainId}" requires a bridge; bridge cost and transfer time are not yet available.`,
  }
}
