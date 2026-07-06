import { classifyAssetCategory, isLPToken, isMemeAsset, isNativeAsset, isStablecoin, isWrappedAsset } from "./classification"
import { deriveDisplayFields } from "./identity"
import { calculateConfidence, resolveDecimals, resolveLogoUrl } from "./metadata"
import type { AssetIdentity, RawAssetMetadataInput } from "./types"
import { determineVerification } from "./verification"

/**
 * Resolves a full AssetIdentity from raw, caller-supplied token metadata.
 *
 * Pure function: reads only from `input`, never mutates it, and always
 * returns a freshly-built object — every field is either copied from the
 * input, derived via a documented pattern match, or left undefined, never
 * invented. No network request, blockchain call, adapter, scanner, or
 * recommendation logic is involved; this is a self-contained domain engine
 * that higher layers can call with metadata gathered however they choose.
 */
export function resolveAssetIdentity(input: RawAssetMetadataInput): AssetIdentity {
  const category = classifyAssetCategory(input)
  const { displayName, displaySymbol } = deriveDisplayFields(input)

  return {
    displayName,
    displaySymbol,
    contractAddress: input.contractAddress,
    chain: input.chain,
    assetCategory: category,
    isNativeAsset: isNativeAsset(input),
    isWrappedAsset: isWrappedAsset(input),
    isStablecoin: isStablecoin(input),
    isLP: isLPToken(input),
    isMeme: isMemeAsset(input),
    isVerified: determineVerification(input),
    decimals: resolveDecimals(input),
    logoUrl: resolveLogoUrl(input),
    confidence: calculateConfidence(input, category),
  }
}
