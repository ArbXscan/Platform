import type { LiveFeedConfig } from "./types"

/**
 * Default Live Market Feed configuration. Every value here is the single
 * source of truth for its concern — nothing in poller.ts or
 * useLiveMarketFeed.ts hardcodes its own interval or threshold.
 */
export const DEFAULT_LIVE_FEED_CONFIG: LiveFeedConfig = {
  websocketEnabled: false,
  pollingIntervalMs: 5_000,
  reconnectIntervalMs: 5_000,
  maxConsecutiveFailures: 3,
}
