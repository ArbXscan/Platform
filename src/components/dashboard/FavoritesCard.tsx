import { Link } from "react-router-dom"
import { FiHeart } from "react-icons/fi"
import { ChainLogo } from "../shared/ChainLogo"
import { EmptyState } from "../shared/EmptyState"
import { TokenLogo } from "../shared/TokenLogo"
import { WatchlistToggleButton } from "../shared/WatchlistToggleButton"
import { getChainById } from "../../constants/chains"
import { useFavorites } from "../../hooks/useFavorites"

/**
 * Dashboard shortcut list of the user's favorited arbitrage opportunities,
 * stored locally on this device (hooks/useFavorites.ts). Distinct from the
 * Watchlist card: this tracks specific detected opportunities (token plus
 * buy/sell route), favorited from the Arbitrage Scanner page.
 */
export function FavoritesCard() {
  const { favorites, remove } = useFavorites()

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Favorites</h2>
        <Link to="/app/arbitrage" className="text-xs text-cyan-300 hover:underline">
          View all
        </Link>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon={FiHeart}
          title="No favorited opportunities yet"
          description="Heart an opportunity on the Arbitrage Scanner page to track it here."
        />
      ) : (
        <div className="divide-y divide-white/5">
          {favorites.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <TokenLogo logoUrl={entry.logoUrl} symbol={entry.tokenSymbol} size={24} />
                <span className="truncate font-medium text-white">{entry.tokenSymbol}</span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
                  <ChainLogo chainId={entry.chainId} size={12} />
                  {getChainById(entry.chainId)?.name ?? entry.chainId}
                </span>
                <span className="hidden shrink-0 text-xs text-slate-500 sm:inline">
                  {entry.buyExchange} <span aria-hidden="true">→</span> {entry.sellExchange}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-medium text-emerald-400">+{entry.priceDiffPercent.toFixed(2)}%</span>
                <WatchlistToggleButton
                  active
                  onToggle={() => remove(entry.id)}
                  icon={FiHeart}
                  activeLabel="Remove from favorites"
                  inactiveLabel="Add to favorites"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
