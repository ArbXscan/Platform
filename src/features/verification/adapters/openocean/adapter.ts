import { BaseRouterAdapter } from "../base/adapter"

/**
 * OpenOcean (multi-chain swap aggregator) adapter stub. No HTTP calls, no
 * SDK, no API key — registered as an extension point for a future milestone
 * that implements a real quote lookup.
 */
export class OpenOceanRouterAdapter extends BaseRouterAdapter {
  readonly routerId = "openocean"
  protected readonly supportedChainIds = [
    "ethereum",
    "bnb",
    "polygon",
    "arbitrum",
    "optimism",
    "base",
    "avalanche",
    "solana",
  ]
}
