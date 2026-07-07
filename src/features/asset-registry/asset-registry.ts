import { findAssetByAlias, findAssetByContractAddress, findAssetBySymbol } from "./resolver"
import type { AssetRegistryEntry } from "./types"

/**
 * Criteria for resolving one asset from partial, caller-supplied fields.
 * All fields optional — resolveAsset tries them in order of specificity.
 */
export interface AssetResolutionQuery {
  chain?: string
  contractAddress?: string
  symbol?: string
  alias?: string
}

/**
 * Resolves a single registered asset from partial, caller-supplied
 * criteria. Tries contract address + chain first (most specific), then
 * symbol + chain, then alias. Returns undefined if nothing registered
 * matches any supplied criterion — never guesses or falls back to a
 * "closest" entry.
 */
export function resolveAsset(query: AssetResolutionQuery): AssetRegistryEntry | undefined {
  if (query.chain && query.contractAddress) {
    const byAddress = findAssetByContractAddress(query.chain, query.contractAddress)
    if (byAddress) return byAddress
  }

  if (query.symbol && query.chain) {
    const bySymbol = findAssetBySymbol(query.symbol, query.chain)
    if (bySymbol) return bySymbol
  }

  if (query.alias) {
    const byAlias = findAssetByAlias(query.alias)
    if (byAlias) return byAlias
  }

  return undefined
}

export {
  findAssetByAlias,
  findAssetByContractAddress,
  findAssetBySymbol,
  listAssetsByCategory,
  listAssetsByChain,
  listVerifiedAssets,
} from "./resolver"
