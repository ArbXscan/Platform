import type { ProviderMetricsSnapshot } from "./types"

interface MutableMetrics {
  totalCalls: number
  successCount: number
  errorCount: number
  unsupportedCount: number
  cacheHitCount: number
  totalDurationMs: number
  lastDurationMs?: number
}

const metrics: Map<string, MutableMetrics> = new Map()

function emptyMetrics(): MutableMetrics {
  return {
    totalCalls: 0,
    successCount: 0,
    errorCount: 0,
    unsupportedCount: 0,
    cacheHitCount: 0,
    totalDurationMs: 0,
  }
}

function toSnapshot(providerId: string, current: MutableMetrics): ProviderMetricsSnapshot {
  return {
    providerId,
    totalCalls: current.totalCalls,
    successCount: current.successCount,
    errorCount: current.errorCount,
    unsupportedCount: current.unsupportedCount,
    cacheHitCount: current.cacheHitCount,
    averageDurationMs: current.totalCalls > 0 ? current.totalDurationMs / current.totalCalls : 0,
    lastDurationMs: current.lastDurationMs,
  }
}

/** Records one completed provider call's outcome and execution time for metrics reporting. */
export function recordProviderCall(
  providerId: string,
  outcome: "ok" | "error" | "unsupported",
  durationMs: number,
  fromCache: boolean,
): void {
  const key = providerId.toLowerCase()
  const current = metrics.get(key) ?? emptyMetrics()

  current.totalCalls += 1
  if (outcome === "ok") current.successCount += 1
  if (outcome === "error") current.errorCount += 1
  if (outcome === "unsupported") current.unsupportedCount += 1
  if (fromCache) current.cacheHitCount += 1
  current.totalDurationMs += durationMs
  current.lastDurationMs = durationMs

  metrics.set(key, current)
}

/** Returns a snapshot of a provider's cumulative metrics, or undefined if it has never been called. */
export function getProviderMetrics(providerId: string): ProviderMetricsSnapshot | undefined {
  const key = providerId.toLowerCase()
  const current = metrics.get(key)
  return current ? toSnapshot(key, current) : undefined
}

/** Returns metrics snapshots for every provider that has been called at least once. */
export function listProviderMetrics(): ProviderMetricsSnapshot[] {
  return Array.from(metrics.entries()).map(([providerId, current]) => toSnapshot(providerId, current))
}

/** Clears all tracked metrics. Mainly useful for tests. */
export function resetProviderMetrics(): void {
  metrics.clear()
}
