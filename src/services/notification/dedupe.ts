import type { OpportunityAlertInput } from "./types"

/** Stable identity for one opportunity, for dedup purposes — same asset, same buy/sell chain+DEX route. */
export function alertIdentityKey(input: OpportunityAlertInput): string {
  const { token, sourceChain, destinationChain, sourceDex, destinationDex } = input.opportunity
  return `${token}:${sourceChain}:${destinationChain}:${sourceDex}:${destinationDex}`.toLowerCase()
}

export interface AlertDeduplicator {
  /** Whether this opportunity was already alerted within the cooldown window. */
  isOnCooldown(input: OpportunityAlertInput): boolean
  /** Marks this opportunity as alerted now, starting its cooldown window. */
  markAlerted(input: OpportunityAlertInput): void
  reset(): void
}

/**
 * In-memory cooldown tracker: an opportunity that was already alerted
 * within `cooldownSeconds` is suppressed from alerting again. Memory
 * only, scoped to one running session — the same pattern as
 * features/backend-api/cache (no localStorage/database), which is
 * appropriate for a client-side engine with no backend yet.
 */
export function createAlertDeduplicator(cooldownSeconds: number): AlertDeduplicator {
  const lastAlertedAt = new Map<string, number>()

  return {
    isOnCooldown(input) {
      const key = alertIdentityKey(input)
      const alertedAt = lastAlertedAt.get(key)
      if (alertedAt === undefined) return false
      return Date.now() - alertedAt < cooldownSeconds * 1000
    },
    markAlerted(input) {
      lastAlertedAt.set(alertIdentityKey(input), Date.now())
    },
    reset() {
      lastAlertedAt.clear()
    },
  }
}
