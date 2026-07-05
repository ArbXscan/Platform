import { KNOWN_BRIDGES } from "./registry"
import type { BridgeInfo } from "./types"

/**
 * Finds a registered bridge by its canonical id (case-insensitive). Returns
 * undefined if no bridge is seeded under that id — never fabricates a match.
 */
export function findBridgeById(id: string): BridgeInfo | undefined {
  const key = id.trim().toLowerCase()
  return KNOWN_BRIDGES.find((bridge) => bridge.id.toLowerCase() === key)
}

/**
 * Lists every registered bridge that supports moving an asset from the given
 * source chain to the given destination chain, based only on each bridge's
 * declared sourceChainIds/destinationChainIds — never inferred or assumed.
 */
export function listBridgesForChainPair(sourceChainId: string, destinationChainId: string): BridgeInfo[] {
  return KNOWN_BRIDGES.filter(
    (bridge) =>
      bridge.sourceChainIds.includes(sourceChainId) && bridge.destinationChainIds.includes(destinationChainId),
  )
}

/**
 * Checks whether a specific bridge (by id) supports a given chain pair.
 * Returns false both when the bridge isn't registered and when it is
 * registered but doesn't declare support for that pair — the two cases are
 * distinguished by using findBridgeById directly if that distinction matters
 * to the caller.
 */
export function supportsChainPair(bridgeId: string, sourceChainId: string, destinationChainId: string): boolean {
  const bridge = findBridgeById(bridgeId)
  if (!bridge) return false
  return bridge.sourceChainIds.includes(sourceChainId) && bridge.destinationChainIds.includes(destinationChainId)
}
