import { resolveAssetIdentity } from "../asset-identity"
import type { AssetIdentity, RankedAssetResult, StageResult } from "./types"

/**
 * Stage 2: Asset Identity, executed as-is. Re-resolves the canonical
 * AssetIdentity for the winning search match, using only fields the search
 * result already carries — no new metadata is invented here, and no
 * classification/confidence logic is duplicated; it's all inside the
 * existing resolveAssetIdentity engine.
 */
export function runIdentityStage(searchMatch: RankedAssetResult): StageResult<AssetIdentity> {
  const asset = searchMatch.asset

  const identity = resolveAssetIdentity({
    contractAddress: asset.contractAddress,
    chain: asset.chain,
    symbol: asset.displaySymbol,
    name: asset.displayName,
    verified: asset.isVerified,
  })

  return { status: "success", data: identity }
}
