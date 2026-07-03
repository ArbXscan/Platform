import { RECOGNIZED_ASSETS } from "./data"
import type { RecognizedAsset } from "./types"

export type { RecognizedAsset, AssetCategory, AssetFeature } from "./types"
export { RECOGNIZED_ASSETS } from "./data"

/** Built once at module load: every symbol/name/alias (lowercased) -> its asset. */
const LOOKUP_INDEX: Map<string, RecognizedAsset> = new Map()
for (const asset of RECOGNIZED_ASSETS) {
  LOOKUP_INDEX.set(asset.symbol.toLowerCase(), asset)
  LOOKUP_INDEX.set(asset.name.toLowerCase(), asset)
  for (const alias of asset.aliases ?? []) {
    LOOKUP_INDEX.set(alias.toLowerCase(), asset)
  }
}

/**
 * Looks up a recognized asset by exact symbol, name, or alias match
 * (case-insensitive). Returns undefined if the term isn't a globally
 * recognized asset — that's expected for most search queries, not an error.
 */
export function findRecognizedAsset(term: string): RecognizedAsset | undefined {
  return LOOKUP_INDEX.get(term.trim().toLowerCase())
}
