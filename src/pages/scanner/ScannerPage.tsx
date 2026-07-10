import { useEffect, useState } from "react"
import { searchAssetIdentities } from "../../features/search/search.service"
import { runScannerIntegration } from "../../features/scanner-integration"
import type {
  AssetIdentityReport,
  NormalizedTokenSnapshot,
  ScannerIntegrationReport,
} from "../../features/scanner-integration"
import { searchPairs } from "../../services/providers/dexscreener"
import type { DexScreenerPair } from "../../services/providers/dexscreener"
import type { AsyncStatus } from "../../types/api"
import type { RecommendationActionLinks } from "../recommendation"
import { ScannerDetails } from "./ScannerDetails"
import { ScannerEmpty } from "./ScannerEmpty"
import { ScannerLayout } from "./ScannerLayout"
import { ScannerLoading } from "./ScannerLoading"
import { ScannerResults } from "./ScannerResults"
import { ScannerSearch } from "./ScannerSearch"

function toPriceNumber(value: string | undefined): number {
  if (value === undefined) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Converts one DexScreener pair into a NormalizedTokenSnapshot (the shape
 * the existing Cross-Chain Engine already consumes — see
 * features/cross-chain). Every field is read directly from the pair;
 * missing/malformed price or liquidity values default to 0 rather than
 * being fabricated as a guessed positive number, and never throw.
 */
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

interface ScannerPageProps {
  /** Candidate assets to search, already identity-resolved. Optional — when omitted, resolved via the same Search pipeline the Search page uses (features/search/search.service.ts's searchAssetIdentities, itself built on search-adapter.ts + features/search-ranking). */
  availableAssets?: AssetIdentityReport[]
  /** Every known snapshot of assets across chains, for cross-chain matching. Optional — when omitted, resolved from the same DexScreener search results used for this query (services/providers/dexscreener.ts), so the Cross-Chain Engine has real, multi-chain data to match against. */
  snapshots?: NormalizedTokenSnapshot[]
  /** Forwarded to the Recommendation Pipeline's profitability estimate if provided. */
  tradeAmountUsd?: number
  /** Pre-resolved action links, forwarded to the recommendation's OpenActions unchanged. */
  actions?: RecommendationActionLinks
}

/**
 * Scanner Page — presentation layer only. Collects a free-text query (token
 * name, symbol, or contract address) via ScannerSearch and runs the
 * existing Scanner Integration flow (features/scanner-integration) for it.
 * No search, ranking, identity, scanning, cross-chain, or recommendation
 * calculation happens here or in any of this page's sub-components — every
 * value rendered comes directly from runScannerIntegration(). When
 * `availableAssets` isn't supplied by a caller, it's resolved via the same
 * Search pipeline the Search page uses (features/search/search.service.ts);
 * when `snapshots` isn't supplied, it's built from the same DexScreener
 * search results (services/providers/dexscreener.ts) so the Cross-Chain
 * Engine has real, multi-chain data to match against — no second search or
 * cross-chain implementation. Local component state only; no Context, no
 * Redux, no Zustand.
 */
export default function ScannerPage({
  availableAssets,
  snapshots,
  tradeAmountUsd,
  actions,
}: ScannerPageProps) {
  const [term, setTerm] = useState<string | undefined>(undefined)
  const [report, setReport] = useState<ScannerIntegrationReport | null>(null)
  const [status, setStatus] = useState<AsyncStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!term) {
      setReport(null)
      setStatus("idle")
      setError(null)
      return
    }

    const searchTerm = term
    let cancelled = false
    setStatus("loading")
    setError(null)

    async function run() {
      try {
        const resolvedAssets = availableAssets ?? (await searchAssetIdentities(searchTerm))
        const resolvedSnapshots = snapshots ?? (await searchPairs(searchTerm)).map(toNormalizedTokenSnapshot)
        const result = await runScannerIntegration({
          query: { term: searchTerm },
          availableAssets: resolvedAssets,
          snapshots: resolvedSnapshots,
          tradeAmountUsd,
        })
        if (cancelled) return
        setReport(result)
        setStatus("success")
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to run the Scanner Integration flow.")
        setStatus("error")
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [term, availableAssets, snapshots, tradeAmountUsd])

  return (
    <ScannerLayout>
      <ScannerSearch onSearch={setTerm} disabled={status === "loading"} />

      <div className="mt-6">
        {status === "idle" && <ScannerEmpty />}

        {status === "loading" && <ScannerLoading />}

        {status === "error" && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            Couldn't run the scanner: {error}
          </div>
        )}

        {status === "success" && report && (
          <div className="space-y-4">
            <ScannerResults report={report} />
            <ScannerDetails report={report} actions={actions} />
          </div>
        )}
      </div>
    </ScannerLayout>
  )
}
