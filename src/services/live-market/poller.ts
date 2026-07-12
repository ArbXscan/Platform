import { DEFAULT_LIVE_FEED_CONFIG } from "./config"
import { isWebSocketTransportAvailable } from "./websocket-transport"
import type { LiveFeedConfig, LiveFeedState } from "./types"

export type LiveFeedListener = (state: LiveFeedState) => void

export interface LiveFeedHandle {
  /** Stops the loop and clears any pending timer. Safe to call more than once. */
  stop: () => void
  /** Runs a refresh immediately, canceling any pending scheduled tick. A no-op if a refresh is already in flight. */
  refreshNow: () => void
  getState: () => LiveFeedState
}

const INITIAL_STATE: LiveFeedState = {
  status: "connecting",
  lastUpdatedAt: null,
  lastError: null,
  consecutiveFailures: 0,
}

/**
 * Starts a reusable Live Market Feed loop: repeatedly calls `refresh` on a
 * timer (polling — see websocket-transport.ts for why WebSocket isn't used
 * yet) and reports state after every attempt via `onStateChange`. Framework
 * agnostic — no React here; hooks/useLiveMarketFeed.ts wraps this for
 * components.
 *
 * `refresh` is caller-supplied and can be any existing refresh function
 * (e.g. useCrossChainArbitrage's own refresh, which already reruns the
 * Cross-Chain Opportunity Engine, Profit Calculator, and Recommendation
 * Engine internally). This module never reimplements what `refresh` does —
 * it only decides *when* to call it.
 *
 * Never throws: a failing `refresh` is caught, recorded in state, and
 * retried after `reconnectIntervalMs` — it never stops the loop and never
 * propagates to the caller. Only one refresh runs at a time; a timer tick
 * or a manual refreshNow() call while one is already in flight is ignored
 * rather than duplicating the request.
 */
export function startLiveFeed(
  refresh: () => Promise<void>,
  onStateChange: LiveFeedListener,
  config: LiveFeedConfig = DEFAULT_LIVE_FEED_CONFIG,
): LiveFeedHandle {
  let stopped = false
  let inFlight = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let state: LiveFeedState = INITIAL_STATE

  function setState(patch: Partial<LiveFeedState>) {
    state = { ...state, ...patch }
    onStateChange(state)
  }

  function scheduleNext(delayMs: number) {
    if (stopped) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(runCycle, delayMs)
  }

  async function runCycle() {
    if (stopped || inFlight) return
    inFlight = true

    try {
      await refresh()
      setState({
        status: isWebSocketTransportAvailable() ? "live" : "polling",
        lastUpdatedAt: new Date().toISOString(),
        lastError: null,
        consecutiveFailures: 0,
      })
      scheduleNext(config.pollingIntervalMs)
    } catch (err) {
      const consecutiveFailures = state.consecutiveFailures + 1
      setState({
        status: consecutiveFailures >= config.maxConsecutiveFailures ? "offline" : "error",
        lastError: err instanceof Error ? err.message : "Live feed refresh failed.",
        consecutiveFailures,
      })
      scheduleNext(config.reconnectIntervalMs)
    } finally {
      inFlight = false
    }
  }

  runCycle()

  return {
    stop: () => {
      stopped = true
      if (timer) clearTimeout(timer)
    },
    refreshNow: () => {
      if (timer) clearTimeout(timer)
      runCycle()
    },
    getState: () => state,
  }
}
