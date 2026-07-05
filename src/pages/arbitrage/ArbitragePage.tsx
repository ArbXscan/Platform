import { useMemo, useState } from "react"
import { FiZap } from "react-icons/fi"
import { ChainLogo } from "../../components/shared/ChainLogo"
import { DexActionPanel } from "../../components/shared/DexActionPanel"
import { DexLogo } from "../../components/shared/DexLogo"
import { EmptyState } from "../../components/shared/EmptyState"
import { SourceBadge } from "../../components/shared/SourceBadge"
import { Select } from "../../components/ui/Select"
import { TableRowSkeleton } from "../../components/ui/Skeleton"
import { Tooltip } from "../../components/ui/Tooltip"
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS, getChainById } from "../../constants/chains"
import { useArbitrage } from "../../hooks/useArbitrage"
import { useVerifyOpportunity } from "../../hooks/useVerifyOpportunity"
import type { ConfidenceLevel } from "../../types/api"
import type { ArbitrageOpportunity } from "../../types/arbitrage"
import type { VerificationOutcome } from "../../types/verification"

const CONFIDENCE_ORDER: Record<ConfidenceLevel, number> = { unknown: 0, low: 1, medium: 2, high: 3 }

const CONFIDENCE_STYLES: Record<ConfidenceLevel, string> = {
  high: "bg-emerald-400/10 text-emerald-300",
  medium: "bg-amber-400/10 text-amber-300",
  low: "bg-orange-400/10 text-orange-300",
  unknown: "bg-slate-400/10 text-slate-400",
}

const VERIFICATION_STYLES: Record<VerificationOutcome, string> = {
  actionable: "bg-emerald-400/10 text-emerald-300",
  stale: "bg-amber-400/10 text-amber-300",
  invalid: "bg-red-400/10 text-red-300",
  unverifiable: "bg-slate-400/10 text-slate-400",
}

type SortKey = "spread" | "liquidity" | "confidence"

type OpportunityRowData = ArbitrageOpportunity & { minLiquidityUsd: number }

const CHAIN_OPTIONS = SUPPORTED_CHAINS.map((chain) => ({ value: chain.id, label: chain.name }))
const CONFIDENCE_OPTIONS: { value: ConfidenceLevel; label: string }[] = [
  { value: "unknown", label: "All confidence levels" },
  { value: "low", label: "Low+" },
  { value: "medium", label: "Medium+" },
  { value: "high", label: "High only" },
]
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "spread", label: "Sort: Spread %" },
  { value: "liquidity", label: "Sort: Liquidity" },
  { value: "confidence", label: "Sort: Confidence" },
]

function formatUsd(value: number): string {
  return `$${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`
}

function formatPrice(value: number): string {
  return value < 1 ? `$${value.toPrecision(4)}` : `$${value.toFixed(2)}`
}

function formatVerifiedAt(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

/**
 * One opportunity row, including its own Verify action. Verification is
 * on-demand and per-opportunity (see hooks/useVerifyOpportunity.ts), so each
 * row owns its own hook instance/state rather than sharing one at the page
 * level — this keeps verifying one row from affecting any other row's status.
 */
function OpportunityRow({ opportunity }: { opportunity: OpportunityRowData }) {
  const { result, status, error, verify } = useVerifyOpportunity()

  return (
    <tr className="transition-colors hover:bg-white/[0.02]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <ChainLogo chainId={opportunity.token.chainId} size={18} />
          <div>
            <div className="font-medium text-white">{opportunity.token.symbol}</div>
            <div className="text-xs text-slate-500">
              {getChainById(opportunity.token.chainId)?.name ?? opportunity.token.chainId}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-300">
        <span className="flex items-center gap-1.5">
          <DexLogo dexId={opportunity.buyFrom.exchange} size={16} />
          {opportunity.buyFrom.exchange}
          <span aria-hidden="true">→</span>
          <DexLogo dexId={opportunity.sellTo.exchange} size={16} />
          {opportunity.sellTo.exchange}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-300">{formatPrice(opportunity.buyFrom.priceUsd)}</td>
      <td className="px-4 py-3 text-slate-300">{formatPrice(opportunity.sellTo.priceUsd)}</td>
      <td className="px-4 py-3 font-medium text-emerald-400">+{opportunity.priceDiffPercent.toFixed(2)}%</td>
      <td className="px-4 py-3 text-slate-300">{formatUsd(opportunity.minLiquidityUsd)}</td>
      <td className="px-4 py-3 text-slate-500">Not available</td>
      <td className="px-4 py-3">
        <Tooltip content="Reflects pool count, liquidity depth, and spread size only — not gas cost, execution risk, or a profitability guarantee.">
          <span
            tabIndex={0}
            className={`inline-flex cursor-default rounded-full px-2 py-0.5 text-xs font-medium ${CONFIDENCE_STYLES[opportunity.confidence]}`}
          >
            {opportunity.confidence}
          </span>
        </Tooltip>
      </td>
      <td className="px-4 py-3">
        <SourceBadge source={opportunity.buyFrom.source} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col items-start gap-1">
          <button
            type="button"
            onClick={() => verify(opportunity)}
            disabled={status === "loading"}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? "Verifying…" : "Verify"}
          </button>

          {result && (
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${VERIFICATION_STYLES[result.outcome]}`}
                >
                  {result.outcome}
                </span>
                <span className="text-xs text-slate-500">{formatVerifiedAt(result.verifiedAt)}</span>
              </div>
              <DexActionPanel opportunity={opportunity} />
            </div>
          )}

          {status === "error" && error && <div className="text-xs text-red-400">{error}</div>}
        </div>
      </td>
    </tr>
  )
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

  const isInitialLoad = status === "loading" && opportunities.length === 0

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-white">Arbitrage Scanner</h1>
      <p className="mt-2 text-sm text-slate-400">
        Cross-DEX price spreads for currently trending tokens, sourced from DexScreener.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select value={chainId} onChange={setChainId} options={CHAIN_OPTIONS} label="Filter by chain" className="w-40" />
        <Select
          value={minConfidence}
          onChange={(v) => setMinConfidence(v)}
          options={CONFIDENCE_OPTIONS}
          label="Filter by confidence"
          className="w-48"
        />
        <Select value={sortKey} onChange={(v) => setSortKey(v)} options={SORT_OPTIONS} label="Sort by" className="w-44" />
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          Couldn't load arbitrage data: {error}
        </div>
      )}

      {!error && !isInitialLoad && filtered.length === 0 && (
        <EmptyState
          icon={FiZap}
          title="No cross-DEX spreads found"
          description="Nothing crossed the confidence/chain filter for the current trending set. Try a different chain or lower the confidence filter."
        />
      )}

      {!error && (isInitialLoad || filtered.length > 0) && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-950/95 text-xs uppercase tracking-wide text-slate-400 backdrop-blur">
              <tr>
                <th scope="col" className="px-4 py-3">Token</th>
                <th scope="col" className="px-4 py-3">Route</th>
                <th scope="col" className="px-4 py-3">Buy Price</th>
                <th scope="col" className="px-4 py-3">Sell Price</th>
                <th scope="col" className="px-4 py-3">Spread</th>
                <th scope="col" className="px-4 py-3">Liquidity</th>
                <th scope="col" className="px-4 py-3">Gas Estimate</th>
                <th scope="col" className="px-4 py-3">Confidence</th>
                <th scope="col" className="px-4 py-3">Updated</th>
                <th scope="col" className="px-4 py-3">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isInitialLoad
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={10} />)
                : filtered.map((o) => <OpportunityRow key={o.id} opportunity={o} />)}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-600">
        Gas estimates require an on-chain gas-oracle/RPC provider, not yet integrated — shown as "Not
        available" rather than a guessed number. Confidence reflects pool count, liquidity depth, and
        spread size only; it isn't a profitability guarantee. Verification re-quotes an opportunity
        against live data on demand — it does not run automatically.
      </p>
    </div>
  )
}