import { matchesFamily } from "./validator"
import type { ChainDetectionCandidate, ChainDetectionResult, ChainFamily } from "./types"

/** The 10 chains this scanner supports, mapped to their address-format family. */
const SUPPORTED_CHAIN_FAMILIES: { chainId: string; chainFamily: ChainFamily }[] = [
  { chainId: "ethereum", chainFamily: "evm" },
  { chainId: "bnb", chainFamily: "evm" },
  { chainId: "polygon", chainFamily: "evm" },
  { chainId: "arbitrum", chainFamily: "evm" },
  { chainId: "optimism", chainFamily: "evm" },
  { chainId: "base", chainFamily: "evm" },
  { chainId: "avalanche", chainFamily: "evm" },
  { chainId: "solana", chainFamily: "solana" },
  { chainId: "sui", chainFamily: "sui" },
  { chainId: "aptos", chainFamily: "aptos" },
]

/**
 * Detects which of the 10 supported chains a normalized address's format
 * could belong to. All 7 EVM chains share an identical address format, so an
 * EVM-shaped address matches all of them at once — this is reported as
 * ambiguous rather than guessing a single chain, since the string alone
 * cannot say which EVM chain the contract is actually deployed on.
 */
export function detectChains(normalized: string): ChainDetectionResult {
  const matches = SUPPORTED_CHAIN_FAMILIES.filter(({ chainFamily }) => matchesFamily(normalized, chainFamily))

  const isAmbiguous = matches.length > 1
  const candidates: ChainDetectionCandidate[] = matches.map(({ chainId, chainFamily }) => ({
    chainId,
    chainFamily,
    confidence: isAmbiguous ? "ambiguous" : "certain",
  }))

  return { candidates, isAmbiguous }
}
