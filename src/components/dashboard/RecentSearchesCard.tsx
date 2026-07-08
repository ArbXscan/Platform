import { useNavigate } from "react-router-dom"
import { FiClock, FiX } from "react-icons/fi"
import { EmptyState } from "../shared/EmptyState"
import { useRecentSearches } from "../../hooks/useRecentSearches"

/**
 * Dashboard shortcut list of the user's own recent search terms, stored
 * locally on this device (hooks/useRecentSearches.ts) — there is no
 * backend/account system yet to sync this across devices.
 */
export function RecentSearchesCard() {
  const { recentSearches, remove, clear } = useRecentSearches()
  const navigate = useNavigate()
  const preview = recentSearches.slice(0, 8)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Searches</h2>
        {recentSearches.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      {recentSearches.length === 0 ? (
        <EmptyState
          icon={FiClock}
          title="No recent searches yet"
          description="Tokens you search for will show up here."
        />
      ) : (
        <ul className="flex flex-wrap gap-2">
          {preview.map((entry) => (
            <li
              key={entry.term}
              className="group flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-3 pr-1.5 text-xs text-slate-300"
            >
              <button
                type="button"
                onClick={() => navigate(`/app/search?q=${encodeURIComponent(entry.term)}`)}
                className="transition-colors hover:text-white"
              >
                {entry.term}
              </button>
              <button
                type="button"
                onClick={() => remove(entry.term)}
                aria-label={`Remove "${entry.term}" from recent searches`}
                className="rounded-full p-0.5 text-slate-600 opacity-0 transition-opacity hover:text-slate-300 group-hover:opacity-100 focus:opacity-100"
              >
                <FiX size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
