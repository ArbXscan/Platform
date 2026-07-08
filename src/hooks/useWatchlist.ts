import { useCallback } from "react"
import { useLocalStorageList } from "./useLocalStorageList"

export interface WatchlistEntry {
  address: string
  chainId: string
  symbol: string
  name: string
  logoUrl?: string
}

const STORAGE_KEY = "arbxscan.watchlist"
const MAX_WATCHLIST_ITEMS = 50

function entryId(entry: Pick<WatchlistEntry, "address" | "chainId">): string {
  return `${entry.chainId.trim().toLowerCase()}:${entry.address.trim().toLowerCase()}`
}

/**
 * Client-side watchlist of tracked tokens, persisted to localStorage
 * (hooks/useLocalStorageList.ts). A single source of truth for "is this
 * token watched" reused by the Dashboard's Watchlist card, Search Results,
 * and Token Detail — starring a token in any of those places updates the
 * same underlying list.
 */
export function useWatchlist() {
  const { items, add, remove, has, clear } = useLocalStorageList<WatchlistEntry>(
    STORAGE_KEY,
    entryId,
    MAX_WATCHLIST_ITEMS,
  )

  const isWatched = useCallback((address: string, chainId: string) => has(entryId({ address, chainId })), [has])

  const toggle = useCallback(
    (entry: WatchlistEntry) => {
      const id = entryId(entry)
      if (has(id)) remove(id)
      else add(entry)
    },
    [add, remove, has],
  )

  const removeByIdentity = useCallback(
    (address: string, chainId: string) => remove(entryId({ address, chainId })),
    [remove],
  )

  return { watchlist: items, toggle, remove: removeByIdentity, isWatched, clear }
}
