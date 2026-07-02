import { useCallback, useEffect } from "react"
import { MARKET_REFRESH_INTERVAL_MS } from "../constants/config"
import { getMarketSnapshot } from "../features/market/market.service"
import { useMarketStore } from "../store/useMarketStore"

/**
 * Fetches the market snapshot on mount and refreshes it on an interval.
 * UI components should read state via useMarketStore directly; this hook
 * only owns the fetch lifecycle (per the UI -> Hooks -> Features -> Services flow).
 */
export function useMarketData(chainId?: string) {
  const snapshot = useMarketStore((s) => s.snapshot)
  const status = useMarketStore((s) => s.status)
  const error = useMarketStore((s) => s.error)
  const setSnapshot = useMarketStore((s) => s.setSnapshot)
  const setStatus = useMarketStore((s) => s.setStatus)
  const setError = useMarketStore((s) => s.setError)

  const refresh = useCallback(async () => {
    setStatus("loading")
    try {
      const result = await getMarketSnapshot(chainId)
      setSnapshot(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load market data")
    }
  }, [chainId, setSnapshot, setStatus, setError])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, MARKET_REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  return { snapshot, status, error, refresh }
}
