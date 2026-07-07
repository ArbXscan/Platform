import type { RetryPolicy } from "./types"

/** Default retry policy applied when a caller doesn't supply one: one retry after a short delay. */
export const DEFAULT_RETRY_POLICY: RetryPolicy = { maxAttempts: 2, delayMs: 300 }

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Runs `run` up to policy.maxAttempts times, waiting policy.delayMs between
 * attempts, and returns the first result that doesn't throw. Re-throws the
 * last error if every attempt fails. Generic over the resolved type so any
 * gateway operation can reuse it.
 */
export async function withRetry<T>(run: () => Promise<T>, policy: RetryPolicy = DEFAULT_RETRY_POLICY): Promise<T> {
  const attempts = Math.max(1, policy.maxAttempts)
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run()
    } catch (err) {
      lastError = err
      if (attempt < attempts && policy.delayMs > 0) {
        await delay(policy.delayMs)
      }
    }
  }

  throw lastError
}
