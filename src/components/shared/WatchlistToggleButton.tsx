import type { MouseEvent } from "react"
import type { IconType } from "react-icons"
import { FiStar } from "react-icons/fi"

interface WatchlistToggleButtonProps {
  active: boolean
  onToggle: () => void
  size?: number
  className?: string
  /** Defaults to the watchlist star icon. Pass a different icon (e.g. FiHeart) to reuse this button for a different toggle, such as Favorites. */
  icon?: IconType
  activeLabel?: string
  inactiveLabel?: string
}

/**
 * Reusable toggle button for adding/removing an item from a
 * localStorage-backed list — the Watchlist (hooks/useWatchlist.ts) by
 * default, or any similar toggle (e.g. Favorites, hooks/useFavorites.ts)
 * via the `icon`/`activeLabel`/`inactiveLabel` overrides. Stops click
 * propagation so it can be nested inside a clickable card (e.g.
 * SearchResultCard) without also triggering the card's own onSelect.
 */
export function WatchlistToggleButton({
  active,
  onToggle,
  size = 18,
  className = "",
  icon: Icon = FiStar,
  activeLabel = "Remove from watchlist",
  inactiveLabel = "Add to watchlist",
}: WatchlistToggleButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onToggle()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? activeLabel : inactiveLabel}
      className={`shrink-0 rounded-md p-1.5 transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${className}`}
    >
      <Icon size={size} className={active ? "fill-amber-400 text-amber-400" : "text-slate-500"} aria-hidden="true" />
    </button>
  )
}
