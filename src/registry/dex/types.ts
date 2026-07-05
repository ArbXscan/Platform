export type DexStatus = "active" | "inactive"

/**
 * A decentralized exchange ArbXscan recognizes by identity — name, supported
 * chains, and reference/deep links. Like the Asset Registry, this is about
 * identity and reference data only; it never stores live price, liquidity,
 * or volume. Those stay the responsibility of market providers (DexScreener,
 * GeckoTerminal) and are read fresh at request time elsewhere in the app.
 *
 * URL templates use literal placeholder tokens — "{tokenAddress}" and
 * "{chainId}" — that a future feature (Open Buy DEX, Open Sell DEX, Open Pool,
 * Open Router) will substitute. Building that substitution logic is out of
 * scope for this milestone; this registry only stores the templates.
 */
export interface DexInfo {
  /** Canonical id, lowercase, e.g. "uniswap". Intended to match the dexId a market provider reports for this exchange. */
  id: string
  name: string
  /** Maps to constants/chains.ts ids. A DEX can span multiple chains (e.g. Uniswap on ethereum, arbitrum, base). */
  chainIds: string[]
  websiteUrl: string
  /** undefined until the official swap-link query-parameter format has been confirmed against that DEX's own docs — never guessed. */
  swapUrlTemplate?: string
  /** undefined — no confirmed per-pool explorer link pattern yet for this DEX. */
  explorerUrlTemplate?: string
  logoUrl?: string
  status: DexStatus
}