import type { CrossChainRecommendationAction, CrossChainRiskLevel } from "../../features/cross-chain"

/** Which opportunities are worth alerting on. Every threshold is compared against fields the UI already displays — nothing new is calculated to evaluate these. */
export interface AlertRulesConfig {
  minSpreadPercent: number
  minRoiPercent: number
  minConfidenceScore: number
  minLiquidityUsd: number
  allowedRecommendations: CrossChainRecommendationAction[]
  allowedRiskLevels: CrossChainRiskLevel[]
}

/** Delivery pacing and retry behavior for the Alert Queue. */
export interface AlertQueueConfig {
  /** Minimum delay between two consecutive sends, in ms — the rate limit. Default: 1000 (1 message/second). */
  sendIntervalMs: number
  /** Total attempts per alert before it's marked "failed". */
  retryCount: number
  /** Delay between retry attempts, in ms. */
  retryDelayMs: number
}

/** How long an already-alerted opportunity is suppressed from alerting again. */
export interface AlertDeduplicationConfig {
  /** Default: 300 (5 minutes). */
  cooldownSeconds: number
}

export interface NotificationEngineConfig {
  rules: AlertRulesConfig
  queue: AlertQueueConfig
  deduplication: AlertDeduplicationConfig
}

/**
 * Default Notification Engine configuration. Every tunable value used
 * anywhere in this module is defined here — no magic numbers in
 * rules.ts, queue.ts, dedupe.ts, or notification-engine.ts.
 */
export const DEFAULT_NOTIFICATION_ENGINE_CONFIG: NotificationEngineConfig = {
  rules: {
    minSpreadPercent: 1,
    minRoiPercent: 1,
    minConfidenceScore: 50,
    minLiquidityUsd: 5_000,
    allowedRecommendations: ["BUY"],
    allowedRiskLevels: ["LOW", "MEDIUM"],
  },
  queue: {
    sendIntervalMs: 1_000,
    retryCount: 3,
    retryDelayMs: 5_000,
  },
  deduplication: {
    cooldownSeconds: 300,
  },
}

/** Merges partial overrides over the defaults, one section at a time, so a caller can override just e.g. `rules` without having to restate `queue`/`deduplication`. */
export function mergeNotificationEngineConfig(
  overrides?: Partial<{
    rules: Partial<AlertRulesConfig>
    queue: Partial<AlertQueueConfig>
    deduplication: Partial<AlertDeduplicationConfig>
  }>,
): NotificationEngineConfig {
  return {
    rules: { ...DEFAULT_NOTIFICATION_ENGINE_CONFIG.rules, ...overrides?.rules },
    queue: { ...DEFAULT_NOTIFICATION_ENGINE_CONFIG.queue, ...overrides?.queue },
    deduplication: { ...DEFAULT_NOTIFICATION_ENGINE_CONFIG.deduplication, ...overrides?.deduplication },
  }
}
