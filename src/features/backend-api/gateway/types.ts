/**
 * External data-provider categories the Backend API Gateway can route
 * requests to. "market-data" is intentionally separate from the app's
 * existing DexScreener/GeckoTerminal clients (services/providers/) — those
 * are untouched, already-live integrations; this category exists so a
 * future milestone can decide whether/how to route through the gateway
 * instead, without this module duplicating their logic today.
 */
export type ProviderCategory = "market-data" | "token-metadata" | "chain-rpc" | "onchain-index"

export type ProviderRequestStatus = "ok" | "unsupported" | "error"

/**
 * Generic request shape for asking a registered provider for data. Built
 * entirely from caller-supplied fields — the gateway never talks to a
 * provider directly and never imports a specific provider's SDK/API itself.
 */
export interface ProviderDataRequest {
  /** Canonical provider id this request targets, e.g. "coinmarketcap", "moralis" (case-insensitive). */
  providerId: string
  category: ProviderCategory
  chainId: string
  /** Contract address, symbol, or other identifier the provider would look up. Meaning depends on category. */
  identifier: string
}

/**
 * A provider adapter's normalized response.
 *  - "ok": the adapter returned data.
 *  - "unsupported": no adapter is registered for this provider, the adapter
 *    is registered under a different category, or it doesn't support the
 *    requested chain.
 *  - "error": a registered, chain-supporting adapter was called but failed.
 *
 * `data` stays undefined until a real adapter supplies it — this milestone
 * defines the contract only and never fabricates a price, address, or
 * metadata value.
 */
export interface ProviderDataResponse {
  providerId: string
  status: ProviderRequestStatus
  data?: Record<string, unknown>
  message?: string
  fetchedAt: string
}

/**
 * Contract every external data-provider integration must implement to plug
 * into the Backend API Gateway — CoinMarketCap, Moralis, Alchemy, The
 * Graph, or any future provider. No adapters are wired to real calls yet;
 * this interface is the extension point future milestones fill in without
 * the gateway, any engine, or any UI code needing to change.
 */
export interface DataProviderAdapter {
  readonly providerId: string
  readonly category: ProviderCategory
  /** Whether this adapter can serve requests for the given chain id. */
  supportsChain(chainId: string): boolean
  getData(request: ProviderDataRequest): Promise<ProviderDataResponse>
}

/**
 * Non-secret identification of where a provider's credential would live —
 * only the name of the environment variable/secret reference a future real
 * integration would read from, never an actual key value. This module never
 * stores, transports, or hardcodes a real API key.
 */
export interface ProviderCredentialRef {
  providerId: string
  envVarName: string
}
