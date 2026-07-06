import type { ReactNode } from "react"
import type { ScannerIntegrationReport, StageStatus } from "../../features/scanner-integration"

const STATUS_STYLES: Record<StageStatus, string> = {
  success: "bg-emerald-400/10 text-emerald-300",
  failed: "bg-red-400/10 text-red-300",
  skipped: "bg-slate-400/10 text-slate-400",
}

interface ResultRowProps {
  label: string
  status: StageStatus
  children?: ReactNode
}

function ResultRow({ label, status, children }: ResultRowProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <span
        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
      >
        {label}: {status}
      </span>
      {children && <span className="text-sm text-slate-300">{children}</span>}
    </div>
  )
}

interface ScannerResultsProps {
  report: ScannerIntegrationReport
}

/**
 * Presentation-only view of the Scanner Integration flow's first three
 * stages — Search Result, Asset Identity, and Token Scan — rendered exactly
 * as runScannerIntegration produced them (features/scanner-integration). No
 * search, ranking, identity resolution, or address validation happens here.
 */
export function ScannerResults({ report }: ScannerResultsProps) {
  const { searchResult, assetIdentity, tokenScan } = report

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <ResultRow label="Search Result" status={searchResult.status}>
        {searchResult.data && (
          <span>
            {searchResult.data.asset.displaySymbol}
            {searchResult.data.asset.displayName ? ` — ${searchResult.data.asset.displayName}` : ""} on{" "}
            {searchResult.data.asset.chain} ({searchResult.data.matchType})
          </span>
        )}
      </ResultRow>

      <ResultRow label="Asset Identity" status={assetIdentity.status}>
        {assetIdentity.data && (
          <span>
            {assetIdentity.data.assetCategory} · confidence: {assetIdentity.data.confidence}
          </span>
        )}
      </ResultRow>

      <ResultRow label="Token Scan" status={tokenScan.status}>
        {tokenScan.data && (
          <span>
            {tokenScan.data.validation.status} · {tokenScan.data.chainDetection.candidates.length} chain candidate(s)
          </span>
        )}
      </ResultRow>

      <p className="text-xs text-slate-500">{report.reason}</p>
    </div>
  )
}
