import { findRecognizedAsset } from "../../registry/assets"
import type { RecognizedAsset } from "../../registry/assets"
import type { DexScreenerPair } from "../../services/providers/dexscreener"
import type { AssetCategory, AssetIdentityReport } from "../search-ranking"

function findRecognizedAssetForPair(pair: DexScreenerPair): RecognizedAsset | undefined {
  return findRecognizedAsset(pair.baseToken.symbol) ?? findRecognizedAsset(pair.baseToken.name)
}

/**
 * Maps a recognized asset's Official Asset Registry category, combined with
 * the native/wrapped/stablecoin signals already derived from it, onto the
 * Search Ranking Engine's AssetCategory. Categories with no corresponding
 * signal in either source (Liquid Staking, LP Token, Meme, Governance) are
 * never guessed — they stay "Unknown" rather than being fabricated.
 */
function mapAssetCategory(
  recognized: RecognizedAsset | undefined,
  isNativeAsset: boolean,
  isWrappedAsset: boolean,
  isStablecoin: boolean,
): AssetCategory {
  if (isStablecoin) return "Stablecoin"
  if (isWrappedAsset) return "Wrapped Asset"
  if (isNativeAsset) return "Native Coin"
  if (recognized?.category === "oracle") return "Utility"
  return "Unknown"
}

/**
 * Converts one DexScreener pair into an AssetIdentityReport the Search
 * Ranking Engine (features/search-ranking) can rank. Every field is
 * derived from data DexScreener or the Official Asset Registry
 * (src/registry/assets) already provides — nothing is fetched, guessed, or
 * hardcoded per token:
 *
 *  - isVerified / confidence come from whether the Official Asset Registry
 *    recognizes this token's symbol or name at all (same lookup
 *    search.service.ts already used for its isRecognized flag — reused
 *    here, not reimplemented).
 *  - isNativeAsset is true only when the recognized asset's own
 *    nativeChainId matches the chain this pair actually trades on.
 *  - isWrappedAsset is true when the token is recognized but trades on a
 *    chain other than its recognized native chain — i.e. a bridged/wrapped
 *    representation of a known asset.
 *  - isLP and isMeme have no corresponding signal in either source, so they
 *    are always false rather than guessed.
 */
export function toAssetIdentityReport(pair: DexScreenerPair): AssetIdentityReport {
  const chain = pair.chainId
  const recognized = findRecognizedAssetForPair(pair)

  const isNativeAsset = recognized?.nativeChainId !== undefined && recognized.nativeChainId === chain
  const isWrappedAsset =
    recognized !== undefined && recognized.nativeChainId !== undefined && recognized.nativeChainId !== chain
  const isStablecoin = recognized?.category === "stablecoin"

  return {
    contractAddress: pair.baseToken.address,
    chain,
    displaySymbol: pair.baseToken.symbol,
    displayName: pair.baseToken.name,
    assetCategory: mapAssetCategory(recognized, isNativeAsset, isWrappedAsset, isStablecoin),
    isNativeAsset,
    isWrappedAsset,
    isStablecoin,
    isLP: false,
    isMeme: false,
    isVerified: recognized !== undefined ? true : undefined,
    confidence: recognized !== undefined ? "high" : "unknown",
  }
}
