import type { ChainRef } from "../types/token"

/**
 * Kept in sync with SUPPORTED_CHAINS in constants/landing.ts (the landing page's
 * "8+ Chains" claim). This is the app-side source of truth used by services/features;
 * landing.ts keeps its own copy since it also needs logo paths for the marketing section.
 */
export const SUPPORTED_CHAINS: ChainRef[] = [
  { id: "ethereum", name: "Ethereum" },
  { id: "solana", name: "Solana" },
  { id: "arbitrum", name: "Arbitrum" },
  { id: "base", name: "Base" },
  { id: "bnb", name: "BNB Chain" },
  { id: "polygon", name: "Polygon" },
  { id: "optimism", name: "Optimism" },
  { id: "avalanche", name: "Avalanche" },
]

export const DEFAULT_CHAIN_ID = "ethereum"

export function getChainById(id: string): ChainRef | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.id === id)
}
