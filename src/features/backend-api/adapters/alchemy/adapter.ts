import { BaseProviderAdapter } from "../base/adapter"

/**
 * Alchemy (chain RPC) adapter stub. No HTTP calls, no SDK, no API key —
 * registered as an extension point for a future milestone that implements a
 * real chain-RPC integration.
 */
export class AlchemyProviderAdapter extends BaseProviderAdapter {
  readonly providerId = "alchemy"
  readonly category = "chain-rpc" as const
  protected readonly supportedChainIds = ["ethereum", "arbitrum", "optimism", "base", "polygon"]
}
