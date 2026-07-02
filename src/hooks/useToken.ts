import { useCallback, useEffect } from "react"
import { getTokenDetail } from "../features/token/token.service"
import { useTokenStore } from "../store/useTokenStore"

/**
 * Fetches token detail for a given search query (address, symbol, or name) on
 * mount and whenever the query changes. Mirrors hooks/useMarketData.ts: owns the
 * fetch lifecycle only, UI reads state via useTokenStore per the
 * UI -> Hooks -> Features -> Services flow (docs/CODING_STANDARTS.md).
 *
 * No polling interval here (unlike useMarketData) — a token detail page is
 * viewed on-demand per query, not continuously monitored like the dashboard.
 */
export function useToken(query: string | undefined) {
  const currentToken = useTokenStore((s) => s.currentToken)
  const detailStatus = useTokenStore((s) => s.detailStatus)
  const error = useTokenStore((s) => s.error)
  const setCurrentToken = useTokenStore((s) => s.setCurrentToken)
  const setDetailStatus = useTokenStore((s) => s.setDetailStatus)
  const setError = useTokenStore((s) => s.setError)

  const refresh = useCallback(async () => {
    if (!query) return
    setDetailStatus("loading")
    try {
      const result = await getTokenDetail(query)
      setCurrentToken(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load token data")
    }
  }, [query, setCurrentToken, setDetailStatus, setError])

  useEffect(() => {
    refresh()
    // Clear stale token data when the query changes or the page unmounts, so a
    // slow request for the old query can't overwrite state after navigating away.
    return () => setCurrentToken(null)
  }, [refresh])

  return { token: currentToken, status: detailStatus, error, refresh }
}
