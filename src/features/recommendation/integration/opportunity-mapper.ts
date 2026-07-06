import type { DataSourceMeta } from "../../../types/api"
import type {
  ArbitrageOpportunity,
  NormalizedMarketSnapshot,
  NormalizedQuoteInput,
  RecommendationPipelineInput,
} from "../pipeline"
import type { CrossChainOpportunityReport } from "./types"

/**
 * Builds a DataSourceMeta from what the Cross-Chain Engine actually knows:
 * which exchange the price came from, and when the report was generated.
 * Confidence is always "unknown" here — this layer has no cross-provider
 * validation to base a higher confidence on, and never guesses one.
 */
function buildSourceMeta(exchange: string, fetchedAt: string): DataSourceMeta {
  return { provider: exchange, fetchedAt, confidence: "unknown" }
}

/**
 * Maps a CrossChainOpportunityReport onto ArbitrageOpportunity so it can be
 * handed to the Verification Engine. This is a structural adaptation only:
 * every field that both shapes share is carried over verbatim
 * (buy/sell price, liquidity, chain, exchange, spread), and every field
 * ArbitrageOpportunity needs but the cross-chain report has no basis for
 * (confidence, gas/bridge/net-profit estimates) is left at its honest
 * default ("unknown" / undefined) rather than guessed.
 *
 * Token.name and Token.decimals are required by the shared Token type but
 * are not knowable from a NormalizedTokenSnapshot (which only carries a
 * symbol, not a display name or decimal count) — no provider call is made
 * here to fetch them. They're filled with clearly-flagged placeholders
 * (symbol reused as name, decimals 0) since no pipeline stage that consumes
 * ArbitrageOpportunity reads token.name or token.decimals; a caller
 * displaying those two fields directly should not treat them as real data.
 */
function mapToArbitrageOpportunity(report: CrossChainOpportunityReport, normalizedAddress: string): ArbitrageOpportunity {
  return {
    id: `cross-chain:${report.assetSymbol}:${report.buy.chainId}:${report.sell.chainId}`,
    token: {
      address: normalizedAddress,
      chainId: report.buy.chainId,
      symbol: report.assetSymbol,
      name: report.assetSymbol,
      decimals: 0,
    },
    buyFrom: {
      exchange: report.buy.exchange,
      chainId: report.buy.chainId,
      priceUsd: report.buy.priceUsd,
      liquidityUsd: report.buy.liquidityUsd,
      source: buildSourceMeta(report.buy.exchange, report.detectedAt),
    },
    sellTo: {
      exchange: report.sell.exchange,
      chainId: report.sell.chainId,
      priceUsd: report.sell.priceUsd,
      liquidityUsd: report.sell.liquidityUsd,
      source: buildSourceMeta(report.sell.exchange, report.detectedAt),
    },
    // Only reachable when the caller already confirmed spreadPercent is defined (see integration.ts).
    priceDiffPercent: report.spread.spreadPercent as number,
    confidence: "unknown",
    detectedAt: report.detectedAt,
  }
}

/** Maps a CrossChainOpportunityReport onto the Quote Comparator's normalized input shape. */
function mapToNormalizedQuoteInput(
  report: CrossChainOpportunityReport,
  normalizedAddress: string,
  tradeAmountUsd: number | undefined,
): NormalizedQuoteInput {
  return {
    tokenAddress: normalizedAddress,
    buy: {
      exchange: report.buy.exchange,
      chainId: report.buy.chainId,
      priceUsd: report.buy.priceUsd,
      liquidityUsd: report.buy.liquidityUsd,
    },
    sell: {
      exchange: report.sell.exchange,
      chainId: report.sell.chainId,
      priceUsd: report.sell.priceUsd,
      liquidityUsd: report.sell.liquidityUsd,
    },
    tradeAmountUsd,
  }
}

/**
 * Maps a CrossChainOpportunityReport onto the Risk Engine's normalized input
 * shape. bridgeHopCount is derived from the Cross-Chain Engine's own
 * bridgeRequirement — "required" becomes 1 (the minimum a required bridge
 * implies, not a guessed route), "none" becomes 0, and "unknown" is carried
 * over as undefined rather than assumed to be either.
 */
function mapToNormalizedMarketSnapshot(
  report: CrossChainOpportunityReport,
  normalizedAddress: string,
): NormalizedMarketSnapshot {
  const bridgeHopCount =
    report.bridgeRequirement.level === "required" ? 1 : report.bridgeRequirement.level === "none" ? 0 : undefined

  return {
    tokenAddress: normalizedAddress,
    // NormalizedMarketSnapshot assumes one chain per snapshot; the buy leg's
    // chain is used here as the reference point since cross-chain opportunities
    // originate from it.
    chainId: report.buy.chainId,
    buy: {
      exchange: report.buy.exchange,
      chainId: report.buy.chainId,
      priceUsd: report.buy.priceUsd,
      liquidityUsd: report.buy.liquidityUsd,
    },
    sell: {
      exchange: report.sell.exchange,
      chainId: report.sell.chainId,
      priceUsd: report.sell.priceUsd,
      liquidityUsd: report.sell.liquidityUsd,
    },
    bridgeHopCount,
  }
}

/**
 * Combines the three mappers above into one RecommendationPipelineInput.
 * Returns undefined if the report doesn't actually represent a usable
 * opportunity (opportunityExists is false, or spreadPercent is missing) —
 * this never forces an incomplete report into the pipeline.
 */
export function mapCrossChainOpportunityToPipelineInput(
  report: CrossChainOpportunityReport,
  normalizedAddress: string,
  tradeAmountUsd?: number,
): RecommendationPipelineInput | undefined {
  if (!report.opportunityExists || typeof report.spread.spreadPercent !== "number") {
    return undefined
  }

  return {
    opportunity: mapToArbitrageOpportunity(report, normalizedAddress),
    comparisonInput: mapToNormalizedQuoteInput(report, normalizedAddress, tradeAmountUsd),
    riskInput: mapToNormalizedMarketSnapshot(report, normalizedAddress),
  }
}
