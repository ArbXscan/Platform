import { BaseRouterAdapter } from "../base/adapter"

/**
 * Jupiter (Solana swap aggregator) adapter stub. No HTTP calls, no SDK, no
 * API key — registered as an extension point for a future milestone that
 * implements a real quote lookup.
 */
export class JupiterRouterAdapter extends BaseRouterAdapter {
  readonly routerId = "jupiter"
  protected readonly supportedChainIds = ["solana"]
}
