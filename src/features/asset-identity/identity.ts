import type { AssetIdentity, RawAssetMetadataInput } from "./types"

/**
 * Derives display-ready name/symbol fields from raw input. Pure function:
 * reads only from `input`, never mutates it. Never invents a display name —
 * if `name` wasn't supplied (or is blank), displayName stays undefined
 * rather than falling back to the symbol or the contract address.
 */
export function deriveDisplayFields(
  input: RawAssetMetadataInput,
): Pick<AssetIdentity, "displayName" | "displaySymbol"> {
  const trimmedName = input.name?.trim()

  return {
    displayName: trimmedName ? trimmedName : undefined,
    displaySymbol: input.symbol.trim(),
  }
}
