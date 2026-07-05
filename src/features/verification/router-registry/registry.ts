import type { RouterQuoteAdapter } from "../engine/types"
import { DuplicateRouterAdapterError } from "./types"

/** Registered adapters, keyed by lowercase, trimmed router id — router ids are case-insensitive throughout this module. */
const registeredAdapters: Map<string, RouterQuoteAdapter> = new Map()

function normalizeRouterId(routerId: string): string {
  return routerId.trim().toLowerCase()
}

/**
 * Registers a router adapter with the Router Registry.
 * Throws DuplicateRouterAdapterError if an adapter is already registered
 * under the same id (case-insensitive) — call unregisterRouterAdapter first
 * if you need to replace one.
 */
export function registerRouterAdapter(adapter: RouterQuoteAdapter): void {
  const key = normalizeRouterId(adapter.routerId)
  if (registeredAdapters.has(key)) {
    throw new DuplicateRouterAdapterError(adapter.routerId)
  }
  registeredAdapters.set(key, adapter)
}

/** Removes a previously registered adapter, identified by its router id (case-insensitive). */
export function unregisterRouterAdapter(routerId: string): void {
  registeredAdapters.delete(normalizeRouterId(routerId))
}

/** Whether an adapter is currently registered under the given router id (case-insensitive). */
export function isRouterAdapterRegistered(routerId: string): boolean {
  return registeredAdapters.has(normalizeRouterId(routerId))
}

/** Returns every currently registered adapter. */
export function getRegisteredAdapters(): RouterQuoteAdapter[] {
  return Array.from(registeredAdapters.values())
}

/** Removes every registered adapter. Mainly useful for tests. */
export function clearRouterRegistry(): void {
  registeredAdapters.clear()
}
