import { RecommendationCard } from "../../components/recommendation"
import type { ScannerIntegrationReport, StageStatus } from "../../features/scanner-integration"
import type { RecommendationActionLinks } from "../recommendation"

const STATUS_STYLES: Record<StageStatus, string> = {
  success: "bg-emerald-400/10 text-emerald-300",
  failed: "bg-red-400/10 text-red-300",
  skipped: "bg-slate-400/10 text-slate-400",
}

interface ScannerDetailsProps {
  report: ScannerIntegrationReport
  /** Pre-resolved action links, forwarded to RecommendationCard's OpenActions unchanged. */
  actions?: RecommendationActionLinks
}

/**
 * Presentation-only view of the Scanner Integration flow's final two
 * stages — Cross-Chain Opportunity and Recommendation — rendered exactly as
 * runScannerIntegration produced them (features/scanner-integration). The
 * Recommendation stage reuses the existing RecommendationCard component
 * as-is (components/recommendation); no spread, bridge, risk, scoring, or
 * recommendation calculation happens here.
 */
export function ScannerDetails({ report, actions }: ScannerDetailsProps) {
  const { crossChain, recommendation } = report

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[crossChain.status]}`}
        >
          Cross-Chain Opportunity: {crossChain.status}
        </span>
        {crossChain.data && (
          <p className="text-sm text-slate-300">
            {crossChain.data.assetSymbol}: buy on {crossChain.data.buy.chainId} ({crossChain.data.buy.exchange}), sell
            on {crossChain.data.sell.chainId} ({crossChain.data.sell.exchange}). Bridge required:{" "}
            {crossChain.data.bridgeRequirement.level}.
          </p>
        )}
      </div>

      {recommendation.status === "success" && recommendation.data ? (
        <RecommendationCard
          recommendation={recommendation.data.recommendation}
          scoring={recommendation.data.scoring}
          risk={recommendation.data.risk}
          actions={actions}
        />
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
          Recommendation: {recommendation.status}. {report.reason}
        </div>
      )}
    </div>
  )
}
