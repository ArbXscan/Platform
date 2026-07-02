/**
 * Seed list of DEXs ArbXscan aggregates. Not exhaustive — DexScreener/GeckoTerminal
 * cover far more than this under the hood. Extend as Step 3 (Arbitrage Scanner)
 * wires up real provider responses and we see which exchanges actually surface.
 */
export interface DexInfo {
  id: string
  name: string
  chainId: string
}

export const KNOWN_DEXES: DexInfo[] = [
  { id: "uniswap-v3", name: "Uniswap V3", chainId: "ethereum" },
  { id: "uniswap-v3-arbitrum", name: "Uniswap V3", chainId: "arbitrum" },
  { id: "uniswap-v3-base", name: "Uniswap V3", chainId: "base" },
  { id: "pancakeswap-v3", name: "PancakeSwap V3", chainId: "bnb" },
  { id: "quickswap", name: "QuickSwap", chainId: "polygon" },
  { id: "velodrome", name: "Velodrome", chainId: "optimism" },
  { id: "trader-joe", name: "Trader Joe", chainId: "avalanche" },
  { id: "jupiter", name: "Jupiter", chainId: "solana" },
  { id: "raydium", name: "Raydium", chainId: "solana" },
]

export function getDexesByChain(chainId: string): DexInfo[] {
  return KNOWN_DEXES.filter((dex) => dex.chainId === chainId)
}
