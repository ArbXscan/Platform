import type { ProviderHealthRecord } from "./types"

/** Consecutive-failure threshold after which a provider escalates from "degraded" to "unhealthy". */
const UNHEALTHY_THRESHOLD = 3

const health: Map<string, ProviderHealthRecord> = new Map()

function emptyRecord(providerId: string): ProviderHealthRecord {
  return { providerId, status: "unknown", consecutiveFailures: 0, consecutiveSuccesses: 0 }
}

/** Records a successful provider call, resetting its failure streak and marking it "healthy". */
export function recordProviderSuccess(providerId: string): void {
  const key = providerId.toLowerCase()
  const record = health.get(key) ?? emptyRecord(key)
  health.set(key, {
    ...record,
    status: "healthy",
    consecutiveFailures: 0,
    consecutiveSuccesses: record.consecutiveSuccesses + 1,
    lastSuccessAt: new Date().toISOString(),
  })
}

/** Records a failed provider call, escalating status to "degraded" then "unhealthy" as failures accumulate. */
export function recordProviderFailure(providerId: string): void {
  const key = providerId.toLowerCase()
  const record = health.get(key) ?? emptyRecord(key)
  const consecutiveFailures = record.consecutiveFailures + 1
  health.set(key, {
    ...record,
    status: consecutiveFailures >= UNHEALTHY_THRESHOLD ? "unhealthy" : "degraded",
    consecutiveFailures,
    consecutiveSuccesses: 0,
    lastFailureAt: new Date().toISOString(),
  })
}

/** Returns the current health record for a provider, or undefined if it has never been called. */
export function getProviderHealth(providerId: string): ProviderHealthRecord | undefined {
  return health.get(providerId.toLowerCase())
}

/** Returns health records for every provider that has been called at least once. */
export function listProviderHealth(): ProviderHealthRecord[] {
  return Array.from(health.values())
}

/** Clears all tracked health records. Mainly useful for tests. */
export function resetProviderHealth(): void {
  health.clear()
}
