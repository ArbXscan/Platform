import { estimateCrossChainConfidence } from "./confidence"
import type { CrossChainConfidenceLevel } from "./confidence"
import { runCrossChainScanner } from "./cross-chain-engine"
import type { CrossChainOpportunityReport, NormalizedTokenSnapshot } from "./types"

/** Normalized, flat cross-chain opportunity — the public shape of the Cross-Chain Opportunity Engine. */
export interface CrossChainOpportunity {
  token: string
  symbol: string
  sourceChain: string
  destinationChain: string
  sourceDex: string
  destinationDex: string
  buyPrice: number
  sellPrice: number
  spreadPercent: number
  liquidity: number
  confidence: CrossChainConfidenceLevel
  timestamp: string
}

/**
 * Maps one CrossChainOpportunityReport (produced by the existing, unchanged
 * runCrossChainScanner — see cross-chain-engine.ts) onto the normalized
 * CrossChainOpportunity shape. Every field is read from the report; nothing
 * is recalculated. Returns undefined when the report's spread percentage
 * couldn't be determined (missing/invalid price data) — this never
 * fabricates a spread or price to force a result.
 */
function toCrossChainOpportunity(report: CrossChainOpportunityReport): CrossChainOpportunity | undefined {
  const { spreadPercent } = report.spread
  if (typeof spreadPercent !== "number" || !Number.isFinite(spreadPercent)) return undefined

  const buyLiquidity = Number.isFinite(report.buy.liquidityUsd) ? report.buy.liquidityUsd : 0
  const sellLiquidity = Number.isFinite(report.sell.liquidityUsd) ? report.sell.liquidityUsd : 0

  return {
    token: report.buy.tokenAddress,
    symbol: report.assetSymbol,
    sourceChain: report.buy.chainId,
    destinationChain: report.sell.chainId,
    sourceDex: report.buy.exchange,
    destinationDex: report.sell.exchange,
    buyPrice: report.buy.priceUsd,
    sellPrice: report.sell.priceUsd,
    spreadPercent,
    liquidity: Math.min(buyLiquidity, sellLiquidity),
    confidence: estimateCrossChainConfidence(report.buy, report.sell),
    timestamp: report.detectedAt,
  }
}

/**
 * Defensive input filter: keeps only snapshots with the minimum usable
 * shape (non-empty symbol/chain id/exchange, a real object, a finite
 * price). Malformed entries are dropped rather than allowed to reach the
 * matching/spread logic — this never throws for bad input.
 */
function isUsableSnapshot(snapshot: NormalizedTokenSnapshot): boolean {
  return (
    Boolean(snapshot) &&
    typeof snapshot.assetSymbol === "string" &&
    snapshot.assetSymbol.trim().length > 0 &&
    typeof snapshot.chainId === "string" &&
    snapshot.chainId.trim().length > 0 &&
    typeof snapshot.tokenAddress === "string" &&
    typeof snapshot.exchange === "string" &&
    snapshot.exchange.trim().length > 0 &&
    Number.isFinite(snapshot.priceUsd)
  )
}

/**
 * Milestone 4.1 — Cross-Chain Opportunity Engine.
 *
 * Detects opportunities across every supported chain present in
 * `snapshots`, comparing the same asset's price across every chain it was
 * found on. Reuses the existing runCrossChainScanner end to end — asset
 * grouping (scanner.ts), buy/sell pairing (matcher.ts), spread and
 * opportunity-exists math (opportunity.ts), and bridge-requirement
 * detection (bridge-analysis.ts) are all unchanged and not duplicated here.
 * This function only filters malformed input, then normalizes the reports
 * that are real, currently-measurable opportunities into the flat
 * CrossChainOpportunity shape.
 *
 * Gas fees, bridge fees, and recommendation/risk logic are intentionally
 * out of scope and are never estimated here.
 *
 * Never throws for "no opportunities" — always returns an array, empty when
 * nothing qualifies. Missing prices, missing liquidity, duplicated assets,
 * invalid chain data, and unsupported (single-chain-only) pairs are all
 * handled without crashing, either by the defensive filter here or by the
 * existing pipeline's own null-safety (see matcher.ts, opportunity.ts).
 */
export function detectCrossChainOpportunities(snapshots: NormalizedTokenSnapshot[]): CrossChainOpportunity[] {
  if (!Array.isArray(snapshots) || snapshots.length === 0) return []

  const usableSnapshots = snapshots.filter(isUsableSnapshot)
  if (usableSnapshots.length === 0) return []

  const reports = runCrossChainScanner(usableSnapshots)
  const opportunities: CrossChainOpportunity[] = []

  for (const report of reports) {
    if (!report.opportunityExists) continue
    const opportunity = toCrossChainOpportunity(report)
    if (opportunity) opportunities.push(opportunity)
  }

  return opportunities
}
