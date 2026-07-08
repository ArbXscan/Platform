import { useCallback, useEffect } from "react"
import { searchTokens } from "../features/search/search.service"
import { useTokenStore } from "../store/useTokenStore"
import { useRecentSearches } from "./useRecentSearches"

/**
 * Fetches ranked search candidates for a query. Mirrors hooks/useToken.ts:
 * owns the fetch lifecycle only, UI reads state via useTokenStore per the
 * UI -> Hooks -> Features -> Services flow. Wires up searchResults/searchStatus,
 * which existed in useTokenStore since Step 2 but were never connected to
 * anything until now. Also records the submitted term into Recent Searches
 * (hooks/useRecentSearches.ts) so the Dashboard can show it.
 */
export function useSearch(query: string | undefined) {
  const results = useTokenStore((s) => s.searchResults)
  const status = useTokenStore((s) => s.searchStatus)
  const error = useTokenStore((s) => s.searchError)
  const setSearchResults = useTokenStore((s) => s.setSearchResults)
  const setSearchStatus = useTokenStore((s) => s.setSearchStatus)
  const setSearchError = useTokenStore((s) => s.setSearchError)
  const { record } = useRecentSearches()

  const refresh = useCallback(async () => {
    if (!query || !query.trim()) {
      setSearchResults([])
      return
    }
    setSearchStatus("loading")
    record(query)
    try {
      const result = await searchTokens(query)
      setSearchResults(result)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Failed to search tokens")
    }
  }, [query, setSearchResults, setSearchStatus, setSearchError, record])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { results, status, error, refresh }
}
