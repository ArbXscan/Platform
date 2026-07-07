import type { DataProviderAdapter, ProviderCategory, ProviderDataRequest, ProviderDataResponse } from "./types"

/** Registered provider adapters, keyed by their canonical providerId (lowercase). */
const providers: Map<string, DataProviderAdapter> = new Map()

/**
 * Registers a provider adapter so the gateway can use it for future
 * requests. No adapters are registered by default — CoinMarketCap,
 * Moralis, Alchemy, The Graph, and any future provider are added here by a
 * later milestone, without this gateway or any engine/UI code needing to
 * change.
 */
export function registerProvider(adapter: DataProviderAdapter): void {
  providers.set(adapter.providerId.toLowerCase(), adapter)
}

/** Removes a previously registered adapter. Mainly useful for tests. */
export function unregisterProvider(providerId: string): void {
  providers.delete(providerId.toLowerCase())
}

/** Returns the canonical ids of every currently registered adapter. */
export function getRegisteredProviderIds(): string[] {
  return Array.from(providers.keys())
}

/** Returns the canonical ids of every registered adapter for a given category. */
export function listRegisteredProvidersByCategory(category: ProviderCategory): string[] {
  return Array.from(providers.values())
    .filter((adapter) => adapter.category === category)
    .map((adapter) => adapter.providerId)
}

/**
 * Runs one data request against whichever provider adapter is registered
 * for it. Provider-agnostic: never imports a specific provider's SDK/API
 * itself, only calls whichever adapter is registered for the requested
 * providerId. If no adapter is registered, the adapter is registered under
 * a different category, or the adapter doesn't support the requested chain
 * (the case for every provider today, since none are implemented yet), the
 * response comes back with status "unsupported" rather than a guessed
 * value.
 */
export async function requestProviderData(request: ProviderDataRequest): Promise<ProviderDataResponse> {
  const fetchedAt = new Date().toISOString()
  const adapter = providers.get(request.providerId.toLowerCase())

  if (!adapter) {
    return {
      providerId: request.providerId,
      status: "unsupported",
      message: `No provider adapter registered for "${request.providerId}" yet.`,
      fetchedAt,
    }
  }

  if (adapter.category !== request.category) {
    return {
      providerId: request.providerId,
      status: "unsupported",
      message: `"${request.providerId}" is registered for category "${adapter.category}", not "${request.category}".`,
      fetchedAt,
    }
  }

  if (!adapter.supportsChain(request.chainId)) {
    return {
      providerId: request.providerId,
      status: "unsupported",
      message: `"${request.providerId}" does not support chain "${request.chainId}".`,
      fetchedAt,
    }
  }

  try {
    return await adapter.getData(request)
  } catch (err) {
    return {
      providerId: request.providerId,
      status: "error",
      message: err instanceof Error ? err.message : "Provider adapter request failed.",
      fetchedAt,
    }
  }
}
