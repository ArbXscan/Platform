import { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { FiSearch } from "react-icons/fi"
import { EmptyState } from "../../components/shared/EmptyState"
import { SearchResultCard } from "../../components/shared/SearchResultCard"
import { Skeleton } from "../../components/ui/Skeleton"
import { useSearch } from "../../hooks/useSearch"
import type { TokenSearchResult } from "../../types/token"

function ResultCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-56" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const navigate = useNavigate()

  const { results, status, error } = useSearch(query)
  const isInitialLoad = status === "loading" && results.length === 0

  const groupedByChain = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of results) counts.set(r.chainId, (counts.get(r.chainId) ?? 0) + 1)
    return counts
  }, [results])

  function handleSelect(result: TokenSearchResult) {
    // Navigate using the exact contract address rather than the free-text query.
    // DexScreener search on a full address is unambiguous, so Token Detail
    // resolves the SAME token the user just picked — no re-guessing, no
    // liquidity-only reselection. Token Detail itself is unchanged.
    navigate(`/app/token/${result.address}`)
  }

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-white">Search Results</h1>
      <p className="mt-2 text-sm text-slate-400">
        {query ? (
          <>
            Showing candidates for <span className="text-slate-300">"{query}"</span>
            {groupedByChain.size > 1 && ` across ${groupedByChain.size} chains`}. Select the token you mean.
          </>
        ) : (
          "Enter a token name, symbol, or contract address to search."
        )}
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          Couldn't load search results: {error}
        </div>
      )}

      {!error && (
        <div className="mt-6 space-y-3">
          {isInitialLoad &&
            Array.from({ length: 5 }).map((_, i) => <ResultCardSkeleton key={i} />)}

          {!isInitialLoad && query && results.length === 0 && (
            <EmptyState
              icon={FiSearch}
              title={`No tokens found for "${query}"`}
              description="Check the spelling, try the token's symbol instead of its name, or paste the contract address directly."
            />
          )}

          {!isInitialLoad &&
            results.map((result) => (
              <SearchResultCard
                key={`${result.chainId}:${result.address}`}
                result={result}
                onSelect={handleSelect}
              />
            ))}
        </div>
      )}
    </div>
  )
}
