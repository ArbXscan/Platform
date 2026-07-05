import type { RouterQuoteAdapter, RouterQuoteRequest, RouterQuoteResponse } from "../../engine/types"

/**
 * Shared foundation for router adapters that don't have a live integration
 * yet. Every concrete adapter in this folder (Jupiter, PancakeSwap,
 * OpenOcean, Paraswap, KyberSwap, 1inch) extends this: it declares which
 * chains it would eventually serve, and always returns a normalized
 * "unsupported" response — never an HTTP request, never an SDK call, never
 * a fabricated quote, and never an API key.
 *
 * A future milestone replaces getQuote() in a specific adapter (not here)
 * once that router is actually integrated; this base class only exists so
 * every stub adapter satisfies RouterQuoteAdapter identically until then.
 */
export abstract class BaseRouterAdapter implements RouterQuoteAdapter {
  abstract readonly routerId: string
  protected abstract readonly supportedChainIds: string[]

  supportsChain(chainId: string): boolean {
    return this.supportedChainIds.includes(chainId)
  }

  async getQuote(_request: RouterQuoteRequest): Promise<RouterQuoteResponse> {
    return {
      routerId: this.routerId,
      status: "unsupported",
      message: `The "${this.routerId}" router adapter is registered but not yet implemented.`,
      fetchedAt: new Date().toISOString(),
    }
  }
}
