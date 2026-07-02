import { useCallback, useEffect } from "react"
import { ARBITRAGE_REFRESH_INTERVAL_MS } from "../constants/config"
import { scanArbitrageOpportunities } from "../features/arbitrage/arbitrage.service"
import { useArbitrageStore } from "../store/useArbitrageStore"

/**
 * Fetches arbitrage opportunities on mount and refreshes on an interval.
 * Mirrors hooks/useMarketData.ts: owns the fetch lifecycle only, UI reads
 * state via useArbitrageStore per the UI -> Hooks -> Features -> Services flow
 * (docs/CODING_STANDARTS.md). Uses ARBITRAGE_REFRESH_INTERVAL_MS (shorter than
 * the market page's interval) since spreads move faster than trending stats.
 */
export function useArbitrage(chainId?: string) {
  const opportunities = useArbitrageStore((s) => s.opportunities)
  const status = useArbitrageStore((s) => s.status)
  const error = useArbitrageStore((s) => s.error)
  const setOpportunities = useArbitrageStore((s) => s.setOpportunities)
  const setStatus = useArbitrageStore((s) => s.setStatus)
  const setError = useArbitrageStore((s) => s.setError)

  const refresh = useCallback(async () => {
    setStatus("loading")
    try {
      const result = await scanArbitrageOpportunities(chainId)
      setOpportunities(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan arbitrage opportunities")
    }
  }, [chainId, setOpportunities, setStatus, setError])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, ARBITRAGE_REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  return { opportunities, status, error, refresh }
}
