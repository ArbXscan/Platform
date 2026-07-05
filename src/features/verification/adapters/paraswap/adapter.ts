import { BaseRouterAdapter } from "../base/adapter"

/**
 * Paraswap (EVM swap aggregator) adapter stub. No HTTP calls, no SDK, no API
 * key — registered as an extension point for a future milestone that
 * implements a real quote lookup.
 */
export class ParaswapRouterAdapter extends BaseRouterAdapter {
  readonly routerId = "paraswap"
  protected readonly supportedChainIds = ["ethereum", "bnb", "polygon", "arbitrum", "optimism", "base", "avalanche"]
}
