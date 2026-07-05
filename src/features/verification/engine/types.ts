

/**
 * One side (buy or sell leg) of an opportunity, normalized into the shape a
 * router adapter needs to produce a quote. Built entirely from
 * ArbitrageOpportunity fields — the engine never talks to a market provider
 * directly, and never imports a specific router's SDK/API itself.
 */
export interface RouterQuoteRequest {
  /** Canonical router id this request targets, e.g. "jupiter", "1inch", "pancakeswap". */
  routerId: string
  chainId: string
  tokenAddress: string
  /** Which leg of the opportunity this request represents. */
  side: "buy" | "sell"
}

export type RouterQuoteStatus = "ok" | "unsupported" | "error"

/**
 * A router adapter's normalized response.
 *  - "ok": the adapter returned a quote.
 *  - "unsupported": no adapter is registered for this router, or the adapter
 *    doesn't support the requested chain.
 *  - "error": a registered, chain-supporting adapter was called but failed.
 *
 * Fields beyond `status`/`routerId`/`fetchedAt` stay undefined until a real
 * adapter supplies them — this milestone defines the contract only and never
 * fabricates a quote, gas cost, or slippage figure.
 */
export interface RouterQuoteResponse {
  routerId: string
  status: RouterQuoteStatus
  quotedPriceUsd?: number
  estimatedGasUsd?: number
  slippagePercent?: number
  routerValidated?: boolean
  message?: string
  fetchedAt: string
}

/**
 * Contract every router integration must implement to plug into the
 * VerificationEngine — Jupiter, 1inch, PancakeSwap, Paraswap, OpenOcean,
 * KyberSwap, or any future router. No adapters are implemented yet; this
 * interface is the extension point future milestones fill in without the
 * engine or any UI code needing to change.
 */
export interface RouterQuoteAdapter {
  /** Canonical id this adapter handles, matched against RouterQuoteRequest.routerId (case-insensitive). */
  readonly routerId: string
  /** Whether this adapter can serve requests for the given chain id. */
  supportsChain(chainId: string): boolean
  getQuote(request: RouterQuoteRequest): Promise<RouterQuoteResponse>
}

/** Normalized result of running the engine against one ArbitrageOpportunity. */
export interface VerificationEngineResult {
  opportunityId: string
  requestedAt: string
  buyQuote: RouterQuoteResponse
  sellQuote: RouterQuoteResponse
}