import type { AssetCategory, IdentityConfidence, RawAssetMetadataInput } from "./types"

/** Passes decimals through untouched — never defaulted (e.g. to 18) when missing. */
export function resolveDecimals(input: RawAssetMetadataInput): number | undefined {
  return input.decimals
}

/** Passes the logo URL through untouched — never guessed from a symbol or address. */
export function resolveLogoUrl(input: RawAssetMetadataInput): string | undefined {
  return input.logoUrl
}

/**
 * Scores overall identity confidence from how much optional metadata is
 * present, combined with whether classification found any real signal.
 * A category resolved from a pattern match, backed by rich metadata, reads
 * "high"; an unresolved category with no supporting metadata at all reads
 * "unknown" — this never lands on a default value in between without basis.
 */
export function calculateConfidence(input: RawAssetMetadataInput, category: AssetCategory): IdentityConfidence {
  const presentCount = [input.name, input.decimals, input.logoUrl, input.verified].filter(
    (value) => value !== undefined,
  ).length

  if (category === "Unknown") {
    return presentCount === 0 ? "unknown" : "low"
  }

  if (presentCount >= 4) return "high"
  if (presentCount >= 2) return "medium"
  return "low"
}
