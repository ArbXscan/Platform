import { useMemo, useState } from "react"
import { FiBarChart2, FiSearch } from "react-icons/fi"
import { ChainLogo } from "../../components/shared/ChainLogo"
import { EmptyState } from "../../components/shared/EmptyState"
import { SourceBadge } from "../../components/shared/SourceBadge"
import { Select } from "../../components/ui/Select"
import { TableRowSkeleton } from "../../components/ui/Skeleton"
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS } from "../../constants/chains"
import { useMarketData } from "../../hooks/useMarketData"
import type { MarketSortKey, TrendingToken } from "../../types/market"

const TABS: { key: MarketSortKey; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "gainers", label: "Trending Gainers" },
  { key: "losers", label: "Trending Losers" },
  { key: "volume", label: "Trending by Volume" },
  { key: "liquidity", label: "Trending by Liquidity" },
]

const CHAIN_OPTIONS = SUPPORTED_CHAINS.map((chain) => ({ value: chain.id, label: chain.name }))

function formatUsd(value: number | null): string {
  if (value === null) return "N/A"
  return `$${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`
}

function formatPrice(value: number): string {
  return value < 1 ? `$${value.toPrecision(4)}` : `$${value.toFixed(2)}`
}

/**
 * All five tabs sort the SAME trending-pool set GeckoTerminal returns — there's
 * no separate "top gainers" or "highest volume" endpoint on the free tier, so
 * "Top Gainers" here means "biggest 24h movers among currently trending pairs",
 * not a scan of the whole market. Same honesty rule as MarketSnapshot's docstring
 * in types/market.ts (not claiming a true global aggregate).
 */
function sortTokens(tokens: TrendingToken[], sortKey: MarketSortKey): TrendingToken[] {
  const sorted = [...tokens]
  switch (sortKey) {
    case "gainers":
      return sorted.sort((a, b) => (b.change24h ?? -Infinity) - (a.change24h ?? -Infinity))
    case "losers":
      return sorted.sort((a, b) => (a.change24h ?? Infinity) - (b.change24h ?? Infinity))
    case "volume":
      return sorted.sort((a, b) => b.volume24hUsd - a.volume24hUsd)
    case "liquidity":
      return sorted.sort((a, b) => (b.liquidityUsd ?? -1) - (a.liquidityUsd ?? -1))
    case "trending":
    default:
      return sorted // preserve GeckoTerminal's own trending order
  }
}

export default function MarketPage() {
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID)
  const [sortKey, setSortKey] = useState<MarketSortKey>("trending")
  const [query, setQuery] = useState("")

  const { snapshot, status, error } = useMarketData(chainId)

  const rows = useMemo(() => {
    const tokens = snapshot?.trending ?? []
    const filtered = query.trim()
      ? tokens.filter((t) => t.pairName.toLowerCase().includes(query.trim().toLowerCase()))
      : tokens
    return sortTokens(filtered, sortKey)
  }, [snapshot, sortKey, query])

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <ChainLogo chainId={chainId} size={24} />
          <div>
            <h1 className="text-2xl font-bold text-white">Market</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Trending pools on {SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name}, via GeckoTerminal.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select
            value={chainId}
            onChange={setChainId}
            options={CHAIN_OPTIONS}
            label="Filter by chain"
            className="w-40"
          />

          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <label htmlFor="market-search" className="sr-only">
              Filter by pair name
            </label>
            <input
              id="market-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by pair name"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none sm:w-56"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Market view">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={sortKey === tab.key}
            onClick={() => setSortKey(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${
              sortKey === tab.key
                ? "bg-cyan-400/10 text-cyan-300"
                : "border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-slate-600">
        Based on GeckoTerminal Trending Pools — a ranked view of currently trending pairs, not a full
        market scan.
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          Couldn't load market data: {error}
        </div>
      )}

      {!error && (
        <>
          <div className="mb-3 mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {status === "loading" && !snapshot ? "Loading…" : `${rows.length} pairs`}
            </p>
            {snapshot && <SourceBadge source={snapshot.source} />}
          </div>

          {status !== "loading" && snapshot && rows.length === 0 ? (
            <EmptyState
              icon={FiBarChart2}
              title="No pairs match this filter"
              description="Try a different search term, chain, or view."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-950/95 text-xs uppercase tracking-wide text-slate-400 backdrop-blur">
                  <tr>
                    <th scope="col" className="px-4 py-3">Pair</th>
                    <th scope="col" className="px-4 py-3">Price</th>
                    <th scope="col" className="px-4 py-3">24h Change</th>
                    <th scope="col" className="px-4 py-3">24h Volume</th>
                    <th scope="col" className="px-4 py-3">Liquidity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {status === "loading" && !snapshot
                    ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)
                    : rows.map((t) => (
                        <tr key={t.poolUrl} className="transition-colors hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <a
                              href={t.poolUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
                            >
                              {t.pairName}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{formatPrice(t.priceUsd)}</td>
                          <td className="px-4 py-3">
                            {t.change24h === null ? (
                              <span className="text-slate-500">N/A</span>
                            ) : (
                              <span className={t.change24h >= 0 ? "text-emerald-400" : "text-red-400"}>
                                {t.change24h >= 0 ? "+" : ""}
                                {t.change24h.toFixed(2)}%
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{formatUsd(t.volume24hUsd)}</td>
                          <td className="px-4 py-3 text-slate-300">{formatUsd(t.liquidityUsd)}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
