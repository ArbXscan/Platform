/** Thrown by withTimeout when `run` doesn't settle within the given time. */
export class ProviderTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Provider adapter call timed out after ${timeoutMs}ms.`)
    this.name = "ProviderTimeoutError"
  }
}

/**
 * Races `run` against a timer. Rejects with ProviderTimeoutError if `run`
 * hasn't settled within `timeoutMs`. Generic over the resolved type so any
 * gateway operation can reuse it.
 */
export function withTimeout<T>(run: () => Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new ProviderTimeoutError(timeoutMs)), timeoutMs)

    run()
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}
