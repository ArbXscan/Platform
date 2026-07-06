import { runIdentityStage } from "./identity-stage"
import { runRecommendationStage } from "./recommendation-stage"
import { runScanStage } from "./scan-stage"
import { runSearchStage } from "./search-stage"
import type { ScannerIntegrationReport, ScannerIntegrationRequest } from "./types"

/**
 * The single public entry point of the Scanner Integration Layer.
 *
 * Orchestrates, in order: Search Ranking, Asset Identity, Token Scanner, and
 * Recommendation Integration (which itself already covers the Cross-Chain
 * Engine and the full five-engine Recommendation Pipeline internally). Every
 * stage calls exactly one existing engine and passes its result through
 * unchanged. This function calculates nothing itself — no risk, spread,
 * score, confidence, or recommendation logic lives here, only sequencing
 * and short-circuiting.
 *
 * Short-circuit behavior:
 *  - no search result → stop (every later stage reports "skipped")
 *  - invalid token → stop (crossChain/recommendation report "skipped")
 *  - no cross-chain opportunity → stop, but every prior successful stage's
 *    data is still returned (recommendation reports "skipped")
 *  - recommendation unavailable → same: prior successful stages are returned
 */
export async function runScannerIntegration(request: ScannerIntegrationRequest): Promise<ScannerIntegrationReport> {
  const searchResult = runSearchStage(request.query, request.availableAssets)

  if (searchResult.status !== "success" || !searchResult.data) {
    return {
      searchResult,
      assetIdentity: { status: "skipped" },
      tokenScan: { status: "skipped" },
      crossChain: { status: "skipped" },
      recommendation: { status: "skipped" },
      reason: "No search result matched the query.",
    }
  }

  const assetIdentity = runIdentityStage(searchResult.data)

  if (assetIdentity.status !== "success" || !assetIdentity.data) {
    return {
      searchResult,
      assetIdentity,
      tokenScan: { status: "skipped" },
      crossChain: { status: "skipped" },
      recommendation: { status: "skipped" },
      reason: "Asset identity could not be resolved for the search result.",
    }
  }

  const tokenScan = runScanStage(assetIdentity.data.contractAddress)

  if (tokenScan.status !== "success" || !tokenScan.data) {
    return {
      searchResult,
      assetIdentity,
      tokenScan,
      crossChain: { status: "skipped" },
      recommendation: { status: "skipped" },
      reason: tokenScan.data?.validation.reason ?? "Token address failed validation.",
    }
  }

  const normalizedAddress = tokenScan.data.tokenized.normalized
  const { crossChain, recommendation } = await runRecommendationStage(
    normalizedAddress,
    request.snapshots,
    request.tradeAmountUsd,
  )

  if (crossChain.status !== "success") {
    return {
      searchResult,
      assetIdentity,
      tokenScan,
      crossChain,
      recommendation: { status: "skipped" },
      reason: "No cross-chain opportunity was found for this asset among the supplied snapshots.",
    }
  }

  if (recommendation.status !== "success") {
    return {
      searchResult,
      assetIdentity,
      tokenScan,
      crossChain,
      recommendation,
      reason: "A cross-chain opportunity was found but a recommendation could not be generated.",
    }
  }

  return {
    searchResult,
    assetIdentity,
    tokenScan,
    crossChain,
    recommendation,
    reason: "Scanner integration completed successfully.",
  }
}
