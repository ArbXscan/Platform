import { useCallback, useEffect, useState } from "react"
import {
  calculateArbitrageProfit,
  detectCrossChainOpportunities,
  generateCrossChainRecommendation,
} from "../features/cross-chain"
import type {
  ArbitrageProfit,
  CrossChainOpportunity,
  CrossChainRecommendation,
  NormalizedTokenSnapshot,
} from "../features/cross-chain"
import { RECOGNIZED_ASSETS } from "../registry/assets"
import { searchPairs } from "../services/providers/dexscreener"
import type { DexScreenerPair } from "../services/providers/dexscreener"
import type { AsyncStatus } from "../types/api"

export interface CrossChainArbitrageRow {
  opportunity: CrossChainOpportunity
  profit: ArbitrageProfit
  recommendation: CrossChainRecommendation
}

function toPriceNumber(value: string | undefined): number {
  if (value === undefined) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Same mapping shape used by pages/scanner/ScannerPage.tsx — a small, local field shim, not a duplicated engine. */
function toNormalizedTokenSnapshot(pair: DexScreenerPair): NormalizedTokenSnapshot {
  return {
    assetSymbol: pair.baseToken?.symbol ?? "",
    chainId: pair.chainId,
    tokenAddress: pair.baseToken?.address ?? "",
    exchange: pair.dexId,
    priceUsd: toPriceNumber(pair.priceUsd),
    liquidityUsd: pair.liquidity?.usd ?? 0,
  }
}

/**
 * Fetches DexScreener pairs (services/providers/dexscreener.ts, the same
 * shared low-level client already used elsewhere in the app) for every
 * officially recognized asset (registry/assets — reused, not duplicated),
 * across every chain each one trades on, and normalizes them into
 * NormalizedTokenSnapshot[] — the exact input shape the existing
 * Cross-Chain Opportunity Engine already expects. A failed lookup for one
 * asset is skipped rather than failing the whole scan.
 */
async function fetchSnapshots(): Promise<NormalizedTokenSnapshot[]> {
  const results = await Promise.allSettled(RECOGNIZED_ASSETS.map((asset) => searchPairs(asset.symbol)))

  const snapshots: NormalizedTokenSnapshot[] = []
  for (const result of results) {
    if (result.status !== "fulfilled") continue
    for (const pair of result.value) {
      snapshots.push(toNormalizedTokenSnapshot(pair))
    }
  }
  return snapshots
}

/**
 * Cross-Chain Arbitrage data hook. Orchestration only: gathers real
 * multi-chain snapshots (above), then hands them to the three existing,
 * unmodified engines in sequence —
 * detectCrossChainOpportunities -> calculateArbitrageProfit ->
 * generateCrossChainRecommendation (all from features/cross-chain). No
 * opportunity, profit, or recommendation logic is reimplemented here.
 */
export function useCrossChainArbitrage() {
  const [rows, setRows] = useState<CrossChainArbitrageRow[]>([])
  const [status, setStatus] = useState<AsyncStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setStatus("loading")
    setError(null)
    try {
      const snapshots = await fetchSnapshots()
      const opportunities = detectCrossChainOpportunities(snapshots)

      const nextRows = opportunities.map((opportunity) => {
        const profit = calculateArbitrageProfit(opportunity)
        const recommendation = generateCrossChainRecommendation(opportunity, profit)
        return { opportunity, profit, recommendation }
      })

      setRows(nextRows)
      setStatus("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan cross-chain opportunities.")
      setStatus("error")
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { rows, status, error, refresh }
}
