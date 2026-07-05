import { analyzeBridgeRequirement } from "./bridge-analysis"
import { findBestCrossChainPair } from "./matcher"
import { calculateCrossChainSpread, determineOpportunityExists } from "./opportunity"
import { detectCrossChainAssets } from "./scanner"
import type { CrossChainOpportunityReport, NormalizedTokenSnapshot } from "./types"

/**
 * Runs the full Cross-Chain Opportunity Scanner: detects the same asset
 * across multiple chains, picks the best buy/sell pair per asset, computes
 * spread, estimates bridge requirement, and produces one normalized
 * CrossChainOpportunityReport per asset that has a usable buy/sell pair.
 * Assets that couldn't be paired (see matcher.ts) produce no report rather
 * than one with a fabricated leg.
 *
 * Fully provider-agnostic: it only reads the NormalizedTokenSnapshot shape
 * defined in this module, never a specific market provider's response, and
 * performs no HTTP requests, SDK calls, or API keys. Suitable for future
 * integration with the Recommendation Engine; not called from anywhere yet.
 */
export function runCrossChainScanner(snapshots: NormalizedTokenSnapshot[]): CrossChainOpportunityReport[] {
  const matches = detectCrossChainAssets(snapshots)
  const reports: CrossChainOpportunityReport[] = []

  for (const match of matches) {
    const pair = findBestCrossChainPair(match)
    if (!pair) continue

    const spread = calculateCrossChainSpread(pair.buy, pair.sell)
    const bridgeRequirement = analyzeBridgeRequirement(pair.buy, pair.sell)
    const { exists, reason } = determineOpportunityExists(spread)

    reports.push({
      assetSymbol: match.assetSymbol,
      buy: pair.buy,
      sell: pair.sell,
      spread,
      bridgeRequirement,
      opportunityExists: exists,
      reason,
      detectedAt: new Date().toISOString(),
    })
  }

  return reports
}
