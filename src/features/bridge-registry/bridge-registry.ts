import { findBridgeById, listBridgesForChainPair } from "./resolver"
import type { BridgeInfo } from "./types"
import type { BridgeUrlParams } from "./urls"
import { buildBridgeExplorerUrl, buildBridgeUrl } from "./urls"

/**
 * Resolves the best bridge for a chain pair — the first active, well-known
 * bridge that declares support for it. Returns undefined if none do, rather
 * than fabricating support for a pair no seeded entry actually lists.
 */
export function resolveBridgeForChainPair(sourceChainId: string, destinationChainId: string): BridgeInfo | undefined {
  return listBridgesForChainPair(sourceChainId, destinationChainId).find((bridge) => bridge.status === "active")
}

/**
 * Convenience wrapper: resolves a bridge by id and builds its deep link in
 * one call. Returns undefined if the bridge isn't registered, or if it has
 * no confirmed bridgeUrlTemplate.
 */
export function getBridgeDeepLink(bridgeId: string, params: BridgeUrlParams): string | undefined {
  const bridge = findBridgeById(bridgeId)
  if (!bridge) return undefined
  return buildBridgeUrl(bridge, params)
}

/**
 * Convenience wrapper: resolves a bridge by id and builds its explorer link
 * in one call. Returns undefined if the bridge isn't registered, or if it
 * has no confirmed explorerUrlTemplate.
 */
export function getBridgeExplorerLink(bridgeId: string, params: BridgeUrlParams): string | undefined {
  const bridge = findBridgeById(bridgeId)
  if (!bridge) return undefined
  return buildBridgeExplorerUrl(bridge, params)
}

export { findBridgeById, listBridgesForChainPair, supportsChainPair } from "./resolver"
