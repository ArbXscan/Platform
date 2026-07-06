import type { AssetIdentityReport, MatchType, SearchQuery } from "./types"

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Classifies how (if at all) an asset matches a search query. Case-
 * insensitive throughout. Checks exact match first (symbol takes priority
 * over name when both are exact for the purposes of this single label),
 * then prefix, then contains. "none" means the term doesn't appear in
 * either field at all — never guessed as a weaker match.
 */
export function classifyMatch(asset: AssetIdentityReport, query: SearchQuery): MatchType {
  const term = normalize(query.term)
  if (term.length === 0) return "none"

  const symbol = normalize(asset.displaySymbol)
  const name = asset.displayName !== undefined ? normalize(asset.displayName) : undefined

  if (symbol === term) return "exact-symbol"
  if (name === term) return "exact-name"
  if (symbol.startsWith(term) || (name !== undefined && name.startsWith(term))) return "prefix"
  if (symbol.includes(term) || (name !== undefined && name.includes(term))) return "contains"
  return "none"
}

/** True only when the asset's symbol is an exact, case-insensitive match for the query term. */
export function hasExactSymbolMatch(asset: AssetIdentityReport, query: SearchQuery): boolean {
  const term = normalize(query.term)
  return term.length > 0 && normalize(asset.displaySymbol) === term
}

/** True only when the asset's name is an exact, case-insensitive match for the query term. */
export function hasExactNameMatch(asset: AssetIdentityReport, query: SearchQuery): boolean {
  const term = normalize(query.term)
  return term.length > 0 && asset.displayName !== undefined && normalize(asset.displayName) === term
}
