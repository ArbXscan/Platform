import type { BridgeInfo } from "./types"

/** Parameters available for substitution into a bridge's URL templates. */
export interface BridgeUrlParams {
  sourceChainId: string
  destinationChainId: string
  tokenAddress?: string
}

function substitute(template: string, params: BridgeUrlParams): string {
  let url = template
    .replace("{sourceChainId}", params.sourceChainId)
    .replace("{destinationChainId}", params.destinationChainId)
  if (params.tokenAddress) {
    url = url.replace("{tokenAddress}", params.tokenAddress)
  }
  return url
}

/**
 * Builds a bridge's deep link from its bridgeUrlTemplate. Returns undefined
 * if the bridge has no confirmed template — never guesses a URL.
 */
export function buildBridgeUrl(bridge: BridgeInfo, params: BridgeUrlParams): string | undefined {
  if (!bridge.bridgeUrlTemplate) return undefined
  return substitute(bridge.bridgeUrlTemplate, params)
}

/**
 * Builds a bridge's explorer link from its explorerUrlTemplate. Returns
 * undefined if the bridge has no confirmed template — never guesses a URL.
 */
export function buildBridgeExplorerUrl(bridge: BridgeInfo, params: BridgeUrlParams): string | undefined {
  if (!bridge.explorerUrlTemplate) return undefined
  return substitute(bridge.explorerUrlTemplate, params)
}
