import { useMemo, useState } from "react"
import { SourceBadge } from "../../components/shared/SourceBadge"
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS, getChainById } from "../../constants/chains"
import { useArbitrage } from "../../hooks/useArbitrage"
import type { ConfidenceLevel } from "../../types/api"

const CONFIDENCE_ORDER: Record<ConfidenceLevel, number> = { unknown: 0, low: 1, medium: 2, high: 3 }

const CONFIDENCE_STYLES: Record<ConfidenceLevel, string> = {
  high: "bg-emerald-400/10 text-emerald-300",
  medium: "bg-amber-400/10 text-amber-300",
  low: "bg-orange-400/10 text-orange-300",
  unknown: "bg-slate-400/10 text-slate-400",
}

type SortKey = "spread" | "liquidity" | "confidence"

function formatUsd(value: number): string {
  return `$${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`
}

function formatPrice(value: number): string {
  return value < 1 ? `$${value.toPrecision(4)}` : `$${value.toFixed(2)}`
}

export default function ArbitragePage() {
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID)
  const [minConfidence, setMinConfidence] = useState<ConfidenceLevel>("unknown")
  const [sortKey, setSortKey] = useState<SortKey>("spread")

  const { opportunities, status, error } = useArbitrage(chainId)

  const filtered = useMemo(() => {
    const rows = opportunities.filter(
      (o) => CONFIDENCE_ORDER[o.confidence] >= CONFIDENCE_ORDER[minConfidence],
    )
    const withLiquidity = rows.map((o) => ({
      ...o,
      minLiquidityUsd: Math.min(o.buyFrom.liquidityUsd, o.sellTo.liquidityUsd),
    }))
    withLiquidity.sort((a, b) => {
      if (sortKey === "liquidity") return b.minLiquidityUsd - a.minLiquidityUsd
      if (sortKey === "confidence") return CONFIDENCE_ORDER[b.confidence] - CONFIDENCE_ORDER[a.confidence]
      return b.priceDiffPercent - a.priceDiffPercent
    })
    return withLiquidity
  }, [opportunities, minConfidence, sortKey])

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-white">Arbitrage Scanner</h1>
      <p className="mt-2 text-sm text-slate-400">
        Cross-DEX price spreads for currently trending tokens, sourced from DexScreener.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
        >
          {SUPPORTED_CHAINS.map((chain) => (
            <option key={chain.id} value={chain.id} className="bg-slate-900">
              {chain.name}
            </option>
          ))}
        </select>

        <select
          value={minConfidence}
          onChange={(e) => setMinConfidence(e.target.value as ConfidenceLevel)}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
        >
          <option value="unknown" className="bg-slate-900">All confidence levels</option>
          <option value="low" className="bg-slate-900">Low+</option>
          <option value="medium" className="bg-slate-900">Medium+</option>
          <option value="high" className="bg-slate-900">High only</option>
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
        >
          <option value="spread" className="bg-slate-900">Sort: Spread %</option>
          <option value="liquidity" className="bg-slate-900">Sort: Liquidity</option>
          <option value="confidence" className="bg-slate-900">Sort: Confidence</option>
        </select>
      </div>

      {status === "loading" && opportunities.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">Scanning trending tokens for spreads…</p>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          Couldn't load arbitrage data: {error}
        </div>
      )}

      {!error && status !== "loading" && filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">
          No cross-DEX spreads found for the current trending set on this chain right now.
        </p>
      )}

      {filtered.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Buy Price</th>
                <th className="px-4 py-3">Sell Price</th>
                <th className="px-4 py-3">Spread</th>
                <th className="px-4 py-3">Liquidity</th>
                <th className="px-4 py-3">Gas Estimate</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{o.token.symbol}</div>
                    <div className="text-xs text-slate-500">
                      {getChainById(o.token.chainId)?.name ?? o.token.chainId}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {o.buyFrom.exchange} → {o.sellTo.exchange}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatPrice(o.buyFrom.priceUsd)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatPrice(o.sellTo.priceUsd)}</td>
                  <td className="px-4 py-3 font-medium text-emerald-400">
                    +{o.priceDiffPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatUsd(o.minLiquidityUsd)}</td>
                  <td className="px-4 py-3 text-slate-500">Not available</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CONFIDENCE_STYLES[o.confidence]}`}
                    >
                      {o.confidence}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SourceBadge source={o.buyFrom.source} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-600">
        Gas estimates require an on-chain gas-oracle/RPC provider, not yet integrated — shown as "Not
        available" rather than a guessed number. Confidence reflects pool count, liquidity depth, and
        spread size only; it isn't a profitability guarantee.
      </p>
    </div>
  )
}
