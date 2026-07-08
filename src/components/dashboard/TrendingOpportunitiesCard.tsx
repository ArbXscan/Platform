import { Link } from "react-router-dom"
import { FiZap } from "react-icons/fi"
import { ChainLogo } from "../shared/ChainLogo"
import { EmptyState } from "../shared/EmptyState"
import { Skeleton } from "../ui/Skeleton"
import { getChainById } from "../../constants/chains"
import { useArbitrage } from "../../hooks/useArbitrage"

const PREVIEW_COUNT = 5

function formatUsd(value: number): string {
  return `$${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`
}

/**
 * Dashboard preview of the top cross-DEX opportunities. Reuses the same
 * useArbitrage hook and live data as the Arbitrage Scanner page — no
 * scanning, spread, or confidence logic is duplicated here.
 */
export function TrendingOpportunitiesCard() {
  const { opportunities, status, error } = useArbitrage()
  const isInitialLoad = status === "loading" && opportunities.length === 0
  const top = [...opportunities].sort((a, b) => b.priceDiffPercent - a.priceDiffPercent).slice(0, PREVIEW_COUNT)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Trending Opportunities</h2>
        <Link to="/app/arbitrage" className="text-xs text-cyan-300 hover:underline">
          View all
        </Link>
      </div>

      {error && <p className="text-sm text-red-300">Couldn't load opportunities: {error}</p>}

      {!error && isInitialLoad && (
        <div className="space-y-3 py-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}

      {!error && !isInitialLoad && top.length === 0 && (
        <EmptyState icon={FiZap} title="No cross-DEX spreads found right now" />
      )}

      {!error && !isInitialLoad && top.length > 0 && (
        <div className="divide-y divide-white/5">
          {top.map((opportunity) => (
            <Link
              key={opportunity.id}
              to="/app/arbitrage"
              className="flex items-center justify-between py-2.5 text-sm transition-colors hover:bg-white/[0.03]"
            >
              <span className="flex items-center gap-2 font-medium text-white">
                <ChainLogo chainId={opportunity.token.chainId} size={16} />
                {opportunity.token.symbol}
                <span className="text-xs font-normal text-slate-500">
                  {getChainById(opportunity.token.chainId)?.name ?? opportunity.token.chainId}
                </span>
              </span>
              <span className="flex items-center gap-3 text-slate-400">
                <span>{formatUsd(Math.min(opportunity.buyFrom.liquidityUsd, opportunity.sellTo.liquidityUsd))}</span>
                <span className="font-medium text-emerald-400">+{opportunity.priceDiffPercent.toFixed(2)}%</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
