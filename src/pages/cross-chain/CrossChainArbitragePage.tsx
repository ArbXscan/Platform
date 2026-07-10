import { useMemo, useState } from "react"
import { FiRefreshCw, FiX, FiZap } from "react-icons/fi"
import { ChainLogo } from "../../components/shared/ChainLogo"
import { DexLogo } from "../../components/shared/DexLogo"
import { EmptyState } from "../../components/shared/EmptyState"
import { Select } from "../../components/ui/Select"
import { TableRowSkeleton } from "../../components/ui/Skeleton"
import { getChainById, SUPPORTED_CHAINS } from "../../constants/chains"
import type { CrossChainRecommendationAction, CrossChainRiskLevel } from "../../features/cross-chain"
import type { CrossChainArbitrageRow } from "../../hooks/useCrossChainArbitrage"
import { useCrossChainArbitrage } from "../../hooks/useCrossChainArbitrage"

type SortKey = "profit" | "roi" | "spread" | "confidence"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "profit", label: "Highest Profit" },
  { value: "roi", label: "Highest ROI" },
  { value: "spread", label: "Highest Spread" },
  { value: "confidence", label: "Highest Confidence" },
]

const ALL_CHAINS = "all"
const ALL_DEXES = "all"

const RECOMMENDATION_STYLES: Record<CrossChainRecommendationAction, string> = {
  BUY: "bg-emerald-400/10 text-emerald-300",
  SKIP: "bg-slate-400/10 text-slate-400",
  AVOID: "bg-red-400/10 text-red-300",
}

const RISK_STYLES: Record<CrossChainRiskLevel, string> = {
  LOW: "bg-emerald-400/10 text-emerald-300",
  MEDIUM: "bg-amber-400/10 text-amber-300",
  HIGH: "bg-red-400/10 text-red-300",
}

function formatUsd(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "N/A"
  return `$${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`
}

function formatPercent(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "N/A"
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

function chainLabel(chainId: string): string {
  return getChainById(chainId)?.name ?? chainId
}

function sortValue(row: CrossChainArbitrageRow, key: SortKey): number {
  switch (key) {
    case "profit":
      return row.profit.netProfitUsd ?? Number.NEGATIVE_INFINITY
    case "roi":
      return row.profit.roiPercent ?? Number.NEGATIVE_INFINITY
    case "spread":
      return row.opportunity.spreadPercent
    case "confidence":
      return row.recommendation.confidenceScore
  }
}

function rowKey(row: CrossChainArbitrageRow): string {
  return `${row.opportunity.token}:${row.opportunity.sourceChain}:${row.opportunity.destinationChain}:${row.opportunity.sourceDex}:${row.opportunity.destinationDex}`
}

export default function CrossChainArbitragePage() {
  const { rows, status, error, refresh } = useCrossChainArbitrage()
  const [chainFilter, setChainFilter] = useState(ALL_CHAINS)
  const [dexFilter, setDexFilter] = useState(ALL_DEXES)
  const [minSpread, setMinSpread] = useState("")
  const [minRoi, setMinRoi] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("profit")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const isInitialLoad = status === "loading" && rows.length === 0
  const isRefreshing = status === "loading"

  const dexOptions = useMemo(() => {
    const dexes = new Set<string>()
    for (const row of rows) {
      dexes.add(row.opportunity.sourceDex)
      dexes.add(row.opportunity.destinationDex)
    }
    return Array.from(dexes).sort()
  }, [rows])

  const filteredRows = useMemo(() => {
    const minSpreadValue = minSpread.trim() === "" ? undefined : Number(minSpread)
    const minRoiValue = minRoi.trim() === "" ? undefined : Number(minRoi)

    const filtered = rows.filter((row) => {
      if (chainFilter !== ALL_CHAINS) {
        if (row.opportunity.sourceChain !== chainFilter && row.opportunity.destinationChain !== chainFilter) {
          return false
        }
      }
      if (dexFilter !== ALL_DEXES) {
        if (row.opportunity.sourceDex !== dexFilter && row.opportunity.destinationDex !== dexFilter) {
          return false
        }
      }
      if (minSpreadValue !== undefined && Number.isFinite(minSpreadValue)) {
        if (row.opportunity.spreadPercent < minSpreadValue) return false
      }
      if (minRoiValue !== undefined && Number.isFinite(minRoiValue)) {
        if ((row.profit.roiPercent ?? Number.NEGATIVE_INFINITY) < minRoiValue) return false
      }
      return true
    })

    return [...filtered].sort((a, b) => sortValue(b, sortKey) - sortValue(a, sortKey))
  }, [rows, chainFilter, dexFilter, minSpread, minRoi, sortKey])

  const selectedRow = filteredRows.find((row) => rowKey(row) === selectedKey)

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cross-Chain Arbitrage</h1>
          <p className="mt-1 text-sm text-slate-400">
            Same-asset price spreads detected across every supported chain.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={isRefreshing}
          aria-label="Refresh cross-chain opportunities"
          title="Refresh cross-chain opportunities"
          className="shrink-0 self-start rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-40 md:self-auto"
        >
          <FiRefreshCw className={isRefreshing ? "animate-spin" : ""} aria-hidden="true" />
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          Couldn't load cross-chain opportunities: {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Chain"
          value={chainFilter}
          onChange={setChainFilter}
          options={[
            { value: ALL_CHAINS, label: "All Chains" },
            ...SUPPORTED_CHAINS.map((chain) => ({ value: chain.id, label: chain.name })),
          ]}
        />
        <Select
          label="DEX"
          value={dexFilter}
          onChange={setDexFilter}
          options={[{ value: ALL_DEXES, label: "All DEXs" }, ...dexOptions.map((dex) => ({ value: dex, label: dex }))]}
        />
        <div className="relative">
          <label htmlFor="min-spread" className="sr-only">
            Minimum spread percent
          </label>
          <input
            id="min-spread"
            type="number"
            inputMode="decimal"
            value={minSpread}
            onChange={(e) => setMinSpread(e.target.value)}
            placeholder="Min. Spread %"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
        <div className="relative">
          <label htmlFor="min-roi" className="sr-only">
            Minimum ROI percent
          </label>
          <input
            id="min-roi"
            type="number"
            inputMode="decimal"
            value={minRoi}
            onChange={(e) => setMinRoi(e.target.value)}
            placeholder="Min. ROI %"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end">
        <Select label="Sort by" value={sortKey} onChange={setSortKey} options={SORT_OPTIONS} className="w-48" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] xl:col-span-2">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Token</th>
                <th className="px-4 py-3 font-medium">Buy Chain</th>
                <th className="px-4 py-3 font-medium">Sell Chain</th>
                <th className="px-4 py-3 font-medium">Buy DEX</th>
                <th className="px-4 py-3 font-medium">Sell DEX</th>
                <th className="px-4 py-3 font-medium">Spread %</th>
                <th className="px-4 py-3 font-medium">Liquidity</th>
                <th className="px-4 py-3 font-medium">Est. Profit</th>
                <th className="px-4 py-3 font-medium">ROI</th>
                <th className="px-4 py-3 font-medium">Recommendation</th>
                <th className="px-4 py-3 font-medium">Confidence</th>
                <th className="px-4 py-3 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isInitialLoad && Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={12} />)}

              {!isInitialLoad && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-10">
                    <EmptyState
                      icon={FiZap}
                      title="No cross-chain opportunities found"
                      description="Try adjusting your filters, or refresh to scan again."
                    />
                  </td>
                </tr>
              )}

              {!isInitialLoad &&
                filteredRows.map((row) => {
                  const key = rowKey(row)
                  const isSelected = key === selectedKey
                  return (
                    <tr
                      key={key}
                      onClick={() => setSelectedKey(isSelected ? null : key)}
                      className={`cursor-pointer transition-colors hover:bg-white/[0.04] ${
                        isSelected ? "bg-cyan-400/[0.06]" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-white">{row.opportunity.symbol}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <ChainLogo chainId={row.opportunity.sourceChain} size={14} />
                          {chainLabel(row.opportunity.sourceChain)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <ChainLogo chainId={row.opportunity.destinationChain} size={14} />
                          {chainLabel(row.opportunity.destinationChain)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <DexLogo dexId={row.opportunity.sourceDex} size={14} />
                          {row.opportunity.sourceDex}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <DexLogo dexId={row.opportunity.destinationDex} size={14} />
                          {row.opportunity.destinationDex}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-emerald-400">
                        {formatPercent(row.opportunity.spreadPercent)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{formatUsd(row.opportunity.liquidity)}</td>
                      <td className="px-4 py-3 text-slate-300">{formatUsd(row.profit.netProfitUsd)}</td>
                      <td className="px-4 py-3 text-slate-300">{formatPercent(row.profit.roiPercent)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RECOMMENDATION_STYLES[row.recommendation.recommendation]}`}
                        >
                          {row.recommendation.recommendation}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{row.recommendation.confidenceScore}/100</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RISK_STYLES[row.recommendation.riskLevel]}`}
                        >
                          {row.recommendation.riskLevel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        <div className="xl:col-span-1">
          {!selectedRow ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <EmptyState
                icon={FiZap}
                title="No opportunity selected"
                description="Click a row in the table to see its full profit breakdown and recommendation."
              />
            </div>
          ) : (
            <div className="sticky top-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{selectedRow.opportunity.symbol}</h2>
                <button
                  type="button"
                  onClick={() => setSelectedKey(null)}
                  aria-label="Close detail panel"
                  className="rounded-md p-1 text-slate-500 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <FiX aria-hidden="true" />
                </button>
              </div>

              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Buy Price</dt>
                  <dd className="text-white">{formatUsd(selectedRow.opportunity.buyPrice)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Sell Price</dt>
                  <dd className="text-white">{formatUsd(selectedRow.opportunity.sellPrice)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Spread</dt>
                  <dd className="text-emerald-400">{formatPercent(selectedRow.opportunity.spreadPercent)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                  <dt className="text-slate-500">Gross Profit</dt>
                  <dd className="text-white">{formatUsd(selectedRow.profit.grossProfitUsd)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Net Profit</dt>
                  <dd className="text-white">{formatUsd(selectedRow.profit.netProfitUsd)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Total Fees</dt>
                  <dd className="text-white">{formatUsd(selectedRow.profit.totalFeesUsd)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">ROI</dt>
                  <dd className="text-white">{formatPercent(selectedRow.profit.roiPercent)}</dd>
                </div>

                <div className="border-t border-white/5 pt-2.5">
                  <dt className="mb-1.5 flex items-center justify-between text-slate-500">
                    Recommendation
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RECOMMENDATION_STYLES[selectedRow.recommendation.recommendation]}`}
                    >
                      {selectedRow.recommendation.recommendation}
                    </span>
                  </dt>
                  <dd className="text-slate-300">{selectedRow.recommendation.summary}</dd>
                </div>

                <div>
                  <dt className="mb-1.5 text-slate-500">Reasons</dt>
                  <dd>
                    <ul className="list-inside list-disc space-y-1 text-slate-300">
                      {selectedRow.recommendation.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
