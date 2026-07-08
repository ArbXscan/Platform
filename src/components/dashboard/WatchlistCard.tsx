import { useNavigate } from "react-router-dom"
import { FiStar } from "react-icons/fi"
import { ChainLogo } from "../shared/ChainLogo"
import { EmptyState } from "../shared/EmptyState"
import { TokenLogo } from "../shared/TokenLogo"
import { WatchlistToggleButton } from "../shared/WatchlistToggleButton"
import { getChainById } from "../../constants/chains"
import { useWatchlist } from "../../hooks/useWatchlist"

/**
 * Dashboard shortcut list of tokens the user has starred, stored locally on
 * this device (hooks/useWatchlist.ts) — the same watchlist Search Results
 * and Token Detail read/write, so starring a token anywhere in the app
 * shows up here too.
 */
export function WatchlistCard() {
  const { watchlist, toggle } = useWatchlist()
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h2 className="mb-3 text-lg font-semibold text-white">Watchlist</h2>

      {watchlist.length === 0 ? (
        <EmptyState
          icon={FiStar}
          title="No tokens watchlisted yet"
          description="Star a token from search results or its detail page to track it here."
        />
      ) : (
        <div className="divide-y divide-white/5">
          {watchlist.map((entry) => (
            <div key={`${entry.chainId}:${entry.address}`} className="flex items-center justify-between py-2.5">
              <button
                type="button"
                onClick={() => navigate(`/app/token/${entry.address}`)}
                className="flex min-w-0 items-center gap-2 text-left text-sm transition-colors hover:text-cyan-300"
              >
                <TokenLogo logoUrl={entry.logoUrl} symbol={entry.symbol} size={24} />
                <span className="truncate font-medium text-white">{entry.symbol}</span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
                  <ChainLogo chainId={entry.chainId} size={12} />
                  {getChainById(entry.chainId)?.name ?? entry.chainId}
                </span>
              </button>
              <WatchlistToggleButton active onToggle={() => toggle(entry)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
