import { BaseProviderAdapter } from "../base/adapter"

/**
 * The Graph (on-chain indexing) adapter stub. No HTTP calls, no SDK, no API
 * key — registered as an extension point for a future milestone that
 * implements a real subgraph query integration.
 */
export class TheGraphProviderAdapter extends BaseProviderAdapter {
  readonly providerId = "thegraph"
  readonly category = "onchain-index" as const
  protected readonly supportedChainIds = ["ethereum", "arbitrum", "optimism", "base", "bnb", "polygon", "avalanche"]
}
