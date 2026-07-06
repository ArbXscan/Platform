import { useEffect, useState } from "react"
import { runScannerIntegration } from "../../features/scanner-integration"
import type {
  AssetIdentityReport,
  NormalizedTokenSnapshot,
  ScannerIntegrationReport,
} from "../../features/scanner-integration"
import type { AsyncStatus } from "../../types/api"
import type { RecommendationActionLinks } from "../recommendation"
import { ScannerDetails } from "./ScannerDetails"
import { ScannerEmpty } from "./ScannerEmpty"
import { ScannerLayout } from "./ScannerLayout"
import { ScannerLoading } from "./ScannerLoading"
import { ScannerResults } from "./ScannerResults"
import { ScannerSearch } from "./ScannerSearch"

interface ScannerPageProps {
  /** Candidate assets to search, already identity-resolved — supplied by a future data-source integration (e.g. Asset Registry). Not fetched here. */
  availableAssets?: AssetIdentityReport[]
  /** Every known snapshot of assets across chains, for cross-chain matching — supplied by a future data-source integration. Not fetched here. */
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
 * value rendered comes directly from runScannerIntegration(). Local
 * component state only; no Context, no Redux, no Zustand. Not wired into
 * routing or navigation yet.
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

    let cancelled = false
    setStatus("loading")
    setError(null)

    runScannerIntegration({
      query: { term },
      availableAssets: availableAssets ?? [],
      snapshots: snapshots ?? [],
      tradeAmountUsd,
    })
      .then((result) => {
        if (cancelled) return
        setReport(result)
        setStatus("success")
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to run the Scanner Integration flow.")
        setStatus("error")
      })

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
