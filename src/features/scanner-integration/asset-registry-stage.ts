import { resolveAsset } from "../asset-registry"
import type { AssetRegistryEntry, StageResult } from "./types"

/**
 * Optional Asset Registry stage: looks up the single source-of-truth
 * registry entry (features/asset-registry) for the resolved asset, by
 * chain and contract address, if one is registered. Supplementary only —
 * this never substitutes for or overrides Asset Identity's own
 * resolution; it only surfaces registry data alongside it when available.
 * No new classification or verification logic is duplicated here — the
 * lookup itself lives entirely inside resolveAsset.
 */
export function runAssetRegistryStage(chain: string, contractAddress: string): StageResult<AssetRegistryEntry> {
  const entry = resolveAsset({ chain, contractAddress })

  if (!entry) {
    return { status: "failed" }
  }

  return { status: "success", data: entry }
}
