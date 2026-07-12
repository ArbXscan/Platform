import { useMemo, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { FiActivity, FiGlobe, FiHeart, FiInbox, FiLayers, FiRefreshCw, FiSearch, FiStar, FiZap } from "react-icons/fi"
import {
  FavoritesCard,
  RecentSearchesCard,
  SearchHistoryCard,
  TrendingOpportunitiesCard,
  TrendingTokensCard,
  WatchlistCard,
} from "../../components/dashboard"
import { TrendingVolumeChart } from "../../components/charts/TrendingVolumeChart"
import { ChainLogo } from "../../components/shared/ChainLogo"
import { EmptyState } from "../../components/shared/EmptyState"
import { SourceBadge } from "../../components/shared/SourceBadge"
import { StatCard } from "../../components/shared/StatCard"
import { Skeleton, StatCardSkeleton } from "../../components/ui/Skeleton"
import { SUPPORTED_CHAINS, DEFAULT_CHAIN_ID } from "../../constants/chains"
import { useArbitrage } from "../../hooks/useArbitrage"
import { useFavorites } from "../../hooks/useFavorites"
import { useMarketData } from "../../hooks/useMarketData"
import { useWatchlist } from "../../hooks/useWatchlist"

function formatUsd(value: number): string {
  return `$${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`
}

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export default function DashboardPage() {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const { snapshot, status, error, refresh: refreshMarket } = useMarketData(DEFAULT_CHAIN_ID)
  const { opportunities, status: arbitrageStatus, error: arbitrageError, refresh: refreshArbitrage } = useArbitrage()
  const { watchlist } = useWatchlist()
  const { favorites } = useFavorites()
  const loadingInitial = status === "loading" && !snapshot
  const isRefreshing = status === "loading" || arbitrageStatus === "loading"
  const hasError = Boolean(error) || Boolean(arbitrageError)

  const averageSpreadPercent = useMemo(() => {
    if (opportunities.length === 0) return undefined
    const total = opportunities.reduce((sum, o) => sum + o.priceDiffPercent, 0)
    return total / opportunities.length
  }, [opportunities])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(`/app/search?q=${encodeURIComponent(query.trim())}`)
  }

  function handleRefreshAll() {
    refreshMarket()
    refreshArbitrage()
  }

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Live snapshot of {SUPPORTED_CHAINS.find((c) => c.id === DEFAULT_CHAIN_ID)?.name} trending pairs.
          </p>
        </div>

        <div className="flex w-full flex-col items-end gap-1.5 md:w-auto">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <form onSubmit={handleSearch} className="relative w-full md:w-72">
              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <label htmlFor="dashboard-search" className="sr-only">
                Search token, symbol, or address
              </label>
              <input
                id="dashboard-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search token, symbol, or address"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
              />
            </form>

            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              aria-label="Refresh all dashboard data"
              title="Refresh all dashboard data"
              className="shrink-0 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiRefreshCw className={isRefreshing ? "animate-spin" : ""} aria-hidden="true" />
            </button>
          </div>

          {snapshot && (
            <p className="text-xs text-slate-600">
              {isRefreshing ? "Refreshing…" : `Last updated ${formatUpdatedAt(snapshot.source.fetchedAt)}`}
            </p>
          )}
        </div>
      </div>

      {hasError && (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          {error && <p>Couldn't load market data: {error}</p>}
          {arbitrageError && <p>Couldn't load arbitrage data: {arbitrageError}</p>}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loadingInitial ? (
          <>
            {Array.from({ length: 7 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
            <StatCard icon={FiLayers} label="Tracked Pairs" value={String(snapshot?.trackedPairCount ?? 0)} />
            <StatCard
              icon={FiActivity}
              label="24h Volume (tracked)"
              value={formatUsd(snapshot?.volume24hUsd ?? 0)}
              hint="Sum across tracked pairs, not the whole market"
            />
            <StatCard icon={FiGlobe} label="Chains Monitored" value={String(SUPPORTED_CHAINS.length)} />
            <StatCard
              icon={FiZap}
              label="Active Opportunities"
              value={String(opportunities.length)}
              hint="Cross-DEX spreads currently detected"
            />
            <StatCard
              icon={FiZap}
              label="Avg. Spread"
              value={averageSpreadPercent !== undefined ? `${averageSpreadPercent.toFixed(2)}%` : "N/A"}
            />
            <StatCard icon={FiStar} label="Watchlisted" value={String(watchlist.length)} />
            <StatCard icon={FiHeart} label="Favorites" value={String(favorites.length)} />
          </>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Trending Pairs</h2>
          {snapshot && <SourceBadge source={snapshot.source} />}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          {loadingInitial ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : snapshot && snapshot.trending.length > 0 ? (
            <>
              <TrendingVolumeChart data={snapshot.trending} />
              <div className="mt-4 divide-y divide-white/5">
                {snapshot.trending.slice(0, 8).map((t) => (
                  <a
                    key={t.poolUrl}
                    href={t.poolUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between py-2.5 text-sm transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
                  >
                    <span className="font-medium text-white">{t.pairName}</span>
                    <span className="flex items-center gap-4 text-slate-400">
                      <span>${t.priceUsd < 1 ? t.priceUsd.toPrecision(4) : t.priceUsd.toFixed(2)}</span>
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
            </>
          ) : (
            <EmptyState icon={FiInbox} title="No trending pairs found right now" />
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrendingOpportunitiesCard />
        <TrendingTokensCard />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WatchlistCard />
        <FavoritesCard />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentSearchesCard />
        <SearchHistoryCard />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-white">Monitored Chains</h2>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_CHAINS.map((chain) => (
            <span
              key={chain.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300"
            >
              <ChainLogo chainId={chain.id} size={14} />
              {chain.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
