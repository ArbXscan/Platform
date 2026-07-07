import type { DataProviderAdapter, ProviderCategory, ProviderDataRequest, ProviderDataResponse } from "../../gateway/types"

/**
 * Shared foundation for provider adapters that don't have a live
 * integration yet. Every concrete adapter in this folder (CoinMarketCap,
 * Moralis, Alchemy, The Graph) extends this: it declares which chains and
 * category it would eventually serve, and always returns a normalized
 * "unsupported" response — never an HTTP request, never an SDK call, never
 * fabricated data, and never an API key.
 *
 * A future milestone replaces getData() in a specific adapter (not here)
 * once that provider is actually integrated; this base class only exists so
 * every stub adapter satisfies DataProviderAdapter identically until then.
 */
export abstract class BaseProviderAdapter implements DataProviderAdapter {
  abstract readonly providerId: string
  abstract readonly category: ProviderCategory
  protected abstract readonly supportedChainIds: string[]

  supportsChain(chainId: string): boolean {
    return this.supportedChainIds.includes(chainId)
  }

  async getData(_request: ProviderDataRequest): Promise<ProviderDataResponse> {
    return {
      providerId: this.providerId,
      status: "unsupported",
      message: `The "${this.providerId}" provider adapter is registered but not yet implemented.`,
      fetchedAt: new Date().toISOString(),
    }
  }
}
