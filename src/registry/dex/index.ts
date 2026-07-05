import { KNOWN_DEXES } from "./data"
import type { DexInfo } from "./types"

export type { DexInfo, DexStatus } from "./types"
export { KNOWN_DEXES } from "./data"

/** Built once at module load: canonical id (lowercase) -> its DEX entry. */
const LOOKUP_INDEX: Map<string, DexInfo> = new Map()
for (const dex of KNOWN_DEXES) {
  LOOKUP_INDEX.set(dex.id.toLowerCase(), dex)
}

/**
 * Looks up a known DEX by its canonical id (case-insensitive). Returns
 * undefined if the id isn't in the registry yet — that's expected for DEXs
 * a provider surfaces that ArbXscan hasn't catalogued, not an error.
 */
export function findDex(id: string): DexInfo | undefined {
  return LOOKUP_INDEX.get(id.trim().toLowerCase())
}