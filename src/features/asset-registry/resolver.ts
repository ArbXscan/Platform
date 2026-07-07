import { KNOWN_ASSETS } from "./registry"
import type { AssetCategory, AssetRegistryEntry } from "./types"

/**
 * Finds a registered asset by contract address on a given chain
 * (case-insensitive on both). Returns undefined if none is registered —
 * never fabricates a match.
 */
export function findAssetByContractAddress(chain: string, contractAddress: string): AssetRegistryEntry | undefined {
  const chainKey = chain.trim().toLowerCase()
  const addressKey = contractAddress.trim().toLowerCase()
  return KNOWN_ASSETS.find(
    (asset) => asset.chain.toLowerCase() === chainKey && asset.contractAddress.toLowerCase() === addressKey,
  )
}

/**
 * Finds a registered asset by its symbol on a given chain (case-insensitive
 * on both). Returns undefined if none is registered.
 */
export function findAssetBySymbol(symbol: string, chain: string): AssetRegistryEntry | undefined {
  const symbolKey = symbol.trim().toLowerCase()
  const chainKey = chain.trim().toLowerCase()
  return KNOWN_ASSETS.find((asset) => asset.symbol.toLowerCase() === symbolKey && asset.chain.toLowerCase() === chainKey)
}

/**
 * Finds a registered asset by one of its declared aliases
 * (case-insensitive). Returns undefined if no entry declares that alias.
 */
export function findAssetByAlias(alias: string): AssetRegistryEntry | undefined {
  const key = alias.trim().toLowerCase()
  return KNOWN_ASSETS.find((asset) => asset.aliases?.some((a) => a.toLowerCase() === key))
}

/** Lists every registered asset in a given category. */
export function listAssetsByCategory(category: AssetCategory): AssetRegistryEntry[] {
  return KNOWN_ASSETS.filter((asset) => asset.category === category)
}

/** Lists every registered asset on a given chain (case-insensitive). */
export function listAssetsByChain(chain: string): AssetRegistryEntry[] {
  const chainKey = chain.trim().toLowerCase()
  return KNOWN_ASSETS.filter((asset) => asset.chain.toLowerCase() === chainKey)
}

/** Lists every registered asset whose verification status is "verified". */
export function listVerifiedAssets(): AssetRegistryEntry[] {
  return KNOWN_ASSETS.filter((asset) => asset.verificationStatus === "verified")
}
