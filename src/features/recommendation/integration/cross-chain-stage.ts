import { runCrossChainScanner } from "../../cross-chain"
import type { CrossChainOpportunityReport, NormalizedTokenSnapshot } from "./types"

/**
 * Stage 2: Cross-Chain Engine, executed as-is. Filters the supplied
 * snapshots down to the ones matching the normalized address, then forwards
 * to the existing runCrossChainScanner and returns its result for that
 * asset untouched — no spread, bridge, or match logic is duplicated here.
 */
export function runCrossChainStage(
  normalizedAddress: string,
  snapshots: NormalizedTokenSnapshot[],
): CrossChainOpportunityReport | undefined {
  const matchingSnapshots = snapshots.filter(
    (snapshot) => snapshot.tokenAddress.trim().toLowerCase() === normalizedAddress,
  )

  const reports = runCrossChainScanner(matchingSnapshots)
  return reports[0]
}
