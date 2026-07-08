import { Link } from "react-router-dom"
import { FiInbox, FiTrendingUp } from "react-icons/fi"
import { EmptyState } from "../shared/EmptyState"
import { Skeleton } from "../ui/Skeleton"
import { DEFAULT_CHAIN_ID } from "../../constants/chains"
import { useMarketData } from "../../hooks/useMarketData"

const PREVIEW_COUNT = 6

function formatPrice(value: number): string {
  return value < 1 ? `$${value.toPrecision(4)}` : `$${value.toFixed(2)}`
}

/**
 * Token-focused trending view — reuses the exact same market snapshot as
 * the Trending Pairs section (hooks/useMarketData.ts), just presented as a
 * compact token list instead of a chart + full pair names. No new fetching
 * or ranking logic is introduced here.
 */
export function TrendingTokensCard() {
  const { snapshot, status, error } = useMarketData(DEFAULT_CHAIN_ID)
  const isInitialLoad = status === "loading" && !snapshot
  const tokens = snapshot?.trending.slice(0, PREVIEW_COUNT) ?? []

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Trending Tokens</h2>
        <Link to="/app/market" className="text-xs text-cyan-300 hover:underline">
          View all
        </Link>
      </div>

      {error && <p className="text-sm text-red-300">Couldn't load trending tokens: {error}</p>}

      {!error && isInitialLoad && (
        <div className="space-y-3 py-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}

      {!error && !isInitialLoad && tokens.length === 0 && (
        <EmptyState icon={FiInbox} title="No trending tokens found right now" />
      )}

      {!error && !isInitialLoad && tokens.length > 0 && (
        <div className="divide-y divide-white/5">
          {tokens.map((t) => (
            <a
              key={t.poolUrl}
              href={t.poolUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between py-2.5 text-sm transition-colors hover:bg-white/[0.03]"
            >
              <span className="flex items-center gap-2 font-medium text-white">
                <FiTrendingUp className="shrink-0 text-cyan-400" aria-hidden="true" />
                {t.pairName}
              </span>
              <span className="flex items-center gap-3 text-slate-400">
                <span>{formatPrice(t.priceUsd)}</span>
                {t.change24h !== null && (
                  <span className={t.change24h >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {t.change24h >= 0 ? "+" : ""}
                    {t.change24h.toFixed(1)}%
                  </span>
                )}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
