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
 *
 * Error messages are split by failure stage on purpose (network vs HTTP status
 * vs response parsing) — a bare "Failed to fetch" gives no actionable signal,
 * and previously that's exactly what surfaced all the way to the UI.
 */
export async function apiGet<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { provider, timeoutMs = API_TIMEOUT_MS, ...init } = options
  const providerLabel = provider ?? "API"

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    clearTimeout(timeout)

    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError({ message: `${providerLabel} request timed out after ${timeoutMs}ms`, provider })
    }

    // fetch() rejected before any HTTP response was received at all — this is
    // always a network-level failure (DNS, connection refused, offline, or a
    // CORS restriction blocking the request). It is never an HTTP error status;
    // those resolve to a Response and are handled below via response.ok.
    throw new ApiError({
      message:
        `Network error while contacting ${providerLabel}: ` +
        `${err instanceof Error ? err.message : "unknown error"}. ` +
        `This usually means a connectivity issue or a CORS restriction blocking the ` +
        `request from the browser — check the browser DevTools Network/Console tab ` +
        `for a CORS error to confirm.`,
      provider,
    })
  }
  clearTimeout(timeout)

  if (!response.ok) {
    throw new ApiError({
      message: `${providerLabel} request failed with status ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`,
      provider,
      status: response.status,
    })
  }

  try {
    return (await response.json()) as T
  } catch (err) {
    throw new ApiError({
      message: `Invalid response from ${providerLabel}: could not parse JSON (${err instanceof Error ? err.message : "unknown parse error"})`,
      provider,
    })
  }
}
