import type { ProviderDataRequest } from "./types"

/**
 * Builds a deterministic cache key for one provider data request. The same
 * logical request always produces the same key regardless of case, so
 * "Ethereum"/"ethereum" or differently-cased identifiers hit the same
 * cache entry.
 */
export function buildProviderCacheKey(request: ProviderDataRequest): string {
  const providerId = request.providerId.trim().toLowerCase()
  const category = request.category.trim().toLowerCase()
  const chainId = request.chainId.trim().toLowerCase()
  const identifier = request.identifier.trim().toLowerCase()
  return `${providerId}:${category}:${chainId}:${identifier}`
}
