import type { CrossChainMatch, NormalizedTokenSnapshot } from "./types"

/**
 * Groups normalized token snapshots by asset symbol, keeping only groups
 * that appear on more than one distinct chain — a listing that only exists
 * on a single chain can't produce a cross-chain opportunity, so it's
 * excluded rather than reported with a fabricated second leg.
 */
export function detectCrossChainAssets(snapshots: NormalizedTokenSnapshot[]): CrossChainMatch[] {
  const bySymbol = new Map<string, NormalizedTokenSnapshot[]>()

  for (const snapshot of snapshots) {
    const key = snapshot.assetSymbol.trim().toUpperCase()
    const group = bySymbol.get(key)
    if (group) {
      group.push(snapshot)
    } else {
      bySymbol.set(key, [snapshot])
    }
  }

  const matches: CrossChainMatch[] = []
  for (const [assetSymbol, group] of bySymbol) {
    const distinctChainCount = new Set(group.map((snapshot) => snapshot.chainId)).size
    if (distinctChainCount > 1) {
      matches.push({ assetSymbol, snapshots: group })
    }
  }

  return matches
}
