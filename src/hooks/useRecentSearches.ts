import { useCallback } from "react"
import { useLocalStorageList } from "./useLocalStorageList"

export interface RecentSearchEntry {
  term: string
  searchedAt: string
}

const STORAGE_KEY = "arbxscan.recent-searches"
const MAX_RECENT_SEARCHES = 25

function entryId(entry: Pick<RecentSearchEntry, "term">): string {
  return entry.term.trim().toLowerCase()
}

/**
 * Client-side history of submitted search terms, persisted to
 * localStorage (hooks/useLocalStorageList.ts). Single source of truth for
 * both the Dashboard's compact Recent Searches preview and its fuller
 * Search History list — both read the same `recentSearches` array, just
 * sliced/rendered differently. Recorded from hooks/useSearch.ts whenever a
 * non-empty query is searched.
 */
export function useRecentSearches() {
  const { items, add, remove, clear } = useLocalStorageList<RecentSearchEntry>(
    STORAGE_KEY,
    entryId,
    MAX_RECENT_SEARCHES,
  )

  const record = useCallback(
    (term: string) => {
      const trimmed = term.trim()
      if (!trimmed) return
      add({ term: trimmed, searchedAt: new Date().toISOString() })
    },
    [add],
  )

  const removeByTerm = useCallback((term: string) => remove(entryId({ term })), [remove])

  return { recentSearches: items, record, remove: removeByTerm, clear }
}
