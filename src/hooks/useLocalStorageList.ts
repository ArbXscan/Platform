import { useCallback, useEffect, useState } from "react"

/**
 * Reusable localStorage-backed list hook. Generic over the stored item
 * type; the caller supplies how to compute a stable id for dedup/removal.
 *
 * Client-only persistence — this is a browser app with no backend/account
 * system yet (see docs/ROADMAP.md), so localStorage is the correct store
 * for per-device preferences like a watchlist or recent search history
 * until a future Backend milestone adds server-side accounts.
 */
export function useLocalStorageList<T>(storageKey: string, getId: (item: T) => string, maxItems = 50) {
  const [items, setItems] = useState<T[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = window.localStorage.getItem(storageKey)
      return raw ? (JSON.parse(raw) as T[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items))
    } catch {
      // Storage can fail (quota exceeded, private browsing) — the in-memory
      // list still works for the rest of this session either way.
    }
  }, [storageKey, items])

  const add = useCallback(
    (item: T) => {
      setItems((prev) => {
        const id = getId(item)
        const withoutExisting = prev.filter((existing) => getId(existing) !== id)
        return [item, ...withoutExisting].slice(0, maxItems)
      })
    },
    [getId, maxItems],
  )

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((existing) => getId(existing) !== id))
    },
    [getId],
  )

  const has = useCallback((id: string) => items.some((existing) => getId(existing) === id), [items, getId])

  const clear = useCallback(() => setItems([]), [])

  return { items, add, remove, has, clear }
}
