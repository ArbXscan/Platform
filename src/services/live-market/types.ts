export type LiveFeedConnectionStatus = "connecting" | "live" | "polling" | "offline" | "error"

/**
 * Configuration for the Live Market Feed. No magic numbers live anywhere
 * else in this module — every tunable value is defined once, in config.ts.
 */
export interface LiveFeedConfig {
  /** Whether to attempt a WebSocket transport before falling back to polling. See websocket-transport.ts for why this defaults to false today. */
  websocketEnabled: boolean
  /** Interval between refreshes, in milliseconds, while the feed is healthy. */
  pollingIntervalMs: number
  /** Delay before retrying, in milliseconds, after a failed refresh. */
  reconnectIntervalMs: number
  /** Consecutive failures after which the feed reports "offline" (it keeps retrying regardless). */
  maxConsecutiveFailures: number
}

/** Current status of one running Live Market Feed, reported after every refresh attempt. */
export interface LiveFeedState {
  status: LiveFeedConnectionStatus
  /** ISO 8601 timestamp of the last successful refresh, or null before the first one completes. */
  lastUpdatedAt: string | null
  lastError: string | null
  consecutiveFailures: number
}
