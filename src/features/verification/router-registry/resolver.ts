import { SUPPORTED_CHAINS } from "../../../constants/chains"
import { getRegisteredAdapters } from "./registry"
import type { RouterAdapterPredicate, RouterQuoteAdapter } from "./types"

function normalizeRouterId(routerId: string): string {
  return routerId.trim().toLowerCase()
}

function selectAdapters(predicate: RouterAdapterPredicate): RouterQuoteAdapter[] {
  return getRegisteredAdapters().filter(predicate)
}

/**
 * Resolves a single registered adapter by its router id (case-insensitive).
 * Returns undefined if no adapter is registered under that id — the Router
 * Registry never fabricates a match.
 */
export function resolveRouterAdapter(routerId: string): RouterQuoteAdapter | undefined {
  const key = normalizeRouterId(routerId)
  return getRegisteredAdapters().find((adapter) => normalizeRouterId(adapter.routerId) === key)
}

/**
 * Resolves every registered adapter that reports it supports the given
 * chain id, via each adapter's own supportsChain() check.
 */
export function resolveRouterAdaptersForChain(chainId: string): RouterQuoteAdapter[] {
  return selectAdapters((adapter) => adapter.supportsChain(chainId))
}

/**
 * Adapters that support at least one of the app's known chains
 * (constants/chains.ts). RouterQuoteAdapter has no way to enumerate its own
 * chain list, so "supported" is determined by checking each registered
 * adapter against every chain ArbXscan already recognizes.
 */
export function getSupportedRouterAdapters(): RouterQuoteAdapter[] {
  return selectAdapters((adapter) => SUPPORTED_CHAINS.some((chain) => adapter.supportsChain(chain.id)))
}

/**
 * Adapters that don't support any of the app's known chains yet — for
 * example, a router adapter registered as a placeholder before its chain
 * coverage has been defined.
 */
export function getUnsupportedRouterAdapters(): RouterQuoteAdapter[] {
  return selectAdapters((adapter) => !SUPPORTED_CHAINS.some((chain) => adapter.supportsChain(chain.id)))
}
