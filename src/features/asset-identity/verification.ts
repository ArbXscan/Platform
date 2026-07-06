import type { RawAssetMetadataInput } from "./types"

/**
 * Resolves verification status. Pure passthrough — verification is never
 * inferred, computed, or fabricated here. If the caller didn't supply
 * `verified`, the result is undefined ("cannot be determined"), never
 * defaulted to true or false.
 */
export function determineVerification(input: RawAssetMetadataInput): boolean | undefined {
  return input.verified
}
