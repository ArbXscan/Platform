/**
 * Shared API-layer types.
 * Every data point shown in the UI carries a DataSourceMeta so the interface
 * can always display where a number came from and how much to trust it
 * (see docs/PRD/09-API_PROVIDER_SECURITY.md).
 */

/** How much a data point can be trusted, based on cross-provider validation. */
export type ConfidenceLevel = "high" | "medium" | "low" | "unknown"

/** Provenance attached to every displayed value. */
export interface DataSourceMeta {
  /** e.g. "dexscreener", "geckoterminal", "jupiter" */
  provider: string
  /** ISO 8601 timestamp of when this value was fetched */
  fetchedAt: string
  confidence: ConfidenceLevel
}

/** Generic wrapper: pairs real data with where it came from. */
export interface ApiResult<T> {
  data: T
  source: DataSourceMeta
}

/** Normalized error shape thrown by anything in services/. UI never sees raw fetch/provider errors. */
export interface ApiErrorShape {
  message: string
  provider?: string
  status?: number
}

/** Standard async lifecycle used by hooks and store slices. */
export type AsyncStatus = "idle" | "loading" | "success" | "error"
