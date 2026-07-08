import { useNavigate } from "react-router-dom"
import { FiClock, FiSearch, FiX } from "react-icons/fi"
import { EmptyState } from "../shared/EmptyState"
import { useRecentSearches } from "../../hooks/useRecentSearches"

function formatSearchedAt(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Dashboard's fuller search history view — same underlying data as
 * RecentSearchesCard (hooks/useRecentSearches.ts), rendered as a
 * timestamped list instead of a compact chip row. Both cards read the same
 * localStorage-backed list; nothing here is a second, separate history.
 */
export function SearchHistoryCard() {
  const { recentSearches, remove, clear } = useRecentSearches()
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Search History</h2>
        {recentSearches.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            Clear all
          </button>
        )}
      </div>

      {recentSearches.length === 0 ? (
        <EmptyState
          icon={FiClock}
          title="No search history yet"
          description="Every token you search for is recorded here, most recent first."
        />
      ) : (
        <div className="max-h-72 divide-y divide-white/5 overflow-y-auto">
          {recentSearches.map((entry) => (
            <div key={entry.term} className="group flex items-center justify-between gap-3 py-2.5 text-sm">
              <button
                type="button"
                onClick={() => navigate(`/app/search?q=${encodeURIComponent(entry.term)}`)}
                className="flex min-w-0 items-center gap-2 text-left text-slate-300 transition-colors hover:text-white"
              >
                <FiSearch className="shrink-0 text-slate-600" aria-hidden="true" />
                <span className="truncate">{entry.term}</span>
              </button>
              <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                {formatSearchedAt(entry.searchedAt)}
                <button
                  type="button"
                  onClick={() => remove(entry.term)}
                  aria-label={`Remove "${entry.term}" from search history`}
                  className="rounded-full p-0.5 opacity-0 transition-opacity hover:text-slate-300 group-hover:opacity-100 focus:opacity-100"
                >
                  <FiX size={12} aria-hidden="true" />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
