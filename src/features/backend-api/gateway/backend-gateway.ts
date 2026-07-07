import { createMemoryCache } from "../cache"
import type { BackendCache } from "../cache"
import { buildProviderCacheKey } from "./cache-key"
import { getProviderHealth, listProviderHealth, recordProviderFailure, recordProviderSuccess, resetProviderHealth } from "./health"
import { getProviderMetrics, listProviderMetrics, recordProviderCall, resetProviderMetrics } from "./metrics"
import { clearProviderPriority, getProviderPriority, resolveFallbackOrder, setProviderPriority } from "./priority"
import { DEFAULT_RETRY_POLICY, withRetry } from "./retry"
import { withTimeout } from "./timeout"
import type {
  DataProviderAdapter,
  ProviderCategory,
  ProviderDataRequest,
  ProviderDataResponse,
  RequestProviderDataOptions,
} from "./types"

/** Registered provider adapters, keyed by their canonical providerId (lowercase). */
const providers: Map<string, DataProviderAdapter> = new Map()

/**
 * Default time a successful provider response stays cached before the
 * gateway calls the provider adapter again. Callers may override this per
 * request via requestProviderData's `ttlMs` option.
 */
export const DEFAULT_PROVIDER_CACHE_TTL_MS = 60_000

/** Default timeout applied to a provider adapter call when the caller doesn't supply one. */
export const DEFAULT_TIMEOUT_MS = 10_000

/**
 * Backend Cache Layer instance the gateway checks before calling a provider
 * adapter. The gateway depends only on the BackendCache<ProviderDataResponse>
 * interface (features/backend-api/cache) — it has no idea this is a memory
 * cache underneath, and swapping the cache implementation later needs no
 * change here beyond this one line.
 */
const responseCache: BackendCache<ProviderDataResponse> = createMemoryCache<ProviderDataResponse>()

/**
 * Registers a provider adapter so the gateway can use it for future
 * requests. No adapters are registered by default — CoinMarketCap,
 * Moralis, Alchemy, The Graph, DexScreener, GeckoTerminal, and any future
 * provider are added here by a later milestone, without this gateway or
 * any engine/UI code needing to change.
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
 * for it, checking the Backend Cache Layer first. Provider-agnostic: never
 * imports a specific provider's SDK/API itself, only calls whichever
 * adapter is registered for the requested providerId.
 *
 * Flow: check cache → if cached, return the cached response as-is → if not
 * cached, resolve the adapter (unchanged "unsupported" checks below) → call
 * the adapter under the retry and timeout policy → cache the response only
 * if it came back "ok" → record health/metrics → return it. "unsupported"
 * and "error" responses are never cached, so a not-yet-implemented or
 * failing provider is retried on every call.
 *
 * Backward compatible: calling this with just `request` (no `options`)
 * behaves exactly as before this milestone for a first, uncached call —
 * the only difference is a transient failure now gets one automatic retry
 * before surfacing as "error", and a hung adapter call now times out
 * instead of waiting forever.
 *
 * `options.ttlMs` overrides DEFAULT_PROVIDER_CACHE_TTL_MS, `options.retry`
 * overrides DEFAULT_RETRY_POLICY, and `options.timeoutMs` overrides
 * DEFAULT_TIMEOUT_MS — all optional and additive.
 */
export async function requestProviderData(
  request: ProviderDataRequest,
  options?: RequestProviderDataOptions,
): Promise<ProviderDataResponse> {
  const cacheKey = buildProviderCacheKey(request)
  const cached = responseCache.get(cacheKey)
  if (cached) {
    recordProviderCall(request.providerId, cached.status, 0, true)
    return cached
  }

  const fetchedAt = new Date().toISOString()
  const adapter = providers.get(request.providerId.toLowerCase())

  if (!adapter) {
    recordProviderCall(request.providerId, "unsupported", 0, false)
    return {
      providerId: request.providerId,
      status: "unsupported",
      message: `No provider adapter registered for "${request.providerId}" yet.`,
      fetchedAt,
    }
  }

  if (adapter.category !== request.category) {
    recordProviderCall(request.providerId, "unsupported", 0, false)
    return {
      providerId: request.providerId,
      status: "unsupported",
      message: `"${request.providerId}" is registered for category "${adapter.category}", not "${request.category}".`,
      fetchedAt,
    }
  }

  if (!adapter.supportsChain(request.chainId)) {
    recordProviderCall(request.providerId, "unsupported", 0, false)
    return {
      providerId: request.providerId,
      status: "unsupported",
      message: `"${request.providerId}" does not support chain "${request.chainId}".`,
      fetchedAt,
    }
  }

  const retryPolicy = options?.retry ?? DEFAULT_RETRY_POLICY
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const startedAt = Date.now()

  try {
    const response = await withRetry(() => withTimeout(() => adapter.getData(request), timeoutMs), retryPolicy)
    const durationMs = Date.now() - startedAt

    if (response.status === "ok") {
      responseCache.set(cacheKey, response, options?.ttlMs ?? DEFAULT_PROVIDER_CACHE_TTL_MS)
      recordProviderSuccess(request.providerId)
    } else if (response.status === "error") {
      recordProviderFailure(request.providerId)
    }
    recordProviderCall(request.providerId, response.status, durationMs, false)

    return response
  } catch (err) {
    const durationMs = Date.now() - startedAt
    recordProviderFailure(request.providerId)
    recordProviderCall(request.providerId, "error", durationMs, false)

    return {
      providerId: request.providerId,
      status: "error",
      message: err instanceof Error ? err.message : "Provider adapter request failed.",
      fetchedAt,
    }
  }
}

/**
 * Like requestProviderData, but resolves which registered provider to call
 * from priority/fallback order (see priority.ts) instead of a single fixed
 * providerId. Tries candidates in order and returns the first "ok"
 * response. If every candidate comes back "unsupported" or "error",
 * returns the last response received. If no provider is registered for the
 * category at all, returns a synthesized "unsupported" response rather
 * than throwing.
 */
export async function requestProviderDataWithFallback(
  request: Omit<ProviderDataRequest, "providerId">,
  options?: RequestProviderDataOptions,
): Promise<ProviderDataResponse> {
  const candidates = resolveFallbackOrder(request.category, listRegisteredProvidersByCategory(request.category))

  if (candidates.length === 0) {
    return {
      providerId: "none",
      status: "unsupported",
      message: `No provider adapter registered for category "${request.category}" yet.`,
      fetchedAt: new Date().toISOString(),
    }
  }

  let lastResponse: ProviderDataResponse | undefined

  for (const providerId of candidates) {
    const response = await requestProviderData({ ...request, providerId }, options)
    if (response.status === "ok") {
      return response
    }
    lastResponse = response
  }

  return lastResponse!
}

export {
  clearProviderPriority,
  getProviderHealth,
  getProviderMetrics,
  getProviderPriority,
  listProviderHealth,
  listProviderMetrics,
  resetProviderHealth,
  resetProviderMetrics,
  setProviderPriority,
}
