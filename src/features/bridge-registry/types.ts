export type BridgeStatus = "active" | "inactive"

/**
 * A cross-chain bridge ArbXscan recognizes by identity — supported chains
 * and reference/deep links. Like the DEX Registry, this is about identity
 * and reference data only; it never stores live liquidity, fees, or
 * transfer-time data. Those would come from a bridge-quote provider, which
 * isn't wired up yet.
 *
 * URL templates use literal placeholder tokens — "{sourceChainId}",
 * "{destinationChainId}", and "{tokenAddress}" — that urls.ts substitutes.
 */
export interface BridgeInfo {
  /** Canonical id, lowercase, e.g. "stargate". */
  id: string
  displayName: string
  /** Maps to constants/chains.ts-style chain ids. */
  sourceChainIds: string[]
  /** Maps to constants/chains.ts-style chain ids. */
  destinationChainIds: string[]
  websiteUrl: string
  /** undefined until the official bridge-link query-parameter format has been confirmed against that bridge's own docs — never guessed. */
  bridgeUrlTemplate?: string
  /** undefined — no confirmed per-transfer explorer link pattern yet for this bridge. */
  explorerUrlTemplate?: string
  status: BridgeStatus
}
