import { useParams } from "react-router-dom"
import { FiExternalLink, FiSearch } from "react-icons/fi"
import { ChainLogo } from "../../components/shared/ChainLogo"
import { CopyButton } from "../../components/shared/CopyButton"
import { DexLogo } from "../../components/shared/DexLogo"
import { EmptyState } from "../../components/shared/EmptyState"
import { SourceBadge } from "../../components/shared/SourceBadge"
import { StatCard } from "../../components/shared/StatCard"
import { TokenLogo } from "../../components/shared/TokenLogo"
import { Skeleton, StatCardSkeleton } from "../../components/ui/Skeleton"
import { getChainById } from "../../constants/chains"
import { getExplorer } from "../../constants/explorers"
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
  const explorer = token ? getExplorer(token.chainId) : undefined

  return (
    <div className="p-6 md:p-10">
      {status === "loading" && !token && (
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
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
              <TokenLogo logoUrl={token.logoUrl} symbol={token.symbol} size={40} />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {token.name} <span className="text-slate-400">({token.symbol})</span>
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                  <ChainLogo chainId={token.chainId} size={16} />
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
            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
              <code className="break-all text-sm text-slate-300">{truncateAddress(token.address)}</code>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={token.address} label="Copy address" />
                {explorer && (
                  <a
                    href={explorer.addressUrl(token.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
                  >
                    <FiExternalLink aria-hidden="true" />
                    {explorer.name}
                  </a>
                )}
                {token.sourceUrl && (
                  <a
                    href={token.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
                  >
                    <FiExternalLink aria-hidden="true" />
                    DexScreener
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-white">Supported DEXs</h2>
            <div className="flex flex-wrap gap-2">
              {token.supportedExchanges.map((dexId) => (
                <span
                  key={dexId}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300"
                >
                  <DexLogo dexId={dexId} size={14} />
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
        <EmptyState
          icon={FiSearch}
          title="No token specified"
          description="Search for a token by contract address, symbol, or name from the Dashboard."
        />
      )}
    </div>
  )
}
