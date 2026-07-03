import type { DataSourceMeta } from "./api"

/**
 * Result of re-checking one already-produced ArbitrageOpportunity against
 * fresh provider data:
 *  - "actionable": both legs re-quoted successfully and the spread is still positive.
 *  - "stale": both legs re-quoted successfully but the spread has closed or reversed.
 *  - "invalid": re-quote succeeded but one or both legs (dex/pool) can no longer be found.
 *  - "unverifiable": the re-quote request itself failed (network/provider error).
 */
export type VerificationOutcome = "actionable" | "stale" | "invalid" | "unverifiable"

/** A single leg (buy or sell side), as re-quoted at verification time. */
export interface QuoteLegVerification {
  exchange: string
  priceUsd: number
  liquidityUsd: number
}

/**
 * Result of verifying one ArbitrageOpportunity. Named around "Opportunity" rather
 * than "Quote" because this model is expected to grow beyond quote re-checking —
 * gas estimation, slippage estimation, router validation, bridge validation, and
 * net profit calculation will all attach here as additional fields in later
 * milestones, rather than as separate result types.
 */
export interface OpportunityVerification {
  opportunityId: string
  outcome: VerificationOutcome
  /** ISO 8601 timestamp of when this verification ran (e.g. for "Verified 5 seconds ago"). */
  verifiedAt: string

  /** undefined if this leg could no longer be found on re-quote. */
  buyLeg?: QuoteLegVerification
  /** undefined if this leg could no longer be found on re-quote. */
  sellLeg?: QuoteLegVerification

  /** The spread the original opportunity was detected with, carried over for comparison. */
  originalSpreadPercent: number
  /** undefined if either leg could not be re-quoted. */
  currentSpreadPercent?: number

  /** Human-readable reason for the outcome, mainly used for "invalid"/"unverifiable". */
  message?: string

  source: DataSourceMeta

  // --- Future verification dimensions (this milestone: quote re-check only) ---
  // Each stays undefined until its provider is wired up, per the "no fake data"
  // rule already used for ArbitrageOpportunity.estimatedGasUsd.

  /** undefined = not available yet; needs a gas-oracle/RPC provider. */
  gasUsd?: number
  /** undefined = not available yet; needs order-book/liquidity-depth simulation. */
  slippagePercent?: number
  /** undefined = not available yet; needs router/quote-simulation validation. */
  routerValidated?: boolean
  /** undefined = not available yet; needs a bridge-cost/route provider. */
  bridgeValidated?: boolean
  /** undefined = not available yet; depends on gasUsd and slippagePercent. */
  estimatedNetProfitUsd?: number
}
