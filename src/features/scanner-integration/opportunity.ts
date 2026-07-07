import type { ScannerIntegrationReport, ScannerOpportunity } from "./types"

/**
 * Builds a normalized ScannerOpportunity from one completed report, or
 * undefined if the report didn't reach a successful cross-chain +
 * recommendation result. Every field is copied verbatim from the report's
 * existing engine outputs — nothing here is calculated, scored, or
 * re-derived.
 */
export function buildScannerOpportunity(report: ScannerIntegrationReport): ScannerOpportunity | undefined {
  const crossChain = report.crossChain.data
  const recommendation = report.recommendation.data

  if (report.crossChain.status !== "success" || !crossChain) {
    return undefined
  }

  if (report.recommendation.status !== "success" || !recommendation) {
    return undefined
  }

  return {
    assetSymbol: crossChain.assetSymbol,
    buyChainId: crossChain.buy.chainId,
    buyExchange: crossChain.buy.exchange,
    sellChainId: crossChain.sell.chainId,
    sellExchange: crossChain.sell.exchange,
    spreadPercent: crossChain.spread.spreadPercent,
    bridgeRequirementLevel: crossChain.bridgeRequirement.level,
    overallScore: recommendation.scoring.overallScore,
    starRating: recommendation.scoring.starRating,
    recommendationLevel: recommendation.recommendation.recommendationLevel,
    overallRiskLevel: recommendation.risk.overallLevel,
    overallConfidence: recommendation.recommendation.overallConfidence,
    detectedAt: crossChain.detectedAt,
  }
}

/**
 * Normalizes and aggregates multiple reports into a single opportunity
 * list, dropping any report that didn't reach a successful, recommendable
 * result. Order is preserved from the input reports; no sorting, filtering
 * by score, or ranking logic is applied here.
 */
export function aggregateScannerOpportunities(reports: ScannerIntegrationReport[]): ScannerOpportunity[] {
  const opportunities: ScannerOpportunity[] = []

  for (const report of reports) {
    const opportunity = buildScannerOpportunity(report)
    if (opportunity) {
      opportunities.push(opportunity)
    }
  }

  return opportunities
}
