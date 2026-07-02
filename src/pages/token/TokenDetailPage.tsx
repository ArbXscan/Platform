import { useParams } from "react-router-dom"
import { SourceBadge } from "../../components/shared/SourceBadge"
import { StatCard } from "../../components/shared/StatCard"
import { getChainById } from "../../constants/chains"
import { useToken } from "../../hooks/useToken"

function formatUsd(value: number): string {
  return `$${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`
}

function formatPrice(value: number): string {
  return value < 1 ? `$${value.toPrecision(4)}` : `$${value.toFixed(2)}`
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export default function TokenDetailPage() {
  const { query } = useParams<{ query: string }>()
  const { token, status, error } = useToken(query)

  return (
    <div className="p-6 md:p-10">
      {status === "loading" && !token && (
        <p className="py-8 text-center text-sm text-slate-500">Looking up "{query}"…</p>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          Couldn't load token: {error}
        </div>
      )}

      {token && (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-3">
              {token.logoUrl && (
                <img
                  src={token.logoUrl}
                  alt={token.symbol}
                  className="h-10 w-10 rounded-full bg-white/5"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {token.name} <span className="text-slate-400">({token.symbol})</span>
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {getChainById(token.chainId)?.name ?? token.chainId}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-2xl font-bold text-white">{formatPrice(token.price.usd)}</p>
              <p className={token.price.change24h >= 0 ? "text-sm text-emerald-400" : "text-sm text-red-400"}>
                {token.price.change24h >= 0 ? "+" : ""}
                {token.price.change24h.toFixed(2)}% (24h)
              </p>
            </div>
          </div>

          <div className="mt-3">
            <SourceBadge source={token.price.source} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Liquidity"
              value={formatUsd(token.liquidity.totalUsd)}
              hint={`${token.liquidity.poolCount} pool${token.liquidity.poolCount === 1 ? "" : "s"} tracked`}
            />
            <StatCard
              label="Market Cap / FDV"
              value={token.stats.marketCapUsd ? formatUsd(token.stats.marketCapUsd) : "N/A"}
            />
            <StatCard label="24h Volume" value={formatUsd(token.stats.volume24hUsd)} />
            <StatCard label="Supported DEXs" value={String(token.supportedExchanges.length)} />
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-white">Contract</h2>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <code className="text-sm text-slate-300">{truncateAddress(token.address)}</code>
              <button
                onClick={() => navigator.clipboard.writeText(token.address)}
                className="rounded-md border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/[0.05]"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-white">Supported DEXs</h2>
            <div className="flex flex-wrap gap-2">
              {token.supportedExchanges.map((dexId) => (
                <span
                  key={dexId}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300"
                >
                  {dexId}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white">Price Chart</h2>
              <p className="mt-2 text-sm text-slate-500">
                Historical chart data isn't available from DexScreener or GeckoTerminal's free tier yet.
                This section will populate once a charting-capable provider is integrated — no
                placeholder chart is shown here to avoid displaying invented data.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white">Holder Summary</h2>
              <p className="mt-2 text-sm text-slate-500">
                Holder data requires an on-chain indexer or block explorer API, which isn't wired up
                yet. This section is intentionally left empty rather than showing fabricated numbers.
              </p>
            </div>
          </div>
        </>
      )}

      {!token && status !== "loading" && !error && (
        <p className="py-8 text-center text-sm text-slate-500">No token specified.</p>
      )}
    </div>
  )
}
