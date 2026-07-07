import type { ProviderCategory } from "./types"

/**
 * Caller-declared provider priority per category. Empty by default — when
 * no priority is set for a category, resolveFallbackOrder falls back to the
 * registration order supplied by its caller (see backend-gateway.ts).
 */
const categoryPriority: Map<ProviderCategory, string[]> = new Map()

/** Sets the fallback order (most preferred first) of provider ids to try for a category. */
export function setProviderPriority(category: ProviderCategory, providerIds: string[]): void {
  categoryPriority.set(
    category,
    providerIds.map((id) => id.toLowerCase()),
  )
}

/** Returns the currently configured priority order for a category, or undefined if none was set. */
export function getProviderPriority(category: ProviderCategory): string[] | undefined {
  return categoryPriority.get(category)
}

/** Clears a category's configured priority order, reverting to registration order. */
export function clearProviderPriority(category: ProviderCategory): void {
  categoryPriority.delete(category)
}

/**
 * Resolves the order in which provider ids should be tried for a category:
 * configured priority first (filtered down to ids that are actually
 * registered), then any remaining registered ids in their original
 * registration order. Never invents a provider id that isn't registered.
 */
export function resolveFallbackOrder(category: ProviderCategory, registeredIds: string[]): string[] {
  const priority = categoryPriority.get(category)
  if (!priority) {
    return registeredIds
  }

  const registeredSet = new Set(registeredIds)
  const prioritized = priority.filter((id) => registeredSet.has(id))
  const remaining = registeredIds.filter((id) => !prioritized.includes(id))
  return [...prioritized, ...remaining]
}
