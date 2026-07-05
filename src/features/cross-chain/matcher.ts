import type { BestCrossChainPair, CrossChainMatch } from "./types"

/**
 * Picks the lowest-priced snapshot as the buy leg and the highest-priced
 * snapshot on a *different* chain as the sell leg. Returns undefined if the
 * match has fewer than two usable (finite, positive-price) snapshots, or if
 * every usable snapshot turns out to be on the same chain as the buy leg —
 * never fabricates a second leg to force a pair.
 */
export function findBestCrossChainPair(match: CrossChainMatch): BestCrossChainPair | undefined {
  const usable = match.snapshots.filter(
    (snapshot) => Number.isFinite(snapshot.priceUsd) && snapshot.priceUsd > 0,
  )
  if (usable.length < 2) return undefined

  const buy = usable.reduce((lowest, snapshot) => (snapshot.priceUsd < lowest.priceUsd ? snapshot : lowest))
  const sellCandidates = usable.filter((snapshot) => snapshot.chainId !== buy.chainId)
  if (sellCandidates.length === 0) return undefined

  const sell = sellCandidates.reduce((highest, snapshot) =>
    snapshot.priceUsd > highest.priceUsd ? snapshot : highest,
  )

  return { buy, sell }
}
