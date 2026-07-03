import { ChainLogo } from "./ChainLogo"
import { DexLogo } from "./DexLogo"
import { TokenLogo } from "./TokenLogo"
import { getChainById } from "../../constants/chains"
import type { TokenSearchResult } from "../../types/token"

function formatUsd(value: number): string {
  return `$${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

interface SearchResultCardProps {
  result: TokenSearchResult
  onSelect: (result: TokenSearchResult) => void
}

export function SearchResultCard({ result, onSelect }: SearchResultCardProps) {
  const chainName = getChainById(result.chainId)?.name ?? result.chainId

  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-cyan-400/30 hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
    >
      <TokenLogo logoUrl={result.logoUrl} symbol={result.symbol} size={36} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-white">{result.name}</span>
          <span className="shrink-0 text-sm text-slate-400">{result.symbol}</span>
          {result.isRecognized && (
            <span className="shrink-0 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cyan-300">
              Recognized
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ChainLogo chainId={result.chainId} size={14} />
            {chainName}
          </span>
          <span className="flex items-center gap-1.5">
            <DexLogo dexId={result.dexId} size={14} />
            {result.dexId}
          </span>
          <span>{truncateAddress(result.address)}</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="text-xs uppercase tracking-wide text-slate-500">Liquidity</div>
        <div className="text-sm font-medium text-white">{formatUsd(result.liquidityUsd)}</div>
      </div>
    </button>
  )
}
