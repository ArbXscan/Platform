import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { FiSearch } from "react-icons/fi"
import { TrendingVolumeChart } from "../../components/charts/TrendingVolumeChart"
import { SourceBadge } from "../../components/shared/SourceBadge"
import { StatCard } from "../../components/shared/StatCard"
import { SUPPORTED_CHAINS, DEFAULT_CHAIN_ID } from "../../constants/chains"
import { useMarketData } from "../../hooks/useMarketData"

function formatUsd(value: number): string {
  return `$${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`
}

export default function DashboardPage() {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const { snapshot, status, error } = useMarketData(DEFAULT_CHAIN_ID)

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(`/app/token/${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Live snapshot of {SUPPORTED_CHAINS.find((c) => c.id === DEFAULT_CHAIN_ID)?.name} trending pairs.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search token, symbol, or address"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
        </form>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          Couldn't load market data: {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tracked Pairs" value={status === "loading" ? "…" : String(snapshot?.trackedPairCount ?? 0)} />
        <StatCard
          label="24h Volume (tracked)"
          value={status === "loading" ? "…" : formatUsd(snapshot?.volume24hUsd ?? 0)}
          hint="Sum across tracked pairs, not the whole market"
        />
        <StatCard label="Chains Monitored" value={String(SUPPORTED_CHAINS.length)} />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Trending Pairs</h2>
          {snapshot && <SourceBadge source={snapshot.source} />}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          {status === "loading" && !snapshot ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading trending pairs…</p>
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
                    className="flex items-center justify-between py-2.5 text-sm hover:bg-white/[0.03]"
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
            <p className="py-8 text-center text-sm text-slate-500">No trending pairs found right now.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-white">Monitored Chains</h2>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_CHAINS.map((chain) => (
            <span
              key={chain.id}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300"
            >
              {chain.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
