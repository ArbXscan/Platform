import type { BackendCache, CacheEntry, CacheStats } from "./types"

/**
 * Creates one independent, memory-only cache instance. Each call returns
 * its own private store — nothing is shared globally, so unrelated
 * consumers (Scanner, Market, Recommendation, ...) can each hold their own
 * cache without stepping on each other or needing to know this is a Map
 * underneath.
 *
 * Memory only: no localStorage, no IndexedDB, no database, no Redis, no
 * timers. Expiration is checked lazily — only when an entry is read via
 * get() or has() — so an expired-but-unread entry still counts toward
 * size() until the next access to that key.
 */
export function createMemoryCache<T>(defaultTtlMs?: number): BackendCache<T> {
  const store = new Map<string, CacheEntry<T>>()
  let hits = 0
  let misses = 0

  function isExpired(entry: CacheEntry<T>): boolean {
    return entry.expiresAt !== undefined && Date.now() > entry.expiresAt
  }

  return {
    set(key: string, value: T, ttlMs?: number): void {
      const effectiveTtl = ttlMs ?? defaultTtlMs
      store.set(key, {
        value,
        expiresAt: effectiveTtl !== undefined ? Date.now() + effectiveTtl : undefined,
        createdAt: Date.now(),
      })
    },

    get(key: string): T | undefined {
      const entry = store.get(key)
      if (!entry) {
        misses += 1
        return undefined
      }
      if (isExpired(entry)) {
        store.delete(key)
        misses += 1
        return undefined
      }
      hits += 1
      return entry.value
    },

    has(key: string): boolean {
      const entry = store.get(key)
      if (!entry) return false
      if (isExpired(entry)) {
        store.delete(key)
        return false
      }
      return true
    },

    delete(key: string): boolean {
      return store.delete(key)
    },

    clear(): void {
      store.clear()
      hits = 0
      misses = 0
    },

    stats(): CacheStats {
      return { size: store.size, hits, misses }
    },
  }
}
