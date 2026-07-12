import { useEffect, useMemo, useRef, useState } from "react"
import { DEFAULT_LIVE_FEED_CONFIG, startLiveFeed } from "../services/live-market"
import type { LiveFeedConfig, LiveFeedState } from "../services/live-market"

const INITIAL_STATE: LiveFeedState = {
  status: "connecting",
  lastUpdatedAt: null,
  lastError: null,
  consecutiveFailures: 0,
}

/**
 * React wrapper around the Live Market Feed service (services/live-market).
 * Starts the feed on mount, stops it on unmount, and exposes its state plus
 * a stable `refreshNow`.
 *
 * `refresh` should be an existing refresh function (e.g.
 * useCrossChainArbitrage's own `refresh`, which already reruns the
 * Cross-Chain Opportunity Engine, Profit Calculator, and Recommendation
 * Engine) — this hook never fetches or recalculates anything itself, only
 * schedules calls to it. `refresh` is read through a ref so a new function
 * identity on every render doesn't restart the feed loop or duplicate
 * requests; only a genuine config change does.
 */
export function useLiveMarketFeed(refresh: () => Promise<void>, config: Partial<LiveFeedConfig> = {}) {
  const resolvedConfig = useMemo<LiveFeedConfig>(
    () => ({ ...DEFAULT_LIVE_FEED_CONFIG, ...config }),
    [config.websocketEnabled, config.pollingIntervalMs, config.reconnectIntervalMs, config.maxConsecutiveFailures],
  )

  const [state, setState] = useState<LiveFeedState>(INITIAL_STATE)

  const refreshRef = useRef(refresh)
  refreshRef.current = refresh

  const handleRef = useRef<ReturnType<typeof startLiveFeed> | null>(null)

  useEffect(() => {
    const handle = startLiveFeed(() => refreshRef.current(), setState, resolvedConfig)
    handleRef.current = handle
    return () => {
      handle.stop()
      handleRef.current = null
    }
  }, [resolvedConfig])

  const refreshNow = useMemo(() => () => handleRef.current?.refreshNow(), [])

  return { ...state, refreshNow }
}
