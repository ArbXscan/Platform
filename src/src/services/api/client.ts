import { API_TIMEOUT_MS } from "../../constants/config"
import { ApiError } from "./errors"

interface RequestOptions extends RequestInit {
  /** Which provider this call belongs to, only used to label errors. */
  provider?: string
  timeoutMs?: number
}

/**
 * Thin fetch wrapper. This is the ONLY place raw `fetch` should be called from —
 * provider services (services/providers/*) call this, never fetch directly
 * (see docs/CODING_STANDARTS.md: "API calls must ONLY be inside services/").
 */
export async function apiGet<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { provider, timeoutMs = API_TIMEOUT_MS, ...init } = options

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...init, signal: controller.signal })

    if (!response.ok) {
      throw new ApiError({
        message: `Request failed with status ${response.status}`,
        provider,
        status: response.status,
      })
    }

    return (await response.json()) as T
  } catch (err) {
    if (err instanceof ApiError) throw err

    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError({ message: `Request timed out after ${timeoutMs}ms`, provider })
    }

    throw new ApiError({
      message: err instanceof Error ? err.message : "Unknown network error",
      provider,
    })
  } finally {
    clearTimeout(timeout)
  }
}
