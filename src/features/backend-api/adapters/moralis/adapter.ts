import { BaseProviderAdapter } from "../base/adapter"

/**
 * Moralis (token metadata) adapter stub. No HTTP calls, no SDK, no API key —
 * registered as an extension point for a future milestone that implements a
 * real token-metadata lookup.
 */
export class MoralisProviderAdapter extends BaseProviderAdapter {
  readonly providerId = "moralis"
  readonly category = "token-metadata" as const
  protected readonly supportedChainIds = ["ethereum", "arbitrum", "optimism", "base", "bnb", "polygon", "avalanche"]
}
