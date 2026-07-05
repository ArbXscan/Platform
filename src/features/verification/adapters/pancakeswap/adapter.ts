import { BaseRouterAdapter } from "../base/adapter"

/**
 * PancakeSwap router adapter stub. No HTTP calls, no SDK, no API key —
 * registered as an extension point for a future milestone that implements a
 * real quote lookup.
 */
export class PancakeSwapRouterAdapter extends BaseRouterAdapter {
  readonly routerId = "pancakeswap"
  protected readonly supportedChainIds = ["bnb"]
}
