import type { BridgeInfo } from "./types"

/**
 * Seed list of well-known bridges ArbXscan recognizes. Chain lists reflect
 * each bridge's real, publicly documented coverage as best determined —
 * Circle CCTP's list was cross-checked against Circle's own supported-chains
 * documentation (notably: no BNB Chain support). Where a bridge's exact
 * coverage of a given chain couldn't be confirmed, that chain is left out
 * rather than assumed. No bridgeUrlTemplate/explorerUrlTemplate is set for
 * any entry yet — none of their deep-link query formats have been confirmed
 * against official docs, so none are guessed.
 */
export const KNOWN_BRIDGES: BridgeInfo[] = [
  {
    id: "stargate",
    displayName: "Stargate",
    sourceChainIds: ["ethereum", "arbitrum", "optimism", "base", "bnb", "polygon", "avalanche", "solana"],
    destinationChainIds: ["ethereum", "arbitrum", "optimism", "base", "bnb", "polygon", "avalanche", "solana"],
    websiteUrl: "https://stargate.finance",
    status: "active",
  },
  {
    id: "debridge",
    displayName: "deBridge",
    sourceChainIds: ["ethereum", "arbitrum", "optimism", "base", "bnb", "polygon", "avalanche", "solana"],
    destinationChainIds: ["ethereum", "arbitrum", "optimism", "base", "bnb", "polygon", "avalanche", "solana"],
    websiteUrl: "https://debridge.finance",
    status: "active",
  },
  {
    id: "wormhole",
    displayName: "Wormhole",
    sourceChainIds: ["ethereum", "arbitrum", "optimism", "base", "bnb", "polygon", "avalanche", "solana"],
    destinationChainIds: ["ethereum", "arbitrum", "optimism", "base", "bnb", "polygon", "avalanche", "solana"],
    websiteUrl: "https://wormhole.com",
    status: "active",
  },
  {
    id: "cctp",
    displayName: "Circle CCTP",
    // No BNB Chain support confirmed anywhere in Circle's own documentation as of this registry's seeding.
    sourceChainIds: ["ethereum", "arbitrum", "optimism", "base", "avalanche", "polygon", "solana"],
    destinationChainIds: ["ethereum", "arbitrum", "optimism", "base", "avalanche", "polygon", "solana"],
    websiteUrl: "https://www.circle.com/cross-chain-transfer-protocol",
    status: "active",
  },
  {
    id: "across",
    displayName: "Across",
    // Across is an Ethereum-L1/L2-focused bridge; no BNB Chain, Avalanche, or Solana support confirmed.
    sourceChainIds: ["ethereum", "arbitrum", "optimism", "base", "polygon"],
    destinationChainIds: ["ethereum", "arbitrum", "optimism", "base", "polygon"],
    websiteUrl: "https://across.to",
    status: "active",
  },
  {
    id: "layerzero",
    displayName: "LayerZero",
    sourceChainIds: ["ethereum", "arbitrum", "optimism", "base", "bnb", "polygon", "avalanche", "solana"],
    destinationChainIds: ["ethereum", "arbitrum", "optimism", "base", "bnb", "polygon", "avalanche", "solana"],
    websiteUrl: "https://layerzero.network",
    status: "active",
  },
]
