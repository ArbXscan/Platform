import type { RouterQuoteAdapter } from "../engine/types"

/** Re-exported so consumers of the Router Registry don't need to reach into features/verification/engine directly. */
export type { RouterQuoteAdapter } from "../engine/types"

/**
 * Thrown when attempting to register a router id that's already registered.
 * Router ids are case-insensitive throughout the Router Registry, so
 * "Jupiter" and "jupiter" collide.
 */
export class DuplicateRouterAdapterError extends Error {
  constructor(routerId: string) {
    super(`A router adapter is already registered for id "${routerId}".`)
    this.name = "DuplicateRouterAdapterError"
  }
}

/** Internal helper signature shared by registry.ts and resolver.ts. */
export type RouterAdapterPredicate = (adapter: RouterQuoteAdapter) => boolean
