import type { AssetIdentityReport } from "./types"

function assetKey(asset: AssetIdentityReport): string {
  return `${asset.chain.trim().toLowerCase()}:${asset.contractAddress.trim().toLowerCase()}`
}

/**
 * Removes duplicate assets by (chain, contractAddress), keeping the first
 * occurrence and preserving order. Pure function — never mutates the input
 * array.
 */
export function dedupeAssetIdentityReports(assets: AssetIdentityReport[]): AssetIdentityReport[] {
  const seen = new Set<string>()
  const result: AssetIdentityReport[] = []

  for (const asset of assets) {
    const key = assetKey(asset)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(asset)
  }

  return result
}

/**
 * Removes results whose underlying asset (chain + contractAddress) already
 * appeared earlier in the list, keeping the first occurrence and preserving
 * order. Intended to run after sorting, so the first occurrence of a
 * duplicate is always the highest-ranked one. Pure function — never
 * mutates the input array. Generic so it works on both unranked and
 * ranked results.
 */
export function dedupeRankedResults<T extends { asset: AssetIdentityReport }>(results: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []

  for (const item of results) {
    const key = assetKey(item.asset)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }

  return result
}
