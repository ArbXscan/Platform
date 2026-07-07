/** Cumulative counters for one cache instance since its creation or the last clear(). */
export interface CacheStats {
  /** Current number of entries held (expired-but-not-yet-accessed entries still count until read). */
  size: number
  hits: number
  misses: number
}

/** Internal record stored per key. Not exposed by BackendCache's own methods — get()/has() only ever return the unwrapped value or a boolean. */
export interface CacheEntry<T> {
  value: T
  /** Epoch ms this entry expires at, or undefined if it never expires. */
  expiresAt?: number
  createdAt: number
}

/**
 * Generic in-memory cache contract. Provider-independent and
 * value-type-generic — any future backend service (Scanner, Search
 * Ranking, Token Scanner, Market, Recommendation, Cross-Chain, ...) creates
 * its own instance and depends only on this interface, never on how it's
 * implemented underneath.
 */
export interface BackendCache<T> {
  /** Stores a value under `key`. `ttlMs` overrides this cache's default TTL for this entry only; omit both to never expire. */
  set(key: string, value: T, ttlMs?: number): void
  /** Returns the cached value for `key`, or undefined if missing or expired. An expired entry is evicted on this access and counted as a miss. */
  get(key: string): T | undefined
  /** Whether `key` exists and has not expired. Does not affect hit/miss stats; an expired entry found here is evicted but not counted as a miss. */
  has(key: string): boolean
  /** Removes `key`. Returns whether an entry was actually removed. */
  delete(key: string): boolean
  /** Removes every entry and resets the hit/miss counters to zero. */
  clear(): void
  /** Current size plus cumulative hit/miss counters. */
  stats(): CacheStats
}
