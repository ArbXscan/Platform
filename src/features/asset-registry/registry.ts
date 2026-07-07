import type { AssetRegistryEntry } from "./types"

/**
 * Single source of truth for every asset ArbXscan supports — the list
 * Scanner, Search Ranking, Asset Identity, Recommendation, and the
 * Cross-Chain Engine will eventually query through this module.
 *
 * Intentionally seeded empty. Contract addresses, decimals, and
 * verification status are security-sensitive, asset-specific facts, and
 * this module has no HTTP/SDK access (by design — see ARCHITECTURE rules)
 * and therefore no verified source for them yet. Per project policy,
 * unknown values must stay undefined and nothing may be guessed, so no
 * placeholder or example entries are seeded here. A future milestone
 * populates this list from a verified data source.
 */
export const KNOWN_ASSETS: AssetRegistryEntry[] = []
